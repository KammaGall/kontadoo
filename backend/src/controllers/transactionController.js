const { Transaction, User, Business } = require('../models');
const { generateReceiptNumber, formatCurrency } = require('../utils/helpers');
const { sequelize } = require('../models');
const logger = require('../config/logger');

class TransactionController {
    // Получение всех транзакций
    async getAllTransactions(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                type,
                category,
                userId,
                startDate,
                endDate,
                paymentMethod,
                status
            } = req.query;

            const offset = (page - 1) * limit;
            const where = { business_id: req.businessId };

            if (type) where.type = type;
            if (category) where.category = category;
            if (userId) where.user_id = userId;
            if (paymentMethod) where.payment_method = paymentMethod;
            if (status) where.status = status;

            if (startDate || endDate) {
                where.transaction_date = {};
                if (startDate) where.transaction_date[require('sequelize').Op.gte] = new Date(startDate);
                if (endDate) where.transaction_date[require('sequelize').Op.lte] = new Date(endDate);
            }

            const { count, rows } = await Transaction.findAndCountAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'login']
                    }
                ],
                limit: parseInt(limit),
                offset: parseInt(offset),
                order: [['transaction_date', 'DESC']]
            });

            // Считаем итоги
            const totals = await Transaction.findAll({
                where,
                attributes: [
                    'type',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: ['type']
            });

            const summary = {
                income: 0,
                expense: 0,
                balance: 0
            };

            totals.forEach(t => {
                summary[t.type] = parseFloat(t.dataValues.total) || 0;
            });
            summary.balance = summary.income - summary.expense;

            res.json({
                transactions: rows,
                summary,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            logger.error('Get all transactions error:', error);
            next(error);
        }
    }

    // Получение транзакции по ID
    async getTransactionById(req, res, next) {
        try {
            const { id } = req.params;

            const transaction = await Transaction.findOne({
                where: { id, business_id: req.businessId },
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name', 'login']
                    }
                ]
            });

            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            res.json(transaction);

        } catch (error) {
            logger.error('Get transaction by id error:', error);
            next(error);
        }
    }

    // Создание транзакции
    async createTransaction(req, res, next) {
        try {
            const {
                type,
                amount,
                category,
                description,
                paymentMethod,
                transactionDate,
                metadata
            } = req.body;

            const receiptNumber = generateReceiptNumber(req.businessId);

            const transaction = await Transaction.create({
                business_id: req.businessId,
                user_id: req.user.id,
                type,
                amount,
                category,
                description,
                payment_method: paymentMethod || 'cash',
                receipt_number: receiptNumber,
                transaction_date: transactionDate || new Date(),
                status: 'completed',
                metadata: metadata || {}
            });

            logger.info(`Transaction created: ${transaction.id} by user ${req.user.id}`);

            res.status(201).json(transaction);

        } catch (error) {
            logger.error('Create transaction error:', error);
            next(error);
        }
    }

    // Обновление транзакции
    async updateTransaction(req, res, next) {
        try {
            const { id } = req.params;
            const {
                type,
                amount,
                category,
                description,
                paymentMethod,
                status
            } = req.body;

            const transaction = await Transaction.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            // Проверяем права на изменение (только свои или с правом update)
            if (transaction.user_id !== req.user.id && !req.user.hasPermission('transactions', 'update')) {
                return res.status(403).json({ error: 'Cannot edit other user\'s transaction' });
            }

            await transaction.update({
                type: type || transaction.type,
                amount: amount || transaction.amount,
                category: category || transaction.category,
                description: description !== undefined ? description : transaction.description,
                payment_method: paymentMethod || transaction.payment_method,
                status: status || transaction.status
            });

            logger.info(`Transaction updated: ${transaction.id}`);

            res.json(transaction);

        } catch (error) {
            logger.error('Update transaction error:', error);
            next(error);
        }
    }

    // Удаление транзакции
    async deleteTransaction(req, res, next) {
        try {
            const { id } = req.params;

            const transaction = await Transaction.findOne({
                where: { id, business_id: req.businessId }
            });

            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            // Проверяем права на удаление
            if (transaction.user_id !== req.user.id && !req.user.hasPermission('transactions', 'delete')) {
                return res.status(403).json({ error: 'Cannot delete other user\'s transaction' });
            }

            await transaction.destroy();

            logger.info(`Transaction deleted: ${id}`);

            res.json({ message: 'Transaction deleted successfully' });

        } catch (error) {
            logger.error('Delete transaction error:', error);
            next(error);
        }
    }

    // Получение статистики
    async getStatistics(req, res, next) {
        try {
            const { period = 'month', startDate, endDate } = req.query;

            let dateFilter = {};
            const now = new Date();

            if (startDate && endDate) {
                dateFilter = {
                    [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
                };
            } else {
                switch (period) {
                    case 'week':
                        const weekAgo = new Date();
                        weekAgo.setDate(now.getDate() - 7);
                        dateFilter = { [require('sequelize').Op.gte]: weekAgo };
                        break;
                    case 'month':
                        const monthAgo = new Date();
                        monthAgo.setMonth(now.getMonth() - 1);
                        dateFilter = { [require('sequelize').Op.gte]: monthAgo };
                        break;
                    case 'year':
                        const yearAgo = new Date();
                        yearAgo.setFullYear(now.getFullYear() - 1);
                        dateFilter = { [require('sequelize').Op.gte]: yearAgo };
                        break;
                    default:
                        const defaultMonthAgo = new Date();
                        defaultMonthAgo.setMonth(now.getMonth() - 1);
                        dateFilter = { [require('sequelize').Op.gte]: defaultMonthAgo };
                }
            }

            // Общая статистика
            const totals = await Transaction.findAll({
                where: {
                    business_id: req.businessId,
                    transaction_date: dateFilter,
                    status: 'completed'
                },
                attributes: [
                    'type',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
                    [sequelize.fn('AVG', sequelize.col('amount')), 'average']
                ],
                group: ['type']
            });

            // Статистика по категориям
            const byCategory = await Transaction.findAll({
                where: {
                    business_id: req.businessId,
                    transaction_date: dateFilter,
                    status: 'completed'
                },
                attributes: [
                    'type',
                    'category',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: ['type', 'category'],
                order: [[sequelize.literal('total'), 'DESC']]
            });

            // Статистика по дням
            const byDay = await Transaction.findAll({
                where: {
                    business_id: req.businessId,
                    transaction_date: dateFilter,
                    status: 'completed'
                },
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('transaction_date')), 'date'],
                    'type',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                group: ['date', 'type'],
                order: [['date', 'ASC']]
            });

            // Статистика по сотрудникам
            const byUser = await Transaction.findAll({
                where: {
                    business_id: req.businessId,
                    transaction_date: dateFilter,
                    status: 'completed'
                },
                attributes: [
                    'user_id',
                    [sequelize.fn('COUNT', sequelize.col('Transaction.id')), 'count'],
                    [sequelize.fn('SUM', sequelize.col('amount')), 'total']
                ],
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'first_name', 'last_name']
                    }
                ],
                group: ['user_id', 'user.id'],
                order: [[sequelize.literal('total'), 'DESC']]
            });

            const summary = {
                income: { count: 0, total: 0, average: 0 },
                expense: { count: 0, total: 0, average: 0 }
            };

            totals.forEach(t => {
                const type = t.type;
                summary[type] = {
                    count: parseInt(t.dataValues.count),
                    total: parseFloat(t.dataValues.total) || 0,
                    average: parseFloat(t.dataValues.average) || 0
                };
            });

            res.json({
                period: { from: dateFilter[require('sequelize').Op.gte] || startDate, to: endDate || now },
                summary: {
                    ...summary,
                    balance: summary.income.total - summary.expense.total
                },
                byCategory,
                byDay,
                byUser
            });

        } catch (error) {
            logger.error('Get statistics error:', error);
            next(error);
        }
    }

    // Экспорт транзакций
    async exportTransactions(req, res, next) {
        try {
            const { format = 'json', startDate, endDate } = req.query;

            const where = { business_id: req.businessId };

            if (startDate || endDate) {
                where.transaction_date = {};
                if (startDate) where.transaction_date[require('sequelize').Op.gte] = new Date(startDate);
                if (endDate) where.transaction_date[require('sequelize').Op.lte] = new Date(endDate);
            }

            const transactions = await Transaction.findAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['first_name', 'last_name']
                    }
                ],
                order: [['transaction_date', 'DESC']]
            });

            if (format === 'csv') {
                // Простой CSV экспорт
                const csvHeaders = ['Date', 'Type', 'Amount', 'Category', 'Description', 'User', 'Receipt'];
                const csvRows = transactions.map(t => [
                    t.transaction_date.toISOString(),
                    t.type,
                    t.amount,
                    t.category,
                    t.description || '',
                    t.user ? `${t.user.first_name} ${t.user.last_name}` : '',
                    t.receipt_number || ''
                ]);

                const csv = [csvHeaders, ...csvRows].map(row => row.join(',')).join('\n');

                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename=transactions-${Date.now()}.csv`);
                return res.send(csv);
            }

            res.json({
                exportedAt: new Date().toISOString(),
                count: transactions.length,
                transactions
            });

        } catch (error) {
            logger.error('Export transactions error:', error);
            next(error);
        }
    }
}

module.exports = new TransactionController();