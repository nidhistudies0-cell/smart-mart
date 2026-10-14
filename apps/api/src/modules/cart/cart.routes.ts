import { Router } from "express";
import {
  db,
  cart,
  product,
  category,
  inventory,
  eq,
  and,
  sql,
} from "@smartmart/db";
import { requireCustomer } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();

// All cart endpoints require an authenticated customer
router.use(requireCustomer);

/**
 * GET /api/cart
 * Retrieves the current customer's cart with product details.
 */
router.get("/", async (req, res, next) => {
  try {
    const customerId = req.auth!.customerId!;

    const rows = await db
      .select({
        cartId: cart.cartId,
        productId: cart.productId,
        quantity: cart.quantity,
        addedDate: cart.addedDate,
        productName: product.productName,
        price: product.price,
        imageUrl: product.imageUrl,
        description: product.description,
        categoryId: product.categoryId,
        categoryName: category.categoryName,
        currentStock: inventory.currentStock,
        isActive: product.isActive,
      })
      .from(cart)
      .innerJoin(product, eq(cart.productId, product.productId))
      .leftJoin(category, eq(product.categoryId, category.categoryId))
      .leftJoin(inventory, eq(product.productId, inventory.productId))
      .where(eq(cart.customerId, customerId));

    const items = rows.map((r) => ({
      cartId: r.cartId,
      quantity: r.quantity,
      product: {
        productId: r.productId,
        productName: r.productName,
        price: Number(r.price),
        imageUrl: r.imageUrl || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80",
        description: r.description,
        categoryId: r.categoryId,
        categoryName: r.categoryName || undefined,
        currentStock: r.currentStock ?? 999,
        isActive: r.isActive,
      },
    }));

    res.json({ items });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/cart
 * Adds or increments an item in the customer's cart.
 * Body: { productId: number, quantity?: number }
 */
router.post("/", async (req, res, next) => {
  try {
    const customerId = req.auth!.customerId!;
    const { productId, quantity = 1 } = req.body;

    if (!productId || typeof productId !== "number") {
      return next(badRequest("Valid productId is required"));
    }
    const qty = Math.max(1, Number(quantity));

    // Verify product exists and active
    const [p] = await db
      .select({ productId: product.productId, isActive: product.isActive })
      .from(product)
      .where(eq(product.productId, productId))
      .limit(1);

    if (!p || !p.isActive) {
      return next(notFound("Product not found or inactive"));
    }

    // Check inventory stock
    const [inv] = await db
      .select({ currentStock: inventory.currentStock })
      .from(inventory)
      .where(eq(inventory.productId, productId))
      .limit(1);

    const maxStock = inv?.currentStock ?? 999;
    if (maxStock <= 0) {
      return next(badRequest("Product is out of stock"));
    }

    // Upsert into cart
    const [existing] = await db
      .select()
      .from(cart)
      .where(and(eq(cart.customerId, customerId), eq(cart.productId, productId)))
      .limit(1);

    if (existing) {
      const newQty = Math.min(existing.quantity + qty, maxStock);
      const [updated] = await db
        .update(cart)
        .set({ quantity: newQty })
        .where(eq(cart.cartId, existing.cartId))
        .returning();
      return res.json({ item: updated });
    }

    const [inserted] = await db
      .insert(cart)
      .values({
        customerId,
        productId,
        quantity: Math.min(qty, maxStock),
      })
      .returning();

    res.status(201).json({ item: inserted });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/cart/:productId
 * Updates the quantity of a product in the cart.
 * Body: { quantity: number }
 */
router.put("/:productId", async (req, res, next) => {
  try {
    const customerId = req.auth!.customerId!;
    const productId = Number(req.params.productId);
    const { quantity } = req.body;

    if (isNaN(productId)) {
      return next(badRequest("Invalid productId"));
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      await db
        .delete(cart)
        .where(and(eq(cart.customerId, customerId), eq(cart.productId, productId)));
      return res.json({ success: true, removed: true });
    }

    const [updated] = await db
      .update(cart)
      .set({ quantity: qty })
      .where(and(eq(cart.customerId, customerId), eq(cart.productId, productId)))
      .returning();

    if (!updated) {
      return next(notFound("Item not found in cart"));
    }

    res.json({ item: updated });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart/:productId
 * Removes a specific product from the cart.
 */
router.delete("/:productId", async (req, res, next) => {
  try {
    const customerId = req.auth!.customerId!;
    const productId = Number(req.params.productId);

    if (isNaN(productId)) {
      return next(badRequest("Invalid productId"));
    }

    await db
      .delete(cart)
      .where(and(eq(cart.customerId, customerId), eq(cart.productId, productId)));

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/cart
 * Clears the entire cart for this customer.
 */
router.delete("/", async (req, res, next) => {
  try {
    const customerId = req.auth!.customerId!;
    await db.delete(cart).where(eq(cart.customerId, customerId));
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
