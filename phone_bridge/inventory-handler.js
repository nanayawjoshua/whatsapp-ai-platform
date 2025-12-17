/**
 * WhatsApp Inventory Command Handler
 * Parses vendor commands for inventory management
 */

const INVENTORY_COMMANDS = {
  ADD_PRODUCT: /(?:add product|new product):\s*(.+)/i,
  CHECK_STOCK: /(?:check stock|stock check):\s*(.+)/i,
  UPDATE_STOCK: /(?:update stock|update qty|update quantity):\s*(.+)/i,
  REMOVE_PRODUCT: /(?:remove product|delete product):\s*(.+)/i,
  LIST_PRODUCTS: /(?:list products|show products|my products)/i,
  LOW_STOCK: /(?:low stock|stock alert)/i,
};

/**
 * Parse product details from vendor message
 * Expected formats:
 * - "Add product: Nike Shoes, ₵450, 10 units"
 * - "Add product: Nike Shoes, 450, 10"
 * - "Nike Shoes, ₵450, 10"
 */
function parseProductDetails(text) {
  // Remove "add product:" prefix if present
  const cleanText = text.replace(/^(?:add product|new product):\s*/i, '').trim();

  // Split by comma
  const parts = cleanText.split(',').map(p => p.trim());

  if (parts.length < 3) {
    return null;
  }

  const name = parts[0];
  const priceStr = parts[1].replace(/[₵GHS]/gi, '').trim();
  const qtyStr = parts[2].replace(/units?/i, '').trim();

  const price = parseFloat(priceStr);
  const quantity = parseInt(qtyStr);

  if (isNaN(price) || isNaN(quantity)) {
    return null;
  }

  // Check if there's a description (4th part)
  const description = parts.length > 3 ? parts.slice(3).join(', ') : null;

  return {
    name,
    price,
    quantity,
    description,
  };
}

/**
 * Parse stock update command
 * Expected formats:
 * - "Update stock: Nike Shoes, add 5"
 * - "Update stock: Nike Shoes, remove 3"
 * - "Update stock: Nike Shoes, set 10"
 */
function parseStockUpdate(text) {
  const cleanText = text.replace(/^(?:update stock|update qty|update quantity):\s*/i, '').trim();
  const parts = cleanText.split(',').map(p => p.trim());

  if (parts.length < 2) {
    return null;
  }

  const productName = parts[0];
  const updateStr = parts[1];

  let operation = 'set';
  let amount = 0;

  if (/add|increase|\+/i.test(updateStr)) {
    operation = 'add';
    amount = parseInt(updateStr.replace(/[^0-9]/g, ''));
  } else if (/remove|decrease|-/i.test(updateStr)) {
    operation = 'subtract';
    amount = parseInt(updateStr.replace(/[^0-9]/g, ''));
  } else if (/set|=/i.test(updateStr)) {
    operation = 'set';
    amount = parseInt(updateStr.replace(/[^0-9]/g, ''));
  } else {
    // Just a number, assume set
    amount = parseInt(updateStr.replace(/[^0-9]/g, ''));
  }

  if (isNaN(amount)) {
    return null;
  }

  return {
    productName,
    operation,
    amount,
  };
}

/**
 * Detect if a message is an inventory command
 */
function detectInventoryCommand(messageText) {
  const text = messageText.trim().toLowerCase();

  if (INVENTORY_COMMANDS.ADD_PRODUCT.test(text)) {
    return 'ADD_PRODUCT';
  }
  if (INVENTORY_COMMANDS.CHECK_STOCK.test(text)) {
    return 'CHECK_STOCK';
  }
  if (INVENTORY_COMMANDS.UPDATE_STOCK.test(text)) {
    return 'UPDATE_STOCK';
  }
  if (INVENTORY_COMMANDS.REMOVE_PRODUCT.test(text)) {
    return 'REMOVE_PRODUCT';
  }
  if (INVENTORY_COMMANDS.LIST_PRODUCTS.test(text)) {
    return 'LIST_PRODUCTS';
  }
  if (INVENTORY_COMMANDS.LOW_STOCK.test(text)) {
    return 'LOW_STOCK';
  }

  return null;
}

