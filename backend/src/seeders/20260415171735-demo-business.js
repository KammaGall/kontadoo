'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const businessId = uuidv4();

    // Создаем бизнес
    await queryInterface.bulkInsert('businesses', [{
      id: businessId,
      name: 'Кофейня "Аромат"',
      email: 'contact@aromat-coffee.ru',
      phone: '+79161234567',
      address: 'г. Москва, ул. Тверская, д. 15',
      settings: JSON.stringify({
        currency: 'RUB',
        timezone: 'Europe/Moscow',
        dateFormat: 'DD.MM.YYYY'
      }),
      is_active: true,
      subscription_plan: 'basic',
      created_at: new Date(),
      updated_at: new Date()
    }]);

    // Создаем роли
    const adminRoleId = uuidv4();
    const cashierRoleId = uuidv4();
    const managerRoleId = uuidv4();

    await queryInterface.bulkInsert('roles', [
      {
        id: adminRoleId,
        business_id: businessId,
        name: 'Администратор',
        description: 'Полный доступ ко всем функциям системы',
        permissions: JSON.stringify({
          '*': ['*']  // Полный доступ
        }),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: cashierRoleId,
        business_id: businessId,
        name: 'Кассир',
        description: 'Работа с кассой и просмотр транзакций',
        permissions: JSON.stringify({
          'transactions': ['create', 'read'],
          'dashboard': ['read']
        }),
        is_system: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: managerRoleId,
        business_id: businessId,
        name: 'Менеджер',
        description: 'Управление персоналом и просмотр отчетов',
        permissions: JSON.stringify({
          'transactions': ['create', 'read', 'update'],
          'staff': ['read', 'update'],
          'reports': ['read'],
          'dashboard': ['read']
        }),
        is_system: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Создаем пользователей
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const cashierPassword = await bcrypt.hash('cash123', 10);

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        business_id: businessId,
        role_id: adminRoleId,
        first_name: 'Алексей',
        last_name: 'Смирнов',
        email: 'admin@aromat-coffee.ru',
        phone: '+79161234567',
        login: 'admin',
        password_hash: adminPassword,
        position: 'Владелец',
        salary: 150000.00,
        hire_date: '2023-01-15',
        settings: JSON.stringify({
          theme: 'light',
          language: 'ru',
          notifications: true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        business_id: businessId,
        role_id: cashierRoleId,
        first_name: 'Мария',
        last_name: 'Иванова',
        email: 'maria@aromat-coffee.ru',
        phone: '+79169876543',
        login: 'maria',
        password_hash: cashierPassword,
        position: 'Старший кассир',
        salary: 65000.00,
        hire_date: '2023-06-01',
        settings: JSON.stringify({
          theme: 'dark',
          language: 'ru',
          notifications: true
        }),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // Сохраняем ID бизнеса для использования в других сидерах
    await queryInterface.sequelize.query(
      `INSERT INTO "SequelizeMeta" (name) VALUES ('demo-business-ids-${businessId}')`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('businesses', null, {});
  }
};