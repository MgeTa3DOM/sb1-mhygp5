const Bull = require('bull');
const Order = require('../models/Order');
const Kitchen = require('../models/Kitchen');
const NotificationService = require('./NotificationService');
const logger = require('../utils/logger');

class KitchenService {
  constructor() {
    this.orderQueue = new Bull('kitchen-orders');
    this.setupQueueProcessors();
  }

  setupQueueProcessors() {
    this.orderQueue.process(async (job) => {
      const { order, kitchen } = job.data;
      return await this.processKitchenOrder(order, kitchen);
    });
  }

  async processKitchenOrder(order, kitchen) {
    try {
      // Update order status
      await Order.findByIdAndUpdate(order._id, {
        $set: { status: 'preparing' }
      });

      // Notify kitchen staff
      await NotificationService.sendKitchenNotification({
        kitchen: kitchen,
        order: order
      });

      // Start preparation time tracking
      await this.startPreparationTracking(order._id);

      return { success: true };
    } catch (error) {
      logger.error('Error processing kitchen order:', error);
      throw error;
    }
  }

  async startPreparationTracking(orderId) {
    const startTime = new Date();
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        'preparation.startTime': startTime
      }
    });
  }

  async completePreparation(orderId) {
    const endTime = new Date();
    const order = await Order.findById(orderId);
    
    const preparationTime = endTime - order.preparation.startTime;
    
    await Order.findByIdAndUpdate(orderId, {
      $set: {
        status: 'ready',
        'preparation.endTime': endTime,
        'preparation.duration': preparationTime
      }
    });

    // Notify delivery service
    await NotificationService.sendDriverAlert({
      order: order,
      alert: 'Order ready for pickup'
    });
  }

  async getKitchenCapacity(kitchenId) {
    const kitchen = await Kitchen.findById(kitchenId);
    const activeOrders = await Order.countDocuments({
      kitchenId: kitchenId,
      status: 'preparing'
    });

    return {
      maxCapacity: kitchen.maxOrders,
      currentLoad: activeOrders,
      availableCapacity: kitchen.maxOrders - activeOrders
    };
  }

  async updatePreparationStatus(orderId, status, notes = '') {
    await Order.findByIdAndUpdate(orderId, {
      $set: { status: status },
      $push: {
        timeline: {
          status: status,
          timestamp: new Date(),
          note: notes
        }
      }
    });

    // Notify customer of status update
    const order = await Order.findById(orderId).populate('customerId');
    await NotificationService.sendOrderStatusNotification({
      customer: order.customerId,
      order: order,
      status: status
    });
  }
}

module.exports = new KitchenService();