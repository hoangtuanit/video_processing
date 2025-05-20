
require('module-alias/register');
const dotenv = require('dotenv');
dotenv.config();

require('@infrastructure/http/server');
