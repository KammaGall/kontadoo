const authService = require('../services/authService');
const { User, Role } = require('../models');
const logger = require('../config/logger');

// Проверка JWT токена и загрузка пользователя
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.substring(7);

        // Проверяем токен
        const decoded = authService.verifyToken(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Проверяем активность сессии
        const session = await require('../models').Session.findOne({
            where: { token, is_active: true }
        });

        if (!session) {
            return res.status(401).json({ error: 'Session expired or invalidated' });
        }

        // Загружаем пользователя с ролью
        const user = await User.findOne({
            where: { id: decoded.userId, is_active: true },
            include: [{ model: Role, as: 'role' }]
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found or inactive' });
        }

        // Добавляем пользователя в запрос
        req.user = user;
        req.session = session;
        req.businessId = user.business_id;

        next();
    } catch (error) {
        logger.error('Authentication error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

// Опциональная аутентификация (для публичных эндпоинтов)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = authService.verifyToken(token);

            if (decoded) {
                const user = await User.findOne({
                    where: { id: decoded.userId, is_active: true },
                    include: [{ model: Role, as: 'role' }]
                });

                if (user) {
                    req.user = user;
                    req.businessId = user.business_id;
                }
            }
        }
    } catch (error) {
        // Игнорируем ошибки при опциональной аутентификации
    }
    next();
};

module.exports = {
    authenticate,
    optionalAuth
};