const express = require('express');
const { AuditLog, User } = require('../models');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { checkPermission } = require('../middleware/rbac');
const logger = require('../config/logger');

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(checkPermission('audit', 'read'));

// Получение логов аудита
router.get('/', async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 50,
            action,
            entityType,
            userId,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;
        const where = { business_id: req.businessId };

        if (action) where.action = action;
        if (entityType) where.entity_type = entityType;
        if (userId) where.user_id = userId;

        if (startDate || endDate) {
            where.created_at = {};
            if (startDate) where.created_at[require('sequelize').Op.gte] = new Date(startDate);
            if (endDate) where.created_at[require('sequelize').Op.lte] = new Date(endDate);
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'login']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            logs: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        logger.error('Get audit logs error:', error);
        next(error);
    }
});

// Получение действий пользователя
router.get('/user/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await AuditLog.findAndCountAll({
            where: {
                business_id: req.businessId,
                user_id: userId
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            userId,
            logs: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        });

    } catch (error) {
        logger.error('Get user audit logs error:', error);
        next(error);
    }
});

// Получение истории изменений сущности
router.get('/entity/:entityType/:entityId', async (req, res, next) => {
    try {
        const { entityType, entityId } = req.params;

        const logs = await AuditLog.findAll({
            where: {
                business_id: req.businessId,
                entity_type: entityType,
                entity_id: entityId
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'login']
                }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            entityType,
            entityId,
            logs
        });

    } catch (error) {
        logger.error('Get entity audit logs error:', error);
        next(error);
    }
});

// Статистика аудита
router.get('/stats', async (req, res, next) => {
    try {
        const { sequelize } = require('../models');

        // Статистика по действиям
        const byAction = await AuditLog.findAll({
            where: { business_id: req.businessId },
            attributes: [
                'action',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['action']
        });

        // Статистика по сущностям
        const byEntity = await AuditLog.findAll({
            where: { business_id: req.businessId },
            attributes: [
                'entity_type',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['entity_type']
        });

        // Активность по дням (последние 30 дней)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const byDay = await AuditLog.findAll({
            where: {
                business_id: req.businessId,
                created_at: { [sequelize.Op.gte]: thirtyDaysAgo }
            },
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['date'],
            order: [['date', 'ASC']]
        });

        res.json({
            byAction,
            byEntity,
            byDay
        });

    } catch (error) {
        logger.error('Get audit stats error:', error);
        next(error);
    }
});

module.exports = router;