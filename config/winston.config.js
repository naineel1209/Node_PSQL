import winston from 'winston'

const logger = winston.createLogger({
    // levels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'], // levels are ordered by priority
    transports:
        [
            new winston.transports.File({ filename: 'logs/combined.log', level: 'info' }),
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
        ],
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.simple()
    ),
});

// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: winston.format.simple(),
//     }));
// }

export default logger;