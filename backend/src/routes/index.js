const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const rolesRoutes = require('./roles.routes');
const transactionsRoutes = require('./transactions.routes');
const auditRoutes = require('./audit.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/audit', auditRoutes);

// Health check (публичный)
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Kontadoo API'
    });
});

module.exports = router;