const mongoose = require('mongoose');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Kitchen = require('../models/Kitchen');
const logger = require('../utils/logger');

class AnalyticsService {
  async getDeliveryPerformanceMetrics(timeRange) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const deliveryMetrics = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: '$deliveryDriver',
            totalDeliveries: { $sum: 1 },
            avgDeliveryTime: { $avg: { 
              $subtract: ['$deliveredAt', '$readyAt'] 
            }},
            totalDistance: { $sum: '$deliveryDistance' },
            avgRating: { $avg: '$ratings.delivery' }
          }
        }
      ]);

      return deliveryMetrics;
    } catch (error) {
      logger.error('Error getting delivery performance metrics:', error);
      throw error;
    }
  }

  async getKitchenPerformanceMetrics(timeRange) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const kitchenMetrics = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$kitchenId',
            totalOrders: { $sum: 1 },
            avgPreparationTime: { $avg: '$preparation.duration' },
            avgRating: { $avg: '$ratings.food' }
          }
        }
      ]);

      return kitchenMetrics;
    } catch (error) {
      logger.error('Error getting kitchen performance metrics:', error);
      throw error;
    }
  }

  async getRevenueAnalytics(timeRange) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const revenueMetrics = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: 'delivered'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalRevenue: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
        }
      ]);

      return revenueMetrics;
    } catch (error) {
      logger.error('Error getting revenue analytics:', error);
      throw error;
    }
  }

  async getCustomerAnalytics(timeRange) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      const customerMetrics = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$customerId',
            orderCount: { $sum: 1 },
            totalSpent: { $sum: '$totalAmount' },
            avgOrderValue: { $avg: '$totalAmount' },
            lastOrderDate: { $max: '$createdAt' }
          }
        }
      ]);

      return customerMetrics;
    } catch (error) {
      logger.error('Error getting customer analytics:', error);
      throw error;
    }
  }

  async generatePerformanceReport(timeRange) {
    try {
      const [
        deliveryMetrics,
        kitchenMetrics,
        revenueMetrics,
        customerMetrics
      ] = await Promise.all([
        this.getDeliveryPerformanceMetrics(timeRange),
        this.getKitchenPerformanceMetrics(timeRange),
        this.getRevenueAnalytics(timeRange),
        this.getCustomerAnalytics(timeRange)
      ]);

      return {
        delivery: deliveryMetrics,
        kitchen: kitchenMetrics,
        revenue: revenueMetrics,
        customer: customerMetrics,
        generatedAt: new Date(),
        timeRange: timeRange
      };
    } catch (error) {
      logger.error('Error generating performance report:', error);
      throw error;
    }
  }
}

module.exports = new AnalyticsService();