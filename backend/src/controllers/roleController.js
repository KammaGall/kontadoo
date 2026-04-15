const { Role, User, sequelize } = require('../models');
const { validatePermissions, DEFAULT_PERMISSIONS } = require('../utils/permissions');
const logger = require('../config/logger');

class RoleController {
    // Получение всех ролей бизнеса
    async getAllRoles(req, res, next) {
        try {
            const roles = await Role.findAll({
                where: { business_id: req.businessId },
                attributes: ['id', 'name', 'description', 'permissions', 'is_system', 'created_at'],
                order: [['is_system', 'DESC'], ['name', 'ASC']]
            });

            // Добавляем количество пользователей для каждой роли
            const rolesWithCount = await Promise.all(
                roles.map(async (role) => {
                    const userCount = await User.count({
                        where: { role_id: role.id, is_active: true }
                    });
                    return {
                        ...role.toJSON(),
                        usersCount: userCount
                    };
                })
            );

            res.json(rolesWithCount);
        } catch (error) {
            logger.error('Get all roles error:', error);
            next(error);
        }
    }

    // Получение роли по ID
    async getRoleById(req, res, next) {
        try {
            const { id } = req.params;

            const role = await Role.findOne({
                where: {
                    id,
                    business_id: req.businessId
                }
            });

            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            const userCount = await User.count({
                where: { role_id: role.id, is_active: true }
            });

            res.json({
                ...role.toJSON(),
                usersCount: userCount
            });

        } catch (error) {
            logger.error('Get role by id error:', error);
            next(error);
        }
    }

    // Создание новой роли
    async createRole(req, res, next) {
        try {
            const { name, description, permissions } = req.body;

            // Проверяем уникальность имени в рамках бизнеса
            const existingRole = await Role.findOne({
                where: {
                    name,
                    business_id: req.businessId
                }
            });

            if (existingRole) {
                return res.status(409).json({ error: 'Role with this name already exists' });
            }

            // Валидируем структуру прав
            if (!validatePermissions(permissions)) {
                return res.status(400).json({ error: 'Invalid permissions structure' });
            }

            const role = await Role.create({
                business_id: req.businessId,
                name,
                description,
                permissions,
                is_system: false
            });

            logger.info(`Role created: ${role.name} (${role.id}) for business ${req.businessId}`);

            res.status(201).json(role);

        } catch (error) {
            logger.error('Create role error:', error);
            next(error);
        }
    }

    // Обновление роли
    async updateRole(req, res, next) {
        try {
            const { id } = req.params;
            const { name, description, permissions } = req.body;

            const role = await Role.findOne({
                where: {
                    id,
                    business_id: req.businessId
                }
            });

            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            // Системные роли нельзя редактировать (кроме описания)
            if (role.is_system) {
                if (name !== role.name || JSON.stringify(permissions) !== JSON.stringify(role.permissions)) {
                    return res.status(403).json({
                        error: 'System roles cannot be modified. You can only change the description.'
                    });
                }
            }

            // Проверяем уникальность имени
            if (name && name !== role.name) {
                const existingRole = await Role.findOne({
                    where: {
                        name,
                        business_id: req.businessId,
                        id: { [sequelize.Sequelize.Op.ne]: id }
                    }
                });

                if (existingRole) {
                    return res.status(409).json({ error: 'Role with this name already exists' });
                }
            }

            // Валидируем права
            if (permissions && !validatePermissions(permissions)) {
                return res.status(400).json({ error: 'Invalid permissions structure' });
            }

            await role.update({
                name: name || role.name,
                description: description !== undefined ? description : role.description,
                permissions: permissions || role.permissions
            });

            logger.info(`Role updated: ${role.name} (${role.id})`);

            res.json(role);

        } catch (error) {
            logger.error('Update role error:', error);
            next(error);
        }
    }

    // Удаление роли
    async deleteRole(req, res, next) {
        try {
            const { id } = req.params;

            const role = await Role.findOne({
                where: {
                    id,
                    business_id: req.businessId
                }
            });

            if (!role) {
                return res.status(404).json({ error: 'Role not found' });
            }

            // Системные роли нельзя удалить
            if (role.is_system) {
                return res.status(403).json({ error: 'System roles cannot be deleted' });
            }

            // Проверяем, есть ли пользователи с этой ролью
            const userCount = await User.count({
                where: { role_id: id, is_active: true }
            });

            if (userCount > 0) {
                return res.status(409).json({
                    error: `Cannot delete role. ${userCount} active user(s) have this role.`
                });
            }

            await role.destroy();

            logger.info(`Role deleted: ${role.name} (${id})`);

            res.json({ message: 'Role deleted successfully' });

        } catch (error) {
            logger.error('Delete role error:', error);
            next(error);
        }
    }

    // Копирование роли
    async copyRole(req, res, next) {
        try {
            const { id } = req.params;
            const { newName } = req.body;

            if (!newName) {
                return res.status(400).json({ error: 'New role name is required' });
            }

            const sourceRole = await Role.findOne({
                where: {
                    id,
                    business_id: req.businessId
                }
            });

            if (!sourceRole) {
                return res.status(404).json({ error: 'Source role not found' });
            }

            // Проверяем уникальность нового имени
            const existingRole = await Role.findOne({
                where: {
                    name: newName,
                    business_id: req.businessId
                }
            });

            if (existingRole) {
                return res.status(409).json({ error: 'Role with this name already exists' });
            }

            const newRole = await Role.create({
                business_id: req.businessId,
                name: newName,
                description: `Copy of ${sourceRole.name}`,
                permissions: sourceRole.permissions,
                is_system: false
            });

            logger.info(`Role copied: ${sourceRole.name} -> ${newRole.name} (${newRole.id})`);

            res.status(201).json(newRole);

        } catch (error) {
            logger.error('Copy role error:', error);
            next(error);
        }
    }

    // Получение шаблонов прав
    getPermissionTemplates(req, res) {
        res.json({
            templates: DEFAULT_PERMISSIONS,
            availableResources: [
                { name: 'dashboard', description: 'Dashboard and widgets' },
                { name: 'transactions', description: 'Financial transactions' },
                { name: 'staff', description: 'Staff management' },
                { name: 'roles', description: 'Roles and permissions' },
                { name: 'reports', description: 'Reports and analytics' },
                { name: 'audit', description: 'Audit logs' },
                { name: 'settings', description: 'Business settings' }
            ],
            availableActions: [
                { name: 'create', description: 'Create new records' },
                { name: 'read', description: 'View records' },
                { name: 'update', description: 'Edit existing records' },
                { name: 'delete', description: 'Delete records' },
                { name: '*', description: 'Full access (all actions)' }
            ]
        });
    }
}

module.exports = new RoleController();