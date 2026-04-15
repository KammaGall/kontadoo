'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Создаем enum тип
    await queryInterface.sequelize.query(`
      CREATE TYPE transaction_type AS ENUM ('income', 'expense');
      CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled');
    `);

    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      business_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'businesses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      type: {
        type: 'transaction_type',
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0.01
        }
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      status: {
        type: 'transaction_status',
        defaultValue: 'completed'
      },
      payment_method: {
        type: Sequelize.ENUM('cash', 'card', 'transfer', 'other'),
        defaultValue: 'cash'
      },
      receipt_number: {
        type: Sequelize.STRING(50)
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('transactions', ['business_id']);
    await queryInterface.addIndex('transactions', ['user_id']);
    await queryInterface.addIndex('transactions', ['type']);
    await queryInterface.addIndex('transactions', ['category']);
    await queryInterface.addIndex('transactions', ['transaction_date']);
    await queryInterface.addIndex('transactions', ['business_id', 'transaction_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS transaction_type;
      DROP TYPE IF EXISTS transaction_status;
    `);
  }
};