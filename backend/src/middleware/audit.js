const { AuditLog } = require('../models');
const logger = require('../config/logger');

// Middleware для аудита действий
const auditMiddleware = (action, entityType) => {
    return async (req, res, next) => {
        // Сохраняем старые данные для UPDATE и DELETE
        let oldData = null;

        if (action === 'UPDATE' || action === 'DELETE') {
            const model = require('../models')[entityType];
            if (model && req.params.id) {
                try {
                    const record = await model.findByPk(req.params.id);
                    if (record) {
                        oldData = record.toJSON();
                        delete oldData.password_hash;
                        delete oldData.qr_code_token;
                    }
                } catch (error) {
                    logger.error('Failed to fetch old data for audit:', error);
                }
            }
        }

        // Флаг, чтобы записать аудит только один раз
        let auditWritten = false;

        const auditLog = async (data) => {
            // Защита от двойной записи
            if (auditWritten) return;
            auditWritten = true;

            try {
                if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                    let newData = null;
                    let entityId = req.params.id;

                    if (action === 'CREATE' && data) {
                        newData = typeof data === 'string' ? JSON.parse(data) : data;
                        entityId = newData?.id;
                    } else if (action === 'UPDATE' && data) {
                        newData = typeof data === 'string' ? JSON.parse(data) : data;
                    }

                    if (newData) {
                        delete newData.password_hash;
                        delete newData.qr_code_token;
                    }

                    let changes = null;
                    if (oldData && newData) {
                        changes = {};
                        Object.keys(newData).forEach(key => {
                            if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
                                changes[key] = {
                                    from: oldData[key],
                                    to: newData[key]
                                };
                            }
                        });
                    }

                    await AuditLog.create({
                        business_id: req.businessId || req.user.business_id,
                        user_id: req.user.id,
                        action,
                        entity_type: entityType,
                        entity_id: entityId,
                        old_data: oldData,
                        new_data: newData,
                        changes,
                        ip_address: req.ip,
                        user_agent: req.get('User-Agent'),
                        metadata: {
                            method: req.method,
                            path: req.path,
                            query: req.query
                        }
                    });
                }
            } catch (error) {
                logger.error('Failed to create audit log:', error);
            }
        };

        // Перехватываем res.json (основной метод)
        const originalJson = res.json;
        res.json = function (data) {
            auditLog(data);
            return originalJson.call(this, data);
        };

        // ❌ НЕ перехватываем res.send и res.end — res.json сам вызывает res.send

        next();
    };
};

// Ручное логирование аудита
const logAudit = async (req, action, entityType, entityId = null, metadata = {}) => {
    try {
        if (!req.user) return;

        await AuditLog.create({
            business_id: req.businessId || req.user.business_id,
            user_id: req.user.id,
            action,
            entity_type: entityType,
            entity_id: entityId,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            metadata
        });
    } catch (error) {
        logger.error('Failed to create manual audit log:', error);
    }
};

module.exports = {
    auditMiddleware,
    logAudit
};