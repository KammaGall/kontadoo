const bcrypt = require('bcryptjs');
const { User, Role, Business } = require('../models');
const { generateQRCode, generateToken, generateReceiptNumber } = require('../utils/helpers');
const logger = require('../config/logger');

class UserController {
    // Получение всех сотрудников бизнеса
    async getAllUsers(req, res, next) {
        try {
            const { page = 1, limit = 20, role, search, is_active } = req.query;
            const offset = (page - 1) * limit;

            const where = { business_id: req.businessId };

            if (role) where.role_id = role;
            if (is_active !== undefined) where.is_active = is_active === 'true';
            if (search) {
                where[require('sequelize').Op.or] = [
                    { first_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
                    { last_name: { [require('sequelize').Op.iLike]: `%${search}%` } },
                    { login: { [require('sequelize').Op.iLike]: `%${search}%` } },
                    { email: { [require('sequelize').Op.iLike]: `%${search}%` } }
                ];
            }

            const { count, rows } = await User.findAndCountAll({
                where,
                include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
                attributes: { exclude: ['password_hash', 'qr_code_token'] },
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['created_at', 'DESC']]
            });

            res.json({
                users: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            logger.error('Get all users error:', error);
            next(error);
        }
    }

    // Получение сотрудника по ID
    async getUserById(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findOne({
                where: { id, business_id: req.businessId },
                include: [{ model: Role, as: 'role' }],
                attributes: { exclude: ['password_hash', 'qr_code_token'] }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);

        } catch (error) {
            logger.error('Get user by id error:', error);
            next(error);
        }
    }

    // Создание нового сотрудника
    async createUser(req, res, next) {
        try {
            const {
                firstName,
                lastName,
                login,
                password,
                email,
                phone,
                roleId,
                position,
                salary,
                hireDate
            } = req.body;

            // Проверяем, не занят ли логин
            const existingUser = await User.findOne({ where: { login } });
            if (existingUser) {
                return res.status(409).json({ error: 'Login already taken' });
            }

            // Проверяем email если указан
            if (email) {
                const existingEmail = await User.findOne({ where: { email } });
                if (existingEmail) {
                    return res.status(409).json({ error: 'Email already taken' });
                }
            }

            // Проверяем существование роли
            const role = await Role.findOne({
                where: { id: roleId, business_id: req.businessId }
            });

            if (!role) {
                return res.status(400).json({ error: 'Invalid role' });
            }

            // Хешируем пароль
            const passwordHash = await bcrypt.hash(password, 10);

            const user = await User.create({
                business_id: req.businessId,
                role_id: roleId,
                first_name: firstName,
                last_name: lastName,
                login,
                password_hash: passwordHash,
                email,
                phone,
                position,
                salary,
                hire_date: hireDate,
                is_active: true
            });

            logger.info(`User created: ${user.login} (${user.id}) for business ${req.businessId}`);

            // Возвращаем без sensitive данных
            const userData = user.toJSON();
            delete userData.password_hash;

            res.status(201).json(userData);

        } catch (error) {
            logger.error('Create user error:', error);
            next(error);
        }
    }

    // Обновление сотрудника
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const {
                firstName,
                lastName,
                email,
                phone,
                roleId,
                position,
                salary,
                hireDate,
                isActive
            } = req.body;

            const user = await User.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Проверяем роль если меняется
            if (roleId && roleId !== user.role_id) {
                const role = await Role.findOne({
                    where: { id: roleId, business_id: req.businessId }
                });

                if (!role) {
                    return res.status(400).json({ error: 'Invalid role' });
                }
            }

            // Проверяем email если меняется
            if (email && email !== user.email) {
                const existingEmail = await User.findOne({
                    where: { email, id: { [require('sequelize').Op.ne]: id } }
                });
                if (existingEmail) {
                    return res.status(409).json({ error: 'Email already taken' });
                }
            }

            await user.update({
                first_name: firstName || user.first_name,
                last_name: lastName || user.last_name,
                email: email !== undefined ? email : user.email,
                phone: phone !== undefined ? phone : user.phone,
                role_id: roleId || user.role_id,
                position: position !== undefined ? position : user.position,
                salary: salary !== undefined ? salary : user.salary,
                hire_date: hireDate || user.hire_date,
                is_active: isActive !== undefined ? isActive : user.is_active
            });

            logger.info(`User updated: ${user.login} (${user.id})`);

            const userData = user.toJSON();
            delete userData.password_hash;
            delete userData.qr_code_token;

            res.json(userData);

        } catch (error) {
            logger.error('Update user error:', error);
            next(error);
        }
    }

