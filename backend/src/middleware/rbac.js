const logger = require('../config/logger');
const { hasPermission } = require('../utils/permissions');

// Проверка прав доступа
const checkPermission = (resource, action) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRole = req.user.role;

            if (!userRole || !userRole.permissions) {
                logger.warn(`User ${req.user.id} has no role or permissions`);
                return res.status(403).json({ error: 'No permissions defined' });
            }

            // Проверяем право
            if (hasPermission(userRole.permissions, resource, action)) {
                return next();
            }

            logger.warn(`User ${req.user.id} denied ${action} on ${resource}`);
            return res.status(403).json({
                error: 'Access denied',
                details: `Missing permission: ${resource}:${action}`
            });
        } catch (error) {
            logger.error('RBAC error:', error);
            return res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

// Проверка хотя бы одного права из списка
const checkAnyPermission = (permissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const userRole = req.user.role;

            if (!userRole || !userRole.permissions) {
                return res.status(403).json({ error: 'No permissions defined' });
            }

            // Проверяем хотя бы одно право
            for (const { resource, action } of permissions) {
                if (hasPermission(userRole.permissions, resource, action)) {
                    return next();
                }
            }

            return res.status(403).json({ error: 'Access denied' });
        } catch (error) {
            logger.error('RBAC error:', error);
            return res.status(500).json({ error: 'Permission check failed' });
        }
    };
};

// Middleware для фильтрации данных по правам (например, скрыть некоторые поля)
const filterByPermissions = (resource) => {
    return (req, res, next) => {
        // Сохраняем оригинальный метод json
        const originalJson = res.json;

        res.json = function (data) {
            if (!req.user || !data) {
                return originalJson.call(this, data);
            }

            const userRole = req.user.role;

            // Если нет прав на чтение, возвращаем пустой объект/массив
            if (!hasPermission(userRole.permissions, resource, 'read')) {
                return originalJson.call(this, Array.isArray(data) ? [] : {});
            }

            // Тут можно добавить логику фильтрации полей
            // Например, скрыть salary для обычных пользователей
            if (resource === 'staff' && !hasPermission(userRole.permissions, 'staff', 'view_salary')) {
                if (Array.isArray(data)) {
                    data = data.map(item => {
                        const { salary, ...rest } = item;
                        return rest;
                    });
                } else {
                    const { salary, ...rest } = data;
                    data = rest;
                }
            }

            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = {
    checkPermission,
    checkAnyPermission,
    filterByPermissions
};