const { join } = require('path');
const { promisify } = require('util');
const { fstat, readFileSync } = require('fs');
const { open } = require('fs/promises');
const { createServer } = require('http');
const { getMimeType } = require('./mime-types.js');

const pfstat = promisify(fstat);

const SupportedMethods = ['GET', 'OPTIONS'];
const EISDIR = new Error('EISDIR');

const template = readFileSync(require.resolve('./template.html'), 'utf-8');

/**
 * 
 * @param {import('./options.js').Options} options 
 * @returns 
 */
function createHandler({
  basePath,
}) {
  return async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    if (!SupportedMethods.includes(req.method)) {
      res.writeHead(405);
      res.end('Method Not Supported')
      return;
    }

    const path = urlToFilePath(req.url)

    // Disallow all relative paths
    if (path.includes('./')) {
      res.writeHead(404, 'Not Found');
      res.end("Not Found");
      return;
    }

    const fullPath = join(basePath, path);
    try {
      const handle = await open(fullPath, 'r')
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
      console.error(e?.message ?? e);
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

function urlToFilePath(url) {
  let path = url.split('?')[0];

  if(path.endsWith('/')) {
    path += 'index.html';
  }
  return path;
}

module.exports = {
  createHandler,
  serve,
};
