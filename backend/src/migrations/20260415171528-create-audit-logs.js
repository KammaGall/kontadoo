'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT');
    `);

    await queryInterface.createTable('audit_logs', {
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
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      action: {
        type: 'audit_action',
        allowNull: false
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Таблица или сущность'
      },
      entity_id: {
        type: Sequelize.UUID,
        comment: 'ID измененной записи'
      },
      old_data: {
        type: Sequelize.JSONB
      },
      new_data: {
        type: Sequelize.JSONB
      },
      changes: {
        type: Sequelize.JSONB,
        comment: 'Только измененные поля'
      },
      ip_address: {
        type: Sequelize.INET
      },
      user_agent: {
        type: Sequelize.TEXT
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('audit_logs', ['business_id']);
    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id']);
    await queryInterface.addIndex('audit_logs', ['action']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
    await queryInterface.addIndex('audit_logs', ['business_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('audit_logs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS audit_action;');
  }
};