/**
 * Process inventory command and return response
 */
async function handleInventoryCommand(commandType, messageText, vendorId, supabaseClient) {
  try {
    switch (commandType) {
      case 'ADD_PRODUCT': {
        const productDetails = parseProductDetails(messageText);
        if (!productDetails) {
          return {
            success: false,
            message: '❌ Invalid format. Use: "Add product: Product Name, ₵Price, Quantity"\nExample: "Add product: Nike Shoes, ₵450, 10"',
          };
        }

        const { data: product, error } = await supabaseClient
          .from('products')
          .insert({
            vendor_id: vendorId,
            name: productDetails.name,
            description: productDetails.description,
            price: productDetails.price,
            quantity: productDetails.quantity,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding product:', error);
          return {
            success: false,
            message: '❌ Failed to add product. Please try again.',
          };
        }

        return {
          success: true,
          message: `✅ *Product Added!*\n\n📦 ${product.name}\n💰 ₵${product.price.toFixed(2)}\n📊 ${product.quantity} units in stock\n\nManage it on your dashboard or send "List products" to see all.`,
        };
      }

      case 'CHECK_STOCK': {
        const productName = messageText.replace(/^(?:check stock|stock check):\s*/i, '').trim();

        const { data: products, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId)
          .ilike('name', `%${productName}%`)
          .eq('is_active', true);

        if (error || !products || products.length === 0) {
          return {
            success: false,
            message: `❌ No product found matching "${productName}". Send "List products" to see all.`,
          };
        }

        if (products.length === 1) {
          const p = products[0];
          const stockStatus = p.quantity <= p.low_stock_threshold ? '⚠️ LOW STOCK' : '✅ In Stock';
          return {
            success: true,
            message: `📦 *${p.name}*\n${stockStatus}\n\n💰 Price: ₵${p.price.toFixed(2)}\n📊 Stock: ${p.quantity} units\n${p.description ? `📝 ${p.description}` : ''}`,
          };
        } else {
          const list = products.map(p => `• ${p.name} - ${p.quantity} units (₵${p.price.toFixed(2)})`).join('\n');
          return {
            success: true,
            message: `Found ${products.length} products matching "${productName}":\n\n${list}`,
          };
        }
      }

      case 'UPDATE_STOCK': {
        const updateDetails = parseStockUpdate(messageText);
        if (!updateDetails) {
          return {
            success: false,
            message: '❌ Invalid format. Use: "Update stock: Product Name, add 5"\nOr: "Update stock: Product Name, remove 3"',
          };
        }

        // Find product
        const { data: products, error: findError } = await supabaseClient
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId)
          .ilike('name', `%${updateDetails.productName}%`)
          .eq('is_active', true);

        if (findError || !products || products.length === 0) {
          return {
            success: false,
            message: `❌ Product "${updateDetails.productName}" not found.`,
          };
        }

        if (products.length > 1) {
          const list = products.map(p => `• ${p.name}`).join('\n');
          return {
            success: false,
            message: `❌ Multiple products found. Please be more specific:\n\n${list}`,
          };
        }

        const product = products[0];
        let newQuantity = product.quantity;

        if (updateDetails.operation === 'add') {
          newQuantity += updateDetails.amount;
        } else if (updateDetails.operation === 'subtract') {
          newQuantity -= updateDetails.amount;
        } else {
          newQuantity = updateDetails.amount;
        }

        // Ensure quantity doesn't go negative
        if (newQuantity < 0) {
          return {
            success: false,
            message: `❌ Cannot set quantity below 0. Current: ${product.quantity} units.`,
          };
        }

        const { error: updateError } = await supabaseClient
          .from('products')
          .update({ quantity: newQuantity })
          .eq('product_id', product.product_id);

        if (updateError) {
          console.error('Error updating stock:', updateError);
          return {
            success: false,
            message: '❌ Failed to update stock. Please try again.',
          };
        }

        const stockStatus = newQuantity <= product.low_stock_threshold ? '⚠️ LOW STOCK' : '✅ Updated';
        return {
          success: true,
          message: `${stockStatus}\n\n📦 *${product.name}*\nOld: ${product.quantity} → New: ${newQuantity} units`,
        };
      }

      case 'REMOVE_PRODUCT': {
        const productName = messageText.replace(/^(?:remove product|delete product):\s*/i, '').trim();

        const { data: products, error: findError } = await supabaseClient
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId)
          .ilike('name', `%${productName}%`);

        if (findError || !products || products.length === 0) {
          return {
            success: false,
            message: `❌ Product "${productName}" not found.`,
          };
        }

        if (products.length > 1) {
          const list = products.map(p => `• ${p.name}`).join('\n');
          return {
            success: false,
            message: `❌ Multiple products found. Please be more specific:\n\n${list}`,
          };
        }

        // Deactivate instead of delete (soft delete)
        const { error: deleteError } = await supabaseClient
          .from('products')
          .update({ is_active: false })
          .eq('product_id', products[0].product_id);

        if (deleteError) {
          console.error('Error removing product:', deleteError);
          return {
            success: false,
            message: '❌ Failed to remove product. Please try again.',
          };
        }

        return {
          success: true,
          message: `✅ Removed "${products[0].name}" from your inventory.`,
        };
      }

      case 'LIST_PRODUCTS': {
        const { data: products, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId)
          .eq('is_active', true)
          .order('name');

        if (error || !products || products.length === 0) {
          return {
            success: true,
            message: '📦 Your inventory is empty.\n\nAdd your first product:\n"Add product: Product Name, ₵Price, Quantity"',
          };
        }

        const total = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const lowStock = products.filter(p => p.quantity <= p.low_stock_threshold);

        let message = `📦 *Your Products* (${products.length} total)\n\n`;

        products.forEach((p, i) => {
          const status = p.quantity <= p.low_stock_threshold ? '⚠️' : '✅';
          message += `${i + 1}. ${status} ${p.name}\n   ₵${p.price.toFixed(2)} × ${p.quantity} units\n`;
        });

        message += `\n💰 Total Inventory Value: ₵${total.toFixed(2)}`;

        if (lowStock.length > 0) {
          message += `\n\n⚠️ *Low Stock Warning:*\n`;
          lowStock.forEach(p => {
            message += `• ${p.name} (${p.quantity} left)\n`;
          });
        }

        return {
          success: true,
          message,
        };
      }

      case 'LOW_STOCK': {
        const { data: products, error } = await supabaseClient
          .from('products')
          .select('*')
          .eq('vendor_id', vendorId)
          .eq('is_active', true)
          .lte('quantity', 5)
          .order('quantity');

        if (error || !products || products.length === 0) {
          return {
            success: true,
            message: '✅ All products are well stocked! No low stock alerts.',
          };
        }

        let message = `⚠️ *Low Stock Alert*\n${products.length} ${products.length === 1 ? 'product needs' : 'products need'} restocking:\n\n`;

        products.forEach((p, i) => {
          message += `${i + 1}. ${p.name}\n   Only ${p.quantity} units left!\n   💰 ₵${p.price.toFixed(2)}\n`;
        });

        return {
          success: true,
          message,
        };
      }

      default:
        return {
          success: false,
          message: '❌ Unknown inventory command.',
        };
    }
  } catch (error) {
    console.error('Error handling inventory command:', error);
    return {
      success: false,
      message: '❌ Something went wrong. Please try again.',
    };
  }
}

module.exports = {
  detectInventoryCommand,
  handleInventoryCommand,
  parseProductDetails,
  parseStockUpdate,
};
