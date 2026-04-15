'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Role extends Model {
        static associate(models) {
            Role.belongsTo(models.Business, {
                foreignKey: 'business_id',
                as: 'business'
            });
            Role.hasMany(models.User, {
                foreignKey: 'role_id',
                as: 'users'
            });
        }

        // Метод для проверки прав
        hasPermission(resource, action) {
            const permissions = this.permissions || {};

            // Супер-админ
            if (permissions['*'] && permissions['*'].includes('*')) {
                return true;
            }

            const resourcePerms = permissions[resource];
            if (!resourcePerms) return false;

            return resourcePerms.includes('*') || resourcePerms.includes(action);
        }
    }

    Role.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        business_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'businesses',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        description: DataTypes.TEXT,
        permissions: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {},
            validate: {
                isValidPermissions(value) {
                    if (typeof value !== 'object') {
                        throw new Error('Permissions must be an object');
                    }

                    // Проверяем структуру прав
                    Object.keys(value).forEach(resource => {
                        if (!Array.isArray(value[resource])) {
                            throw new Error(`Permissions for ${resource} must be an array`);
                        }

                        const validActions = ['create', 'read', 'update', 'delete', '*'];
                        value[resource].forEach(action => {
                            if (!validActions.includes(action)) {
                                throw new Error(`Invalid action: ${action} for resource: ${resource}`);
                            }
                        });
                    });
                }
            }
        },
        is_system: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Role;
};