'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Business extends Model {
        static associate(models) {
            Business.hasMany(models.User, {
                foreignKey: 'business_id',
                as: 'users'
            });
            Business.hasMany(models.Role, {
                foreignKey: 'business_id',
                as: 'roles'
            });
            Business.hasMany(models.Transaction, {
                foreignKey: 'business_id',
                as: 'transactions'
            });
            Business.hasMany(models.AuditLog, {
                foreignKey: 'business_id',
                as: 'auditLogs'
            });
        }
    }

    Business.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: true,
                len: [2, 255]
            }
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        address: DataTypes.TEXT,
        settings: {
            type: DataTypes.JSONB,
            defaultValue: {
                currency: 'RUB',
                timezone: 'Europe/Moscow',
                dateFormat: 'DD.MM.YYYY'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        subscription_plan: {
            type: DataTypes.ENUM('free', 'basic', 'premium'),
            defaultValue: 'free'
        },
        subscription_expires_at: DataTypes.DATE
    }, {
        sequelize,
        modelName: 'Business',
        tableName: 'businesses',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Business;
};