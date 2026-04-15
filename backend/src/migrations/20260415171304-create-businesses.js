'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryInterface.createTable('businesses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(50)
      },
      address: {
        type: Sequelize.TEXT
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {
          currency: 'RUB',
          timezone: 'Europe/Moscow',
          dateFormat: 'DD.MM.YYYY'
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      subscription_plan: {
        type: Sequelize.ENUM('free', 'basic', 'premium'),
        defaultValue: 'free'
      },
      subscription_expires_at: {
        type: Sequelize.DATE
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

    // Индексы
    await queryInterface.addIndex('businesses', ['email']);
    await queryInterface.addIndex('businesses', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('businesses');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_businesses_subscription_plan;');
  }
};