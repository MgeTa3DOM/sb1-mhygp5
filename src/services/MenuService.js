const { getCanvaInstance } = require('../integrations/canva');
const Menu = require('../models/Menu');
const Product = require('../models/Product');
const Category = require('../models/Category');
const logger = require('../utils/logger');

class MenuService {
  async createMenu(menuData) {
    try {
      const menu = new Menu(menuData);
      await menu.save();

      // Generate menu design using Canva
      const designId = await this.generateMenuDesign(menu);
      
      await Menu.findByIdAndUpdate(menu._id, {
        $set: { canvaDesignId: designId }
      });

      return menu;
    } catch (error) {
      logger.error('Error creating menu:', error);
      throw error;
    }
  }

  async generateMenuDesign(menu) {
    try {
      const canva = getCanvaInstance();
      
      // Create new design from template
      const design = await canva.createDesign({
        templateId: process.env.CANVA_MENU_TEMPLATE_ID,
        brandKit: process.env.CANVA_BRAND_KIT_ID
      });

      // Populate design with menu items
      const categories = await Category.find({ menuId: menu._id });
      for (const category of categories) {
        const products = await Product.find({ categoryId: category._id });
        
        await canva.addMenuSection({
          designId: design.id,
          title: category.name,
          items: products.map(product => ({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image
          }))
        });
      }

      // Export design as PDF
      const pdfUrl = await canva.exportDesign({
        designId: design.id,
        format: 'pdf'
      });

      return design.id;
    } catch (error) {
      logger.error('Error generating menu design:', error);
      throw error;
    }
  }

  async updateMenu(menuId, updates) {
    try {
      const menu = await Menu.findByIdAndUpdate(menuId, updates, { new: true });
      
      // Regenerate menu design if items changed
      if (updates.items || updates.categories) {
        await this.generateMenuDesign(menu);
      }

      return menu;
    } catch (error) {
      logger.error('Error updating menu:', error);
      throw error;
    }
  }

  async addMenuItem(menuId, itemData) {
    try {
      const product = new Product({
        ...itemData,
        menuId: menuId
      });
      await product.save();

      // Update menu design
      const menu = await Menu.findById(menuId);
      await this.generateMenuDesign(menu);

      return product;
    } catch (error) {
      logger.error('Error adding menu item:', error);
      throw error;
    }
  }

  async updateMenuItem(menuId, itemId, updates) {
    try {
      const product = await Product.findByIdAndUpdate(itemId, updates, { new: true });
      
      // Update menu design
      const menu = await Menu.findById(menuId);
      await this.generateMenuDesign(menu);

      return product;
    } catch (error) {
      logger.error('Error updating menu item:', error);
      throw error;
    }
  }

  async getActiveMenu(restaurantId) {
    try {
      const menu = await Menu.findOne({
        restaurantId: restaurantId,
        status: 'active'
      }).populate({
        path: 'categories',
        populate: {
          path: 'products'
        }
      });

      return menu;
    } catch (error) {
      logger.error('Error getting active menu:', error);
      throw error;
    }
  }
}

module.exports = new MenuService();