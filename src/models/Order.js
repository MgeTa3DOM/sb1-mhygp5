const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    customizations: {
      type: Map,
      of: String
    }
  }],
  deliveryAddress: {
    street: String,
    city: String,
    postalCode: String,
    building: String,
    floor: String,
    instructions: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  scheduledDeliveryTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'corporate', 'sumup'],
    required: true
  },
  deliveryDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  tax: Number,
  deliveryFee: Number,
  corporateCode: String,
  specialInstructions: String,
  ratings: {
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String
  },
  timeline: [{
    status: String,
    timestamp: Date,
    note: String
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, scheduledDeliveryTime: 1 });
orderSchema.index({ 'deliveryAddress.coordinates': '2dsphere' });

// Middleware to update timeline
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status updated to ${this.status}`
    });
  }
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;