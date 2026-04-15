const express = require('express');
const roleController = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { checkPermission } = require('../middleware/rbac');
const { auditMiddleware } = require('../middleware/audit');

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware);

// Получение шаблонов прав (доступно всем авторизованным)
router.get('/templates',
    roleController.getPermissionTemplates
);

// Все остальные маршруты требуют прав на управление ролями
router.use(checkPermission('roles', 'read'));

router.get('/',
    roleController.getAllRoles
);

router.get('/:id',
    roleController.getRoleById
);

router.post('/',
    checkPermission('roles', 'create'),
    auditMiddleware('CREATE', 'Role'),
    roleController.createRole
);

router.put('/:id',
    checkPermission('roles', 'update'),
    auditMiddleware('UPDATE', 'Role'),
    roleController.updateRole
);

router.delete('/:id',
    checkPermission('roles', 'delete'),
    auditMiddleware('DELETE', 'Role'),
    roleController.deleteRole
);

router.post('/:id/copy',
    checkPermission('roles', 'create'),
    auditMiddleware('CREATE', 'Role'),
    roleController.copyRole
);

module.exports = router;