const { options } = require('./options');
const { serve, createHandler } = require('./serve');

serve(createHandler(options()));
