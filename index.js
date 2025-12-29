const { serve, createHandler } = require('./serve');
const path = require('path');

serve(createHandler({ 
  basePath: path.resolve('./test') 
}));
