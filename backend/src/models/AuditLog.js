'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class AuditLog extends Model {
        static associate(models) {
            AuditLog.belongsTo(models.Business, {
                foreignKey: 'business_id',
                as: 'business'
            });
            AuditLog.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    AuditLog.init({
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
        user_id: {
            type: DataTypes.UUID,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        action: {
            type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT'),
            allowNull: false
        },
        entity_type: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        entity_id: DataTypes.UUID,
        old_data: DataTypes.JSONB,
        new_data: DataTypes.JSONB,
        changes: DataTypes.JSONB,
        ip_address: DataTypes.INET,
        user_agent: DataTypes.TEXT,
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {}
        }
    }, {
        sequelize,
        modelName: 'AuditLog',
        tableName: 'audit_logs',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false
    });

    return AuditLog;
};