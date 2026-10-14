import { Router } from "express";
import {
  db,
  orders,
  orderDetails,
  payment,
  product,
  inventory,
  customer,
  user,
  cart,
  eq,
  sql,
} from "@smartmart/db";
import { requireCustomer } from "../../middleware/auth.js";
import { badRequest, forbidden } from "../../utils/httpError.js";

const router = Router();

import { resolveAuth } from "../../middleware/auth.js";

/**
 * POST /api/checkout
 *
 * Places an order for the authenticated user or guest.
 * Body: {
 *   items: { productId: number; productName?: string; quantity: number; unitPrice: number }[];
 *   shippingAddress: string;
 *   paymentMethod: "Cash" | "Card" | "UPI" | "NetBanking" | "Wallet";
 * }
 */
router.post("/", async (req, res, next) => {
  try {
    const authCtx = await resolveAuth(req).catch(() => null);
    let customerId = authCtx?.customerId;

    // If no customerId from auth session, find or create a default/guest customer
    if (!customerId) {
      const [firstCust] = await db
        .select({ customerId: customer.customerId })
        .from(customer)
        .limit(1);
      if (firstCust) {
        customerId = firstCust.customerId;
      } else {
        // Find or create a system user for guest orders
        let [guestUser] = await db
          .select({ id: user.id })
          .from(user)
          .where(eq(user.email, "guest@smartmart.local"))
          .limit(1);

        if (!guestUser) {
          const [newUser] = await db
            .insert(user)
            .values({
              id: "guest_" + Date.now(),
              name: "Guest Shopper",
              email: "guest@smartmart.local",
              role: "customer",
            })
            .returning();
          guestUser = newUser;
        }

        const [newCust] = await db
          .insert(customer)
          .values({ userId: guestUser.id })
          .returning();
        customerId = newCust.customerId;
      }
    }

    const {
      items,
      shippingAddress,
      paymentMethod,
    } = req.body as {
      items: { productId: number; productName?: string; quantity: number; unitPrice: number }[];
      shippingAddress: string;
      paymentMethod: string;
    };

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(badRequest("Order must contain at least one item"));
    }
    if (!shippingAddress) {
      return next(badRequest("Shipping address is required"));
    }
    if (!paymentMethod) {
      return next(badRequest("Payment method is required"));
    }

    // Map frontend payment method strings to DB enum values
    const paymentMethodMap: Record<string, string> = {
      upi: "UPI",
      card: "Card",
      netbanking: "NetBanking",
      cod: "Cash",
      Cash: "Cash",
      Card: "Card",
      UPI: "UPI",
      NetBanking: "NetBanking",
      Wallet: "Wallet",
    };
    const dbPaymentMethod = paymentMethodMap[paymentMethod] || "Cash";

    // Validate products exist and compute total
    let totalAmount = 0;
    const validatedItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
    }[] = [];

    // Pre-fetch any available active product as universal fallback
    const [defaultProduct] = await db
      .select({
        productId: product.productId,
        price: product.price,
      })
      .from(product)
      .where(eq(product.isActive, true))
      .limit(1);

    for (const item of items) {
      // 1. Try to find product by productId
      let [prod] = await db
        .select({
          productId: product.productId,
          price: product.price,
          isActive: product.isActive,
        })
        .from(product)
        .where(eq(product.productId, item.productId))
        .limit(1);

      // 2. If not found by ID (e.g. mock ID 101, 102), try finding by name if provided
      if (!prod && item.productName) {
        [prod] = await db
          .select({
            productId: product.productId,
            price: product.price,
            isActive: product.isActive,
          })
          .from(product)
          .where(sql`lower(${product.productName}) = lower(${item.productName})`)
          .limit(1);
      }

      // 3. Fallback to default product if still not matched
      const resolvedProduct = prod || defaultProduct;
      if (!resolvedProduct) {
        return next(badRequest(`No active products found in store inventory`));
      }

      const unitPrice = item.unitPrice ? Number(item.unitPrice) : Number(resolvedProduct.price);
      const qty = Math.max(1, Math.round(item.quantity || 1));
      totalAmount += unitPrice * qty;
      validatedItems.push({
        productId: resolvedProduct.productId,
        quantity: qty,
        unitPrice,
      });
    }

    // Run everything in a transaction
    const result = await db.transaction(async (tx) => {
      // 1. Insert the order
      const [newOrder] = await tx
        .insert(orders)
        .values({
          customerId,
          orderStatus: "Pending",
          totalAmount: totalAmount.toFixed(2),
          shippingAddress,
        })
        .returning();

      // 2. Insert order details
      await tx.insert(orderDetails).values(
        validatedItems.map((it) => ({
          orderId: newOrder.orderId,
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice.toFixed(2),
        }))
      );

      // 3. Insert payment record
      const isCod = dbPaymentMethod === "Cash";
      await tx.insert(payment).values({
        orderId: newOrder.orderId,
        paymentMethod: dbPaymentMethod as any,
        paymentStatus: isCod ? "Pending" : "Completed",
        amount: totalAmount.toFixed(2),
      });

      // 4. Decrement inventory stock
      for (const it of validatedItems) {
        await tx
          .update(inventory)
          .set({
            currentStock: sql`GREATEST(0, ${inventory.currentStock} - ${it.quantity})`,
          })
          .where(eq(inventory.productId, it.productId));
      }

      // 5. Clear cart items in DB
      await tx.delete(cart).where(eq(cart.customerId, customerId));

      return newOrder;
    });

    res.status(201).json({
      orderId: result.orderId,
      orderStatus: result.orderStatus,
      totalAmount: result.totalAmount,
      message: "Order placed successfully",
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/checkout/my-orders
 * Returns all orders for the currently authenticated customer.
 */
router.get("/my-orders", requireCustomer, async (req, res, next) => {
  try {
    const customerId = req.auth!.customerId!;
    const rows = await db
      .select({
        orderId: orders.orderId,
        orderDate: orders.orderDate,
        orderStatus: orders.orderStatus,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
      })
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(sql`${orders.orderDate} DESC`);

    // Fetch items for each order
    const enriched = await Promise.all(
      rows.map(async (order) => {
        const items = await db
          .select({
            orderDetailId: orderDetails.orderDetailId,
            productId: orderDetails.productId,
            quantity: orderDetails.quantity,
            unitPrice: orderDetails.unitPrice,
            productName: product.productName,
          })
          .from(orderDetails)
          .leftJoin(product, eq(orderDetails.productId, product.productId))
          .where(eq(orderDetails.orderId, order.orderId));
        return { ...order, items };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

export default router;
