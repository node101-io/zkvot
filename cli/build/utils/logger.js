import winston from 'winston';
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'debug.log', level: 'debug' }),
    ],
    format: winston.format.combine(winston.format.colorize(), winston.format.simple())
});
// logger.log('info', 'info message');
// logger.log('error', 'error message');
// logger.log('warn', 'warn message');
// logger.log('debug', 'debug message');
export default logger;
//# sourceMappingURL=logger.js.map