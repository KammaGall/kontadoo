'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Session extends Model {
        static associate(models) {
            Session.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    Session.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        refresh_token: {
            type: DataTypes.TEXT,
            unique: true
        },
        ip_address: DataTypes.INET,
        user_agent: DataTypes.TEXT,
        device_info: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'Session',
        tableName: 'sessions',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Session;
};