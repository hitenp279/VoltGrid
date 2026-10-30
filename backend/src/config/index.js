const path = require('path');
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8000,
  altPort: process.env.ALT_PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  dbFile: process.env.DB_FILE || path.join(__dirname, '../../voltgrid.db')
};
