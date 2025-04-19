// Helper function to format errors
const handleError = (res, error, message = "Server error") => {
  console.error(`Error in Cart Controller: ${error.message}`);
  res.status(500).json({
    message,
    error: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
};

// Get cart items
export const getCartItems = async (req, res) => {
  try {
    const user = await req.user.populate({
      path: "cartItems.product",
      model: "Product",
      options: { lean: true },
    });

    // Remove orphaned cart items (when product no longer exists)
    const validCartItems = user.cartItems.filter((item) => !!item.product);
    if (validCartItems.length !== user.cartItems.length) {
      user.cartItems = validCartItems;
      await user.save();
    }

    res.json(
      validCartItems.map((item) => ({
        ...item.product,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
        cartItemId: item._id,
      }))
    );
  } catch (error) {
    handleError(res, error);
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, color, size } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = req.user;

    // Check if item already exists in cart
    const existingItem = user.cartItems.find(
      (item) =>
        item.product?.toString() === productId.toString() &&
        item.color === color &&
        item.size === size
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cartItems.push({
        product: productId,
        quantity: 1,
        color: color || null,
        size: size || null,
      });
    }

    await user.save();
    res.status(201).json({ message: "Item added to cart", cart: user.cartItems });
  } catch (error) {
    handleError(res, error);
  }
};

// Remove specific product from cart or clear entire cart
export const removeAllFromCart = async (req, res) => {
  try {
    const { productId, color, size } = req.body;
    const user = req.user;

    if (productId) {
      user.cartItems = user.cartItems.filter(
        (item) =>
          item.product.toString() !== productId.toString() ||
          item.color !== color ||
          item.size !== size
      );
    } else {
      user.cartItems = [];
    }

    await user.save();
    res.json({ message: "Cart updated", cart: user.cartItems });
  } catch (error) {
    handleError(res, error);
  }
};

// Update item quantity in cart
export const updateQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;
    const user = req.user;

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).json({ message: "Invalid quantity value" });
    }

    const existingItem = user.cartItems.id(cartItemId);

    if (!existingItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (quantity === 0) {
      user.cartItems = user.cartItems.filter(
        (item) => item._id.toString() !== cartItemId
      );
    } else {
      existingItem.quantity = quantity;
    }

    await user.save();
    res.json({ message: "Cart updated", cart: user.cartItems });
  } catch (error) {
    handleError(res, error);
  }
};
