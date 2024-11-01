const axios = require('axios');
const logger = require('../utils/logger');

class SumUpIntegration {
  constructor(config) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = 'https://api.sumup.com/v0.1';
    this.accessToken = null;
  }

  async initialize() {
    await this.authenticate();
    this.setupWebhooks();
  }

  async authenticate() {
    try {
      const response = await axios.post('https://api.sumup.com/token', {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      });
      this.accessToken = response.data.access_token;
    } catch (error) {
      logger.error('SumUp authentication failed:', error);
      throw error;
    }
  }

  // POS Integration
  async createTransaction(orderData) {
    try {
      return await axios.post(`${this.baseUrl}/transactions`, orderData, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
    } catch (error) {
      logger.error('Error creating SumUp transaction:', error);
      throw error;
    }
  }

  // Stock Management
  async updateInventory(productId, quantity) {
    try {
      return await axios.put(`${this.baseUrl}/inventory/${productId}`, {
        quantity
      }, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
    } catch (error) {
      logger.error('Error updating SumUp inventory:', error);
      throw error;
    }
  }

  // eShop Integration
  async syncProducts() {
    try {
      const products = await axios.get(`${this.baseUrl}/products`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      });
      return products.data;
    } catch (error) {
      logger.error('Error syncing SumUp products:', error);
      throw error;
    }
  }

  setupWebhooks() {
    // Setup webhooks for real-time updates
    const webhookEndpoints = [
      '/webhooks/sumup/transactions',
      '/webhooks/sumup/inventory',
      '/webhooks/sumup/products'
    ];

    webhookEndpoints.forEach(async (endpoint) => {
      try {
        await axios.post(`${this.baseUrl}/webhooks`, {
          url: `${process.env.BASE_URL}${endpoint}`,
          events: ['*']
        }, {
          headers: { Authorization: `Bearer ${this.accessToken}` }
        });
      } catch (error) {
        logger.error(`Error setting up SumUp webhook for ${endpoint}:`, error);
      }
    });
  }
}

let sumupInstance = null;

function initializeSumUp(config) {
  if (!sumupInstance) {
    sumupInstance = new SumUpIntegration(config);
    return sumupInstance.initialize();
  }
  return Promise.resolve(sumupInstance);
}

module.exports = {
  initializeSumUp,
  getSumUpInstance: () => sumupInstance
};