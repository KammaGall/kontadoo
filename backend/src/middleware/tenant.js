const logger = require('../config/logger');

// Middleware для автоматического добавления business_id во все запросы
const tenantMiddleware = (req, res, next) => {
    // business_id уже добавлен в authenticate middleware
    if (!req.businessId && req.user) {
        req.businessId = req.user.business_id;
    }

    // Добавляем хелпер для фильтрации по тенанту
    req.getTenantFilter = () => {
        return { business_id: req.businessId };
    };

    next();
};

// Middleware для проверки принадлежности ресурса к тенанту
const requireTenantAccess = (modelName) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            if (!id) return next();

            const model = require('../models')[modelName];
            if (!model) {
                return res.status(500).json({ error: 'Model not found' });
            }

            const resource = await model.findOne({
                where: {
                    id,
                    business_id: req.businessId
                }
            });

            if (!resource) {
                return res.status(404).json({ error: `${modelName} not found` });
            }

            req.tenantResource = resource;
            next();
        } catch (error) {
            logger.error('Tenant access check error:', error);
            return res.status(500).json({ error: 'Failed to verify tenant access' });
        }
    };
};

module.exports = {
    tenantMiddleware,
    requireTenantAccess
};