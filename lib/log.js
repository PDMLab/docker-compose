'use strict';

const winston = require('winston');

const LEVELS = {
  fatal: 0,
  error: 1,
  info: 2,
  warn: 3,
  debug: 4
};

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      colorize: true,
      json: false,
      stringify: true
    })
  ],
  levels: LEVELS
});

module.exports = logger;
