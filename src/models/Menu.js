const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft'
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  canvaDesignId: String,
  validFrom: Date,
  validTo: Date,
  specialTags: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

menuSchema.index({ restaurantId: 1, status: 1 });
menuSchema.index({ validFrom: 1, validTo: 1 });

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;