    // Удаление (деактивация) сотрудника
    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Нельзя удалить самого себя
            if (user.id === req.user.id) {
                return res.status(400).json({ error: 'Cannot delete yourself' });
            }

            // Мягкое удаление - деактивация
            user.is_active = false;
            await user.save();

            // Деактивируем все сессии
            const { Session } = require('../models');
            await Session.update(
                { is_active: false },
                { where: { user_id: id } }
            );

            logger.info(`User deactivated: ${user.login} (${user.id})`);

            res.json({ message: 'User deactivated successfully' });

        } catch (error) {
            logger.error('Delete user error:', error);
            next(error);
        }
    }

    // Генерация QR-кода для сотрудника
    async generateUserQR(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const qrToken = generateToken(16);
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);

            user.qr_code_token = qrToken;
            user.qr_code_expires_at = expiresAt;
            await user.save();

            const qrCode = await generateQRCode(user.id, qrToken);

            res.json({
                userId: user.id,
                qrCode,
                expiresAt,
                token: qrToken
            });

        } catch (error) {
            logger.error('Generate user QR error:', error);
            next(error);
        }
    }

    // Сброс пароля сотрудника (администратором)
    async resetUserPassword(req, res, next) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            if (!newPassword || newPassword.length < 6) {
                return res.status(400).json({ error: 'Password must be at least 6 characters' });
            }

            const user = await User.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            user.password_hash = newPassword;
            await user.save();

            // Деактивируем все сессии пользователя
            const { Session } = require('../models');
            await Session.update(
                { is_active: false },
                { where: { user_id: id } }
            );

            logger.info(`Password reset for user: ${user.login} (${user.id}) by admin ${req.user.id}`);

            res.json({ message: 'Password reset successfully' });

        } catch (error) {
            logger.error('Reset user password error:', error);
            next(error);
        }
    }

    // Получение статистики по сотруднику
    async getUserStats(req, res, next) {
        try {
            const { id } = req.params;

            const user = await User.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { Transaction } = require('../models');

            // Статистика транзакций
            const transactionsStats = await Transaction.findAll({
                where: { user_id: id, business_id: req.businessId },
                attributes: [
                    'type',
                    [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
                    [require('sequelize').fn('SUM', require('sequelize').col('amount')), 'total']
                ],
                group: ['type']
            });

            // Транзакции за последние 30 дней
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentTransactions = await Transaction.findAll({
                where: {
                    user_id: id,
                    business_id: req.businessId,
                    created_at: { [require('sequelize').Op.gte]: thirtyDaysAgo }
                },
                order: [['created_at', 'DESC']],
                limit: 10
            });

            const stats = {
                income: { count: 0, total: 0 },
                expense: { count: 0, total: 0 }
            };

            transactionsStats.forEach(stat => {
                const type = stat.type;
                stats[type] = {
                    count: parseInt(stat.dataValues.count),
                    total: parseFloat(stat.dataValues.total) || 0
                };
            });

            res.json({
                userId: user.id,
                userName: user.getFullName(),
                stats,
                recentTransactions
            });

        } catch (error) {
            logger.error('Get user stats error:', error);
            next(error);
        }
    }
}

module.exports = new UserController();