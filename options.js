const path = require('path');
const os = require('os');

/**
 * @typedef {Object} Options
 * @property {string} basePath - The base path to serve files from.
 * @property {'header' | 'subdomain' | 'none'} [routingStrategy] - The routing strategy to use -- 'header', 'subdomain', or 'none' (default).
 * @property {string} [routingHeaderKey] - The name of the header to use for routing (default is 'x-site-identifier').
 * @property {string} [baseDomain] - The base domain to use for routing, subdomains of this will be used as site identifiers (required if routingStrategy is 'subdomain').
 * @property {{[k: string]: string}} [routeMap] - A map of 'site identifier' to folder (relative to basepath). If not provided, 'site identifiers' map to folders of the same name.
 */

/**
 * Parses command line arguments to extract server options.
 * @returns {Options}
 */
function options() {
  if (process.argv.length < 3) {
    console.error('No config file specified. Usage: node index.js <config-file-path>');
    process.exit(1);
  }

  const configPath = process.argv[2];
  try {
    const config = require(configPath);

    if (!config.basePath) {
      console.error('Config file must specify a basePath.');
      process.exit(1);
    }

    if(config.basePath.startsWith('~')) {
      config.basePath = require('path').join(os.homedir(), config.basePath.slice(1));
    }

    if (config.basePath.endsWith('.')) {
      config.basePath = path.resolve(config.basePath);
    }

    return config;
  } catch (e) {
    console.error(`Failed to load config from ${configPath}:`, e);
    process.exit(1);
  }
}

module.exports = {
  options,
};
