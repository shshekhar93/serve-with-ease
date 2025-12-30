const { default: mime } = require('mime/lite');

function getMimeType(pathOrExt) {
  return mime.getType(pathOrExt);
}

module.exports = {
  getMimeType
};
