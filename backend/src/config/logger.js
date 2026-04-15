const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Создаём папку для логов, если её нет
const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Определяем формат логов
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
    })
);

// Создаём логгер
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'kontadoo-backend' },
    transports: [
        // Все логи в файл
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        // Только ошибки в отдельный файл
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

// В development режиме также выводим в консоль
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

// Проверяем, что методы существуют
if (typeof logger.info !== 'function') {
    console.error('Logger methods not available, using console fallback');
    module.exports = {
        info: (...args) => console.log('[INFO]', ...args),
        error: (...args) => console.error('[ERROR]', ...args),
        warn: (...args) => console.warn('[WARN]', ...args),
        debug: (...args) => console.debug('[DEBUG]', ...args),
        log: (...args) => console.log('[LOG]', ...args)
    };
} else {
    module.exports = logger;
}