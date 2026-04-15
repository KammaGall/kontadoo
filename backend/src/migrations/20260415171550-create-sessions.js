'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      token: {
        type: Sequelize.TEXT,
        allowNull: false,
        unique: true
      },
      refresh_token: {
        type: Sequelize.TEXT,
        unique: true
      },
      ip_address: {
        type: Sequelize.INET
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      device_info: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    await queryInterface.addIndex('sessions', ['user_id']);
    await queryInterface.addIndex('sessions', ['token']);
    await queryInterface.addIndex('sessions', ['is_active']);
    await queryInterface.addIndex('sessions', ['expires_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sessions');
  }
};