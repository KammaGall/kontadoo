'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      permissions: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      is_system: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Системные роли нельзя удалить'
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

    // Уникальный индекс на business_id + name
    await queryInterface.addIndex('roles', ['business_id', 'name'], {
      unique: true,
      name: 'roles_business_id_name_unique'
    });
    await queryInterface.addIndex('roles', ['business_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles');
  }
};