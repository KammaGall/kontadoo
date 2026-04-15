const bcrypt = require('bcryptjs');
const { Business, User, Role, sequelize } = require('../models');
const authService = require('../services/authService');
const { DEFAULT_PERMISSIONS } = require('../utils/permissions');
const { generateQRCode, generateToken } = require('../utils/helpers');
const logger = require('../config/logger');
const { logAudit } = require('../middleware/audit');

class AuthController {
    // Регистрация нового бизнеса и администратора
    async register(req, res, next) {
        const transaction = await sequelize.transaction();

        try {
            const {
                businessName,
                businessEmail,
                adminFirstName,
                adminLastName,
                adminLogin,
                adminPassword,
                adminEmail,
                businessPhone,
                businessAddress
            } = req.body;

            // Проверяем, не занят ли логин
            const existingUser = await User.findOne({ where: { login: adminLogin } });
            if (existingUser) {
                return res.status(409).json({ error: 'Login already taken' });
            }

            // Создаём бизнес
            const business = await Business.create({
                name: businessName,
                email: businessEmail,
                phone: businessPhone,
                address: businessAddress,
                subscription_plan: 'free'
            }, { transaction });

            // Создаём роль администратора
            const adminRole = await Role.create({
                business_id: business.id,
                name: 'Администратор',
                description: 'Системный администратор с полным доступом',
                permissions: DEFAULT_PERMISSIONS.ADMIN,
                is_system: true
            }, { transaction });

            // Создаём роль кассира (базовая)
            const cashierRole = await Role.create({
                business_id: business.id,
                name: 'Кассир',
                description: 'Базовая роль для работы с кассой',
                permissions: DEFAULT_PERMISSIONS.CASHIER,
                is_system: true
            }, { transaction });

            // Хешируем пароль
            const passwordHash = await bcrypt.hash(adminPassword, 10);

            // Создаём пользователя-администратора
            const user = await User.create({
                business_id: business.id,
                role_id: adminRole.id,
                first_name: adminFirstName,
                last_name: adminLastName,
                email: adminEmail || businessEmail,
                login: adminLogin,
                password_hash: passwordHash,
                position: 'Администратор',
                is_active: true
            }, { transaction });

            await transaction.commit();

            // Генерируем токены
            const tokens = authService.generateTokens(user);

            // Создаём сессию
            await authService.createSession(user.id, tokens, req);

            // Логируем аудит
            await logAudit(req, 'CREATE', 'Business', business.id, {
                businessName: business.name
            });

            logger.info(`New business registered: ${business.name} (${business.id})`);

            res.status(201).json({
                message: 'Business registered successfully',
                business: {
                    id: business.id,
                    name: business.name,
                    email: business.email
                },
                user: {
                    id: user.id,
                    login: user.login,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    role: adminRole.name
                },
                tokens
            });

        } catch (error) {
            await transaction.rollback();
            logger.error('Registration error:', error);
            next(error);
        }
    }

    // Вход в систему
    async login(req, res, next) {
        try {
            const { login, password } = req.body;

            // Ищем пользователя
            const user = await User.findOne({
                where: { login, is_active: true },
                include: [{ model: Role, as: 'role' }]
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid login or password' });
            }

            // Проверяем пароль
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                // Логируем неудачную попытку
                await logAudit(req, 'LOGIN_FAILED', 'User', user.id, {
                    reason: 'Invalid password'
                });
                return res.status(401).json({ error: 'Invalid login or password' });
            }

            // Обновляем время последнего входа
            user.last_login = new Date();
            await user.save();

            // Генерируем токены
            const tokens = authService.generateTokens(user);

            // Создаём сессию
            await authService.createSession(user.id, tokens, req);

            // Логируем успешный вход
            await logAudit(req, 'LOGIN', 'User', user.id);

            logger.info(`User logged in: ${user.login} (${user.id})`);

            // Формируем ответ
            const userData = {
                id: user.id,
                login: user.login,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                position: user.position,
                role: {
                    id: user.role.id,
                    name: user.role.name,
                    permissions: user.role.permissions
                },
                businessId: user.business_id,
                settings: user.settings
            };

            res.json({
                message: 'Login successful',
                user: userData,
                tokens
            });

        } catch (error) {
            logger.error('Login error:', error);
            next(error);
        }
    }

    // Выход из системы
    async logout(req, res, next) {
        try {
            const token = req.headers.authorization?.substring(7);

            if (token) {
                await authService.deactivateSession(token);
                await logAudit(req, 'LOGOUT', 'User', req.user.id);
            }

            res.json({ message: 'Logout successful' });
        } catch (error) {
            logger.error('Logout error:', error);
            next(error);
        }
    }

