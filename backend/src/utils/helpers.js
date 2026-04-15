const crypto = require('crypto');
const QRCode = require('qrcode');
const speakeasy = require('speakeasy');

// Генерация случайного токена
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

// Генерация QR-кода для входа
const generateQRCode = async (userId, token) => {
    try {
        const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/qr-login/${token}`;
        const qrCode = await QRCode.toDataURL(loginUrl);
        return qrCode;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Форматирование даты
const formatDate = (date, format = 'DD.MM.YYYY HH:mm') => {
    const d = new Date(date);
    const pad = (n) => n.toString().padStart(2, '0');

    const replacements = {
        'DD': pad(d.getDate()),
        'MM': pad(d.getMonth() + 1),
        'YYYY': d.getFullYear(),
        'HH': pad(d.getHours()),
        'mm': pad(d.getMinutes()),
        'ss': pad(d.getSeconds())
    };

    return format.replace(/DD|MM|YYYY|HH|mm|ss/g, match => replacements[match]);
};

// Форматирование валюты
const formatCurrency = (amount, currency = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Маскирование конфиденциальных данных
const maskEmail = (email) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 2) + '***' + username.slice(-1);
    return `${maskedUsername}@${domain}`;
};

// Генерация читаемого номера чека
const generateReceiptNumber = (businessId) => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${year}${month}${day}-${random}`;
};

module.exports = {
    generateToken,
    generateQRCode,
    formatDate,
    formatCurrency,
    maskEmail,
    generateReceiptNumber
};