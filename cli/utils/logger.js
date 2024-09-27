import winston from 'winston';

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple()
  ),
});

// logger.log('info', 'info message');
// logger.log('error', 'error message');
// logger.log('warn', 'warn message');
// logger.log('debug', 'debug message');

export default logger;
