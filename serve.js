const { join } = require('path');
const { promisify } = require('util');
const { fstat, readFileSync } = require('fs');
const { open } = require('fs/promises');
const { createServer } = require('http');
const { getMimeType } = require('./mime-types.js');

const pfstat = promisify(fstat);

const SiteIdentifierHeader = 'x-site-identifier';
const SupportedMethods = ['GET', 'OPTIONS'];
const EISDIR = new Error('EISDIR');
const EACCESS = new Error('EACCESS');

const template = readFileSync(require.resolve('./template.html'), 'utf-8');

/**
 * 
 * @param {import('./options.js').Options} options 
 * @returns 
 */
function createHandler(options) {
  const { basePath } = options;
  return async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    if (!SupportedMethods.includes(req.method)) {
      res.writeHead(405);
      res.end('Method Not Supported')
      return;
    }
    
    // Disallow all relative paths in url
    if (req.url.includes('./')) {
      res.writeHead(404, 'Not Found');
      res.end("Not Found");
      return;
    }

    const path = resolveFilePath(req, options);
    const fullPath = join(basePath, path);
    try {
      if (fullPath === basePath) {
        // Don't allow root access
        throw EACCESS;
      }

      const handle = await open(fullPath, 'r')
      // Ensure we close the file handle when done
      res.on('end', () => {
        handle.close();
      });

      const stats = await pfstat(handle.fd)
      if(stats.isDirectory()) {
        throw EISDIR
      }

      const mimeType = getMimeType(fullPath);
      const stream = handle.createReadStream();
      res.writeHead(200, {
        'Content-Type': mimeType,
      });
      stream.pipe(res);
    }
    catch(e) {
      console.error('Error processing request:', e?.message ?? e);

      if (e === EACCESS) {
        // Handle access denied
        res.writeHead(403, {
          'Content-Type': getMimeType('html'),
        });
        res.end(template.
          replaceAll('${title}', 'Access Denied').
          replaceAll('${message}', 'You do not have permission to access this resource.'));
        return;
      }

      if (e === EISDIR) {
        // Handle dir
        // For now error away
        res.writeHead(403, {
          'Content-Type': getMimeType('html'),
        });
        res.end(template.
          replaceAll('${title}', 'Directory listing forbidden').
          replaceAll('${message}', 'This server does not allow listing directories.'));
        return;
      }

      if (e.code === 'ENOENT') {
        // Handle not found
        res.writeHead(404, {
          'Content-Type': getMimeType('html'),
        });
        res.end(template.
          replaceAll('${title}', 'Not Found').
          replaceAll('${message}', 'The requested resource could not be found on this server.'));
        return;
      }

      res.writeHead(500, {
        'Content-Type': getMimeType('html'),
      });
      res.end(template.
        replaceAll('${title}', 'Internal Server Error').
        replaceAll('${message}', 'An internal server error occurred.'));
    }
  };
}

function serve(handler) {
  createServer(handler).listen(process.env.PORT ?? 3000);
}

function resolveFilePath(req, options) {
  const url = req.url || '/';
  let path = url.split('?')[0];
  const siteIdentifier = getSiteIdentifierFromRequest(req, options);

  path = join(siteIdentifier, path);

  if(path === '/') {
    return '';
  }

  if(path.endsWith('/')) {
    path += 'index.html';
  }
  return path;
}

function getSiteIdentifierFromRequest(req, options) {
  if (options.routingStrategy === 'header') {
    const headerKey = options.routingHeaderKey || SiteIdentifierHeader;
    return req.headers[headerKey.toLowerCase()] || '';
  }

  if (options.routingStrategy === 'subdomain') {
    const host = req.headers['host'];
    if (!host || !options.baseDomain) {
      return '';
    }
    const baseDomainIndex = host.indexOf(options.baseDomain);
    if (baseDomainIndex <= 0) {
      return '';
    }
    const subdomainPart = host.slice(0, baseDomainIndex - 1); // Remove the dot before base domain
    return subdomainPart || '';
  }

  return '';
}

module.exports = {
  createHandler,
  serve,
};
