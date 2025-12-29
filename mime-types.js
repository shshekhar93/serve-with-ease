const { extname } = require('path');

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  txt: "text/plain",
  js: "text/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpeg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
};

function getMimeType(path) {
  // if extension is provided, return fast 
  if(MIME_TYPES[path]) {
    return MIME_TYPES[path]
  };

  return MIME_TYPES[extname(path).substring(1).toLowerCase()] ?? MIME_TYPES.default;
}

module.exports = {
  getMimeType
};
