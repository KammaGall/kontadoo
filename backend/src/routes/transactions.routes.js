const express = require('express');
const transactionController = require('../controllers/transactionController');
const { authenticate } = require('../middleware/auth');
const { tenantMiddleware } = require('../middleware/tenant');
const { checkPermission } = require('../middleware/rbac');
const { auditMiddleware } = require('../middleware/audit');
const { validateTransaction, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

router.use(authenticate);
router.use(tenantMiddleware);
router.use(checkPermission('transactions', 'read'));

router.get('/',
    transactionController.getAllTransactions
);

router.get('/statistics',
    transactionController.getStatistics
);

router.get('/export',
    checkPermission('reports', 'read'),
    transactionController.exportTransactions
);

router.get('/:id',
    transactionController.getTransactionById
);

router.post('/',
    checkPermission('transactions', 'create'),
    validateTransaction,
    handleValidationErrors,
    auditMiddleware('CREATE', 'Transaction'),
    transactionController.createTransaction
);

router.put('/:id',
    checkPermission('transactions', 'update'),
    auditMiddleware('UPDATE', 'Transaction'),
    transactionController.updateTransaction
);

router.delete('/:id',
    checkPermission('transactions', 'delete'),
    auditMiddleware('DELETE', 'Transaction'),
    transactionController.deleteTransaction
);

module.exports = router;