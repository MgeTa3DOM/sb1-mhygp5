const Bull = require('bull');
const { getSumUpInstance } = require('../integrations/sumup');
const { getBrevoInstance } = require('../integrations/brevo');
const { getWhatsAppInstance } = require('../integrations/whatsapp');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.notificationQueue = new Bull('notifications');
    this.setupQueueProcessors();
  }

  setupQueueProcessors() {
    this.notificationQueue.process(async (job) => {
      const { type, data } = job.data;
      return await this.processNotification(type, data);
    });
  }

  async processNotification(type, data) {
    try {
      switch (type) {
        case 'order_status':
          await this.sendOrderStatusNotification(data);
          break;
        case 'delivery_update':
          await this.sendDeliveryUpdate(data);
          break;
        case 'driver_alert':
          await this.sendDriverAlert(data);
          break;
        case 'kitchen_notification':
          await this.sendKitchenNotification(data);
          break;
        default:
          logger.warn(`Unknown notification type: ${type}`);
      }
    } catch (error) {
      logger.error('Error processing notification:', error);
      throw error;
    }
  }

  async sendOrderStatusNotification(data) {
    const { customer, order, status } = data;
    
    // Send email notification
    await getBrevoInstance().sendTransactionalEmail({
      to: customer.email,
      templateId: 'order_status_update',
      params: {
        orderNumber: order.id,
        status: status,
        trackingLink: `${process.env.CLIENT_URL}/track/${order.id}`
      }
    });

    // Send WhatsApp notification if customer opted in
    if (customer.whatsappOptIn) {
      await getWhatsAppInstance().sendMessage({
        to: customer.phone,
        template: 'order_status_update',
        params: {
          orderNumber: order.id,
          status: status
        }
      });
    }

    // Send push notification if mobile app token exists
    if (customer.pushToken) {
      await this.sendPushNotification(customer.pushToken, {
        title: 'Order Status Update',
        body: `Your order #${order.id} is now ${status}`,
        data: {
          orderId: order.id,
          status: status
        }
      });
    }
  }

  async sendDeliveryUpdate(data) {
    const { order, location, estimatedTime } = data;
    
    await this.notificationQueue.add({
      type: 'customer_notification',
      data: {
        customerId: order.customerId,
        message: `Your delivery is ${estimatedTime} minutes away`,
        location: location
      }
    });
  }

  async sendDriverAlert(data) {
    const { driver, alert } = data;
    
    await this.notificationQueue.add({
      type: 'driver_notification',
      data: {
        driverId: driver.id,
        alert: alert
      }
    });
  }

  async sendKitchenNotification(data) {
    const { kitchen, order } = data;
    
    // Send notification to kitchen display system
    await this.notificationQueue.add({
      type: 'kitchen_display',
      data: {
        kitchenId: kitchen.id,
        order: order
      }
    });
  }

  async sendPushNotification(token, notification) {
    // Implementation of push notification using Firebase Cloud Messaging
    try {
      const message = {
        token: token,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data
      };

      await admin.messaging().send(message);
    } catch (error) {
      logger.error('Error sending push notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();