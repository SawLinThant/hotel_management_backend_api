import winston from 'winston';
const { combine, timestamp, printf, colorize, splat } = winston.format;
const logFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(timestamp(), splat(), process.env.NODE_ENV === 'production' ? logFormat : combine(colorize(), logFormat)),
    transports: [new winston.transports.Console()],
});
export default logger;
//# sourceMappingURL=logger.js.map