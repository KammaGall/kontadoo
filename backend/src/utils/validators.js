const { body, validationResult } = require('express-validator');

// Валидация регистрации бизнеса
const validateBusinessRegistration = [
    body('businessName')
        .trim()
        .notEmpty().withMessage('Business name is required')
        .isLength({ min: 2, max: 255 }).withMessage('Business name must be between 2 and 255 characters'),

    body('businessEmail')
        .trim()
        .notEmpty().withMessage('Business email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('adminFirstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters'),

    body('adminLastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 100 }).withMessage('Last name must be between 2 and 100 characters'),

    body('adminLogin')
        .trim()
        .notEmpty().withMessage('Login is required')
        .isLength({ min: 3, max: 100 }).withMessage('Login must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Login can only contain letters, numbers and underscores'),

    body('adminPassword')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('adminEmail')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail()
];

// Валидация логина
const validateLogin = [
    body('login')
        .trim()
        .notEmpty().withMessage('Login is required'),

    body('password')
        .notEmpty().withMessage('Password is required')
];

// Валидация создания пользователя
const validateUserCreation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ min: 2, max: 100 }),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ min: 2, max: 100 }),

    body('login')
        .trim()
        .notEmpty().withMessage('Login is required')
        .isLength({ min: 3, max: 100 })
        .matches(/^[a-zA-Z0-9_]+$/),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }),

    body('roleId')
        .notEmpty().withMessage('Role ID is required')
        .isUUID(4).withMessage('Invalid role ID format'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .normalizeEmail()
];

// Валидация транзакции
const validateTransaction = [
    body('type')
        .notEmpty().withMessage('Transaction type is required')
        .isIn(['income', 'expense']).withMessage('Type must be either "income" or "expense"'),

    body('amount')
        .notEmpty().withMessage('Amount is required')
        .isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),

    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isLength({ min: 2, max: 100 }),

    body('description')
        .optional()
        .trim(),

    body('paymentMethod')
        .optional()
        .isIn(['cash', 'card', 'transfer', 'other'])
];

// Обработка ошибок валидации
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({ field: err.path, message: err.msg }))
        });
    }
    next();
};

module.exports = {
    validateBusinessRegistration,
    validateLogin,
    validateUserCreation,
    validateTransaction,
    handleValidationErrors
};