const { User, Business } = require('../models');
const logger = require('../config/logger');

class SettingsController {
    // Обновление профиля пользователя
    async updateProfile(req, res, next) {
        try {
            const { firstName, lastName, email, phone } = req.body;
            const userId = req.user.id;

            const user = await User.findOne({
                where: { id: userId, business_id: req.businessId }
            });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Проверяем уникальность email
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ where: { email } });
                if (existingUser) {
                    return res.status(409).json({ error: 'Email already taken' });
                }
            }

            await user.update({
                first_name: firstName || user.first_name,
                last_name: lastName || user.last_name,
                email: email !== undefined ? email : user.email,
                phone: phone !== undefined ? phone : user.phone,
            });

            logger.info(`Profile updated for user: ${user.login} (${user.id})`);

            res.json({
                message: 'Profile updated successfully',
                user: {
                    id: user.id,
                    login: user.login,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    position: user.position,
                }
            });

        } catch (error) {
            logger.error('Update profile error:', error);
            next(error);
        }
    }

    // Получение настроек бизнеса
    async getBusinessSettings(req, res, next) {
        try {
            const business = await Business.findOne({
                where: { id: req.businessId },
                attributes: ['id', 'name', 'email', 'phone', 'address', 'settings']
            });

            if (!business) {
                return res.status(404).json({ error: 'Business not found' });
            }

            res.json(business);

        } catch (error) {
            logger.error('Get business settings error:', error);
            next(error);
        }
    }

    // Обновление настроек бизнеса
    async updateBusinessSettings(req, res, next) {
        try {
            const { name, email, phone, address, settings } = req.body;

            const business = await Business.findOne({
                where: { id: req.businessId }
            });

            if (!business) {
                return res.status(404).json({ error: 'Business not found' });
            }

            // Проверяем уникальность email
            if (email && email !== business.email) {
                const existingBusiness = await Business.findOne({ where: { email } });
                if (existingBusiness) {
                    return res.status(409).json({ error: 'Email already taken' });
                }
            }

            const updateData = {};
            if (name) updateData.name = name;
            if (email !== undefined) updateData.email = email;
            if (phone !== undefined) updateData.phone = phone;
            if (address !== undefined) updateData.address = address;
            if (settings) {
                updateData.settings = {
                    ...business.settings,
                    ...settings
                };
            }

            await business.update(updateData);

            logger.info(`Business settings updated: ${business.name} (${business.id})`);

            res.json({
                message: 'Business settings updated',
                business: {
                    id: business.id,
                    name: business.name,
                    email: business.email,
                    phone: business.phone,
                    address: business.address,
                    settings: business.settings,
                }
            });

        } catch (error) {
            logger.error('Update business settings error:', error);
            next(error);
        }
    }
}

module.exports = new SettingsController();