// Предустановленные наборы прав для системных ролей
const DEFAULT_PERMISSIONS = {
    ADMIN: {
        '*': ['*'] // Полный доступ
    },
    MANAGER: {
        'dashboard': ['read'],
        'transactions': ['create', 'read', 'update'],
        'staff': ['read', 'update'],
        'reports': ['read'],
        'audit': ['read']
    },
    CASHIER: {
        'dashboard': ['read'],
        'transactions': ['create', 'read']
    },
    VIEWER: {
        'dashboard': ['read'],
        'transactions': ['read']
    }
};

// Валидация структуры прав
const validatePermissions = (permissions) => {
    if (typeof permissions !== 'object' || permissions === null) {
        return false;
    }

    const validActions = ['create', 'read', 'update', 'delete', '*'];

    for (const [resource, actions] of Object.entries(permissions)) {
        if (!Array.isArray(actions)) {
            return false;
        }

        for (const action of actions) {
            if (!validActions.includes(action)) {
                return false;
            }
        }
    }

    return true;
};

// Проверка конкретного права
const hasPermission = (userPermissions, resource, action) => {
    if (!userPermissions || typeof userPermissions !== 'object') {
        return false;
    }

    // Супер-админ
    if (userPermissions['*'] && userPermissions['*'].includes('*')) {
        return true;
    }

    const resourcePerms = userPermissions[resource];
    if (!resourcePerms || !Array.isArray(resourcePerms)) {
        return false;
    }

    return resourcePerms.includes('*') || resourcePerms.includes(action);
};

// Слияние прав (для наследования)
const mergePermissions = (basePermissions, additionalPermissions) => {
    const merged = { ...basePermissions };

    for (const [resource, actions] of Object.entries(additionalPermissions)) {
        if (!merged[resource]) {
            merged[resource] = [...actions];
        } else {
            // Добавляем только новые действия
            const newActions = actions.filter(action => !merged[resource].includes(action));
            merged[resource] = [...merged[resource], ...newActions];
        }
    }

    return merged;
};

module.exports = {
    DEFAULT_PERMISSIONS,
    validatePermissions,
    hasPermission,
    mergePermissions
};