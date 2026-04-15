const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { auditMiddleware } = require('../middleware/audit');
const { validateBusinessRegistration, validateLogin, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

// Публичные маршруты
router.post('/register',
    validateBusinessRegistration,
    handleValidationErrors,
    authController.register
);

router.post('/login',
    validateLogin,
    handleValidationErrors,
    authController.login
);

router.post('/refresh',
    authController.refresh
);

router.get('/qr-login/:token',
    authController.qrLogin
);

// Защищённые маршруты
router.use(authenticate);
router.use(tenantMiddleware);

router.post('/logout',
    auditMiddleware('LOGOUT', 'User'),
    authController.logout
);

router.get('/me',
    authController.getCurrentUser
);

router.post('/change-password/:userId',
    auditMiddleware('UPDATE', 'User'),
    authController.changePassword
);

router.post('/qr-generate/:userId',
    authController.generateQRLogin
);

module.exports = router;