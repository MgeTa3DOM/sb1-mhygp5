const { initializeSumUp } = require('./sumup');
const { initializeBrevo } = require('./brevo');
const { initializeWhatsApp } = require('./whatsapp');
const { initializeCanva } = require('./canva');
const logger = require('../utils/logger');

async function initializeIntegrations() {
  try {
    // Initialize SumUp integration (POS, eShop, and Stock Management)
    await initializeSumUp({
      clientId: process.env.SUMUP_CLIENT_ID,
      clientSecret: process.env.SUMUP_CLIENT_SECRET,
      scope: ['transactions', 'products', 'inventory']
    });

    // Initialize Brevo (formerly Sendinblue) for email marketing
    await initializeBrevo({
      apiKey: process.env.BREVO_API_KEY,
      templates: {
        orderConfirmation: 'template_1',
        deliveryUpdate: 'template_2',
        marketing: 'template_3'
      }
    });

    // Initialize WhatsApp Business API
    await initializeWhatsApp({
      accountId: process.env.WHATSAPP_ACCOUNT_ID,
      apiKey: process.env.WHATSAPP_API_KEY,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
    });

    // Initialize Canva integration for menu design
    await initializeCanva({
      apiKey: process.env.CANVA_API_KEY,
      brandKit: process.env.CANVA_BRAND_KIT_ID
    });

    logger.info('All integrations initialized successfully');
  } catch (error) {
    logger.error('Error initializing integrations:', error);
    throw error;
  }
}

module.exports = {
  initializeIntegrations
};