    // Обновление токенов
    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({ error: 'Refresh token required' });
            }

            const result = await authService.refreshTokens(refreshToken, req);

            res.json({
                message: 'Tokens refreshed',
                user: result.user,
                tokens: result.tokens
            });

        } catch (error) {
            logger.error('Token refresh error:', error);
            res.status(401).json({ error: error.message || 'Invalid refresh token' });
        }
    }

    // Генерация QR-кода для быстрого входа
    async generateQRLogin(req, res, next) {
        try {
            const { userId } = req.params;

            // Проверяем права (только админ может генерировать QR для сотрудников)
            if (userId !== req.user.id && !req.user.hasPermission('staff', 'update')) {
                return res.status(403).json({ error: 'Access denied' });
            }

            const user = await User.findOne({
                where: {
                    id: userId,
                    business_id: req.businessId
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Генерируем токен для QR
            const qrToken = generateToken(16);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24); // Действует 24 часа

            user.qr_code_token = qrToken;
            user.qr_code_expires_at = expiresAt;
            await user.save();

            // Генерируем QR-код
            const qrCode = await generateQRCode(user.id, qrToken);

            await logAudit(req, 'GENERATE_QR', 'User', user.id);

            res.json({
                qrCode,
                expiresAt,
                token: qrToken
            });

        } catch (error) {
            logger.error('QR generation error:', error);
            next(error);
        }
    }

    // Вход по QR-коду
    async qrLogin(req, res, next) {
        try {
            const { token } = req.params;

            const user = await User.findOne({
                where: {
                    qr_code_token: token,
                    is_active: true
                },
                include: [{ model: Role, as: 'role' }]
            });

            if (!user) {
                return res.status(401).json({ error: 'Invalid QR code' });
            }

            // Проверяем срок действия
            if (user.qr_code_expires_at && new Date() > user.qr_code_expires_at) {
                return res.status(401).json({ error: 'QR code expired' });
            }

            // Очищаем QR токен
            user.qr_code_token = null;
            user.qr_code_expires_at = null;
            user.last_login = new Date();
            await user.save();

            // Генерируем токены
            const tokens = authService.generateTokens(user);
            await authService.createSession(user.id, tokens, req);

            await logAudit(req, 'QR_LOGIN', 'User', user.id);

            const userData = {
                id: user.id,
                login: user.login,
                firstName: user.first_name,
                lastName: user.last_name,
                role: {
                    id: user.role.id,
                    name: user.role.name,
                    permissions: user.role.permissions
                },
                businessId: user.business_id
            };

            res.json({
                message: 'QR login successful',
                user: userData,
                tokens
            });

        } catch (error) {
            logger.error('QR login error:', error);
            next(error);
        }
    }

    // Получение текущего пользователя
    async getCurrentUser(req, res, next) {
        try {
            const user = await User.findOne({
                where: { id: req.user.id },
                include: [
                    { model: Role, as: 'role' },
                    { model: Business, as: 'business', attributes: ['id', 'name', 'settings'] }
                ]
            });

            res.json({
                id: user.id,
                login: user.login,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                phone: user.phone,
                position: user.position,
                hireDate: user.hire_date,
                settings: user.settings,
                role: {
                    id: user.role.id,
                    name: user.role.name,
                    description: user.role.description,
                    permissions: user.role.permissions
                },
                business: user.business,
                lastLogin: user.last_login
            });

        } catch (error) {
            logger.error('Get current user error:', error);
            next(error);
        }
    }

    // Изменение пароля
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const { userId } = req.params;

            // Проверяем права
            if (userId !== req.user.id && !req.user.hasPermission('staff', 'update')) {
                return res.status(403).json({ error: 'Access denied' });
            }

            const user = await User.findOne({
                where: {
                    id: userId,
                    business_id: req.businessId
                }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Проверяем текущий пароль (только если меняет себе)
            if (userId === req.user.id) {
                const isValid = await user.validatePassword(currentPassword);
                if (!isValid) {
                    return res.status(401).json({ error: 'Current password is incorrect' });
                }
            }

            // Обновляем пароль
            user.password_hash = newPassword;
            await user.save();

            // Деактивируем все сессии кроме текущей
            if (userId === req.user.id) {
                await authService.deactivateAllUserSessions(user.id);
                // Создаём новую сессию с текущим токеном
                const tokens = authService.generateTokens(user);
                await authService.createSession(user.id, tokens, req);
            }

            await logAudit(req, 'UPDATE', 'User', user.id, {
                action: 'password_change'
            });

            res.json({ message: 'Password changed successfully' });

        } catch (error) {
            logger.error('Change password error:', error);
            next(error);
        }
    }
}

module.exports = new AuthController();