'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.belongsTo(models.Business, {
                foreignKey: 'business_id',
                as: 'business'
            });
            User.belongsTo(models.Role, {
                foreignKey: 'role_id',
                as: 'role'
            });
            User.hasMany(models.Transaction, {
                foreignKey: 'user_id',
                as: 'transactions'
            });
            User.hasMany(models.AuditLog, {
                foreignKey: 'user_id',
                as: 'auditLogs'
            });
            User.hasMany(models.Session, {
                foreignKey: 'user_id',
                as: 'sessions'
            });
        }

        // Проверка пароля
        async validatePassword(password) {
            return bcrypt.compare(password, this.password_hash);
        }

        // Получение полного имени
        getFullName() {
            return `${this.first_name} ${this.last_name}`;
        }

        // Проверка прав через роль
        hasPermission(resource, action) {
            if (!this.role) return false;
            return this.role.hasPermission(resource, action);
        }
    }

    User.init({
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
        role_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'roles',
                key: 'id'
            }
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 100]
            }
        },
        email: {
            type: DataTypes.STRING(255),
            unique: true,
            validate: {
                isEmail: true
            }
        },
        phone: {
            type: DataTypes.STRING(50),
            validate: {
                is: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
            }
        },
        login: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 100],
                isAlphanumeric: true
            }
        },
        password_hash: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        qr_code_token: {
            type: DataTypes.STRING(255),
            unique: true
        },
        qr_code_expires_at: DataTypes.DATE,
        position: DataTypes.STRING(100),
        salary: {
            type: DataTypes.DECIMAL(12, 2),
            validate: {
                min: 0
            }
        },
        hire_date: DataTypes.DATEONLY,
        settings: {
            type: DataTypes.JSONB,
            defaultValue: {
                theme: 'light',
                language: 'ru',
                notifications: true
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        last_login: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        hooks: {
            beforeCreate: async (user) => {
                if (user.password_hash && !user.password_hash.startsWith('$2')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            },
            beforeUpdate: async (user) => {
                if (user.changed('password_hash') && !user.password_hash.startsWith('$2')) {
                    user.password_hash = await bcrypt.hash(user.password_hash, 10);
                }
            }
        }
    });

    return User;
};