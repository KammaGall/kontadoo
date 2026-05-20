# Kontadoo — Учётное приложение для мини бизнеса

![Kontadoo](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-18-blue)
![Node.js](https://img.shields.io/badge/Node.js-22-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

**Kontadoo** — это SaaS приложение для учёта доходов и расходов малого бизнеса с гибкой системой ролей и прав доступа.

## ✨ Возможности

- 🔐 **JWT аутентификация** с refresh токенами
- 👥 **Управление сотрудниками** с генерацией QR-кодов для входа
- 🛡️ **RBAC система** с визуальной матрицей прав (JSONB)
- 💰 **Учёт транзакций** (доходы/расходы) с фильтрацией
- 📊 **Дашборд** с графиками (Recharts)
- 📋 **Аудит** всех действий в системе
- 🌙 **Тёмная/светлая тема**
- 📱 **Адаптивный дизайн** (Tailwind CSS)

## 🛠 Технологии

### Frontend

- **React 18** + **TypeScript**
- **Redux Toolkit** (RTK Query)
- **React Router v6**
- **Tailwind CSS**
- **Recharts** (графики)
- **React Hook Form** + **Zod**
- **Vite**

### Backend

- **Node.js** + **Express**
- **Sequelize ORM**
- **PostgreSQL**
- **JWT** авторизация
- **Winston** логирование

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+
- PostgreSQL 15+

### Установка

1. Клонируйте репозиторий:


git clone https://github.com/your-username/kontadoo.git
cd kontadoo

2. Настройте Backend:


cd backend
npm install
cp .env.example .env
# Отредактируйте .env файл

3. Создайте базу данных и примените миграции:

npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all

4. Запустите бэкенд:

npm run dev


5. Настройте и запустите фронтенд:

cd ../frontend
npm install
npm run dev

6. Откройте http://localhost:5173

