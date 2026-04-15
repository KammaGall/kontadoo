'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
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
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true
      },
      phone: {
        type: Sequelize.STRING(50)
      },
      login: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      qr_code_token: {
        type: Sequelize.STRING(255),
        unique: true,
        comment: 'Токен для QR-входа'
      },
      qr_code_expires_at: {
        type: Sequelize.DATE
      },
      position: {
        type: Sequelize.STRING(100),
        comment: 'Должность'
      },
      salary: {
        type: Sequelize.DECIMAL(12, 2)
      },
      hire_date: {
        type: Sequelize.DATEONLY
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {
          theme: 'light',
          language: 'ru',
          notifications: true
        }
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login: {
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

    await queryInterface.addIndex('users', ['business_id']);
    await queryInterface.addIndex('users', ['role_id']);
    await queryInterface.addIndex('users', ['login']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};