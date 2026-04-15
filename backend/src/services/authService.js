const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Session, AuditLog } = require('../models');
const { generateToken } = require('../utils/helpers');
const logger = require('../config/logger');

class AuthService {
    // Генерация JWT токенов
    generateTokens(user) {
        const payload = {
            userId: user.id,
            businessId: user.business_id,
            roleId: user.role_id,
            login: user.login
        };

        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id, type: 'refresh' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
        );

        return { accessToken, refreshToken };
    }

    // Проверка JWT токена
    verifyToken(token, isRefresh = false) {
        try {
            const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
            return jwt.verify(token, secret);
        } catch (error) {
            return null;
        }
    }

    // Создание сессии
    async createSession(userId, tokens, req) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 дней

        const session = await Session.create({
            user_id: userId,
            token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            device_info: {
                platform: req.get('Sec-Ch-Ua-Platform') || 'unknown',
                mobile: /mobile/i.test(req.get('User-Agent'))
            },
            expires_at: expiresAt,
            is_active: true
        });

        return session;
    }

    // Деактивация сессии
    async deactivateSession(token) {
        const session = await Session.findOne({ where: { token } });
        if (session) {
            session.is_active = false;
            await session.save();
        }
        return session;
    }

    // Деактивация всех сессий пользователя
    async deactivateAllUserSessions(userId) {
        await Session.update(
            { is_active: false },
            { where: { user_id: userId, is_active: true } }
        );
    }

    // Обновление токенов
    async refreshTokens(refreshToken, req) {
        const decoded = this.verifyToken(refreshToken, true);
        if (!decoded) {
            throw new Error('Invalid refresh token');
        }

        const session = await Session.findOne({
            where: { refresh_token: refreshToken, is_active: true },
            include: [{ model: User, as: 'user' }]
        });

        if (!session || !session.user || !session.user.is_active) {
            throw new Error('Session not found or user inactive');
        }

        // Деактивируем старую сессию
        session.is_active = false;
        await session.save();

        // Генерируем новые токены
        const tokens = this.generateTokens(session.user);

        // Создаём новую сессию
        await this.createSession(session.user.id, tokens, req);

        return {
            tokens,
            user: {
                id: session.user.id,
                login: session.user.login,
                firstName: session.user.first_name,
                lastName: session.user.last_name,
                roleId: session.user.role_id
            }
        };
    }

    // Логирование аудита
    async logAudit(businessId, userId, action, entityType, entityId, req, metadata = {}) {
        try {
            await AuditLog.create({
                business_id: businessId,
                user_id: userId,
                action,
                entity_type: entityType,
                entity_id: entityId,
                ip_address: req.ip,
                user_agent: req.get('User-Agent'),
                metadata
            });
        } catch (error) {
            logger.error('Failed to create audit log:', error);
        }
    }
}

module.exports = new AuthService();