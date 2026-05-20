const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { checkPermission } = require('../middleware/rbac');
const { auditMiddleware } = require('../middleware/audit');
const { validateUserCreation, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(checkPermission('staff', 'read'));

router.get('/',
    userController.getAllUsers
);

router.get('/:id',
    userController.getUserById
);

router.get('/:id/stats',
    userController.getUserStats
);

router.post('/',
    checkPermission('staff', 'create'),
    validateUserCreation,
    handleValidationErrors,
    auditMiddleware('CREATE', 'User'),
    userController.createUser
);

router.put('/:id',
    checkPermission('staff', 'update'),
    auditMiddleware('UPDATE', 'User'),
    userController.updateUser
);

router.delete('/:id',
    checkPermission('staff', 'delete'),
    auditMiddleware('DELETE', 'User'),
    userController.deleteUser
);

router.delete('/:id/permanent',
    checkPermission('staff', 'delete'),
    auditMiddleware('DELETE', 'User'),
    userController.hardDeleteUser
);

router.post('/:id/qr',
    checkPermission('staff', 'update'),
    userController.generateUserQR
);

router.post('/:id/reset-password',
    checkPermission('staff', 'update'),
    auditMiddleware('UPDATE', 'User'),
    userController.resetUserPassword
);

module.exports = router;