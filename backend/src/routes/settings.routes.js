const express = require('express');
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { checkPermission } = require('../middleware/rbac');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware);

// Профиль пользователя (доступно всем авторизованным)
router.put('/profile',
    auditMiddleware('UPDATE', 'User'),
    settingsController.updateProfile
);

// Настройки бизнеса (требуют прав)
router.get('/business',
    checkPermission('settings', 'read'),
    settingsController.getBusinessSettings
);

router.put('/business',
    checkPermission('settings', 'update'),
    auditMiddleware('UPDATE', 'Business'),
    settingsController.updateBusinessSettings
);

module.exports = router;