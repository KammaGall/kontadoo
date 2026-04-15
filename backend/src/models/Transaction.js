'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        static associate(models) {
            Transaction.belongsTo(models.Business, {
                foreignKey: 'business_id',
                as: 'business'
            });
            Transaction.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }
    }

    Transaction.init({
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
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        type: {
            type: DataTypes.ENUM('income', 'expense'),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            validate: {
                min: 0.01
            }
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: DataTypes.TEXT,
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
            defaultValue: 'completed'
        },
        payment_method: {
            type: DataTypes.ENUM('cash', 'card', 'transfer', 'other'),
            defaultValue: 'cash'
        },
        receipt_number: DataTypes.STRING(50),
        metadata: {
            type: DataTypes.JSONB,
            defaultValue: {}
        },
        transaction_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'Transaction',
        tableName: 'transactions',
        underscored: true,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    return Transaction;
};