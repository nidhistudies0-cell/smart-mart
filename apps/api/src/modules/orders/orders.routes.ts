import { Router } from "express";
import { db, orders, orderDetails, product, customer, user, payment, eq, asc, desc, and, ilike } from "@smartmart/db";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound, forbidden } from "../../utils/httpError.js";

const router = Router();

// GET /api/orders?status=&customerId=
// Authenticated customers see only their own orders; admins can view all or filter by customerId
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const conditions: any[] = [];
    const authCtx = req.auth!;

    if (authCtx.role === "admin") {
      // Admins can see all orders or filter by customerId
      if (customerId) conditions.push(eq(orders.customerId, Number(customerId)));
    } else {
      // Regular customer can ONLY view their own orders
      if (!authCtx.customerId) {
        return res.json([]);
      }
      conditions.push(eq(orders.customerId, authCtx.customerId));
    }

    if (status) conditions.push(eq(orders.orderStatus, status as any));

    const rows = await db
      .select({
        orderId: orders.orderId,
        orderDate: orders.orderDate,
        orderStatus: orders.orderStatus,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        customerId: orders.customerId,
        customerName: user.name,
        customerEmail: user.email,
      })
      .from(orders)
      .leftJoin(customer, eq(orders.customerId, customer.customerId))
      .leftJoin(user, eq(customer.userId, user.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(orders.orderDate));
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/orders/:id  — includes order items
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const authCtx = req.auth!;

    const [order] = await db
      .select({
        orderId: orders.orderId,
        orderDate: orders.orderDate,
        orderStatus: orders.orderStatus,
        totalAmount: orders.totalAmount,
        shippingAddress: orders.shippingAddress,
        customerId: orders.customerId,
        customerName: user.name,
        customerEmail: user.email,
      })
      .from(orders)
      .leftJoin(customer, eq(orders.customerId, customer.customerId))
      .leftJoin(user, eq(customer.userId, user.id))
      .where(eq(orders.orderId, id));
    if (!order) return next(notFound("Order not found"));

    // Verify ownership: customers can only view their own order
    if (authCtx.role !== "admin" && order.customerId !== authCtx.customerId) {
      return next(forbidden("You do not have access to view this order"));
    }

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
      .where(eq(orderDetails.orderId, id));

    const [pay] = await db.select().from(payment).where(eq(payment.orderId, id));

    res.json({ ...order, items, payment: pay ?? null });
  } catch (err) { next(err); }
});

// PATCH /api/orders/:id/status (Admin only)
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { orderStatus } = req.body as { orderStatus?: string };
    if (!orderStatus) return next(badRequest("orderStatus is required"));
    const [row] = await db.update(orders).set({ orderStatus: orderStatus as any }).where(eq(orders.orderId, id)).returning();
    if (!row) return next(notFound("Order not found"));
    res.json(row);
  } catch (err) { next(err); }
});

export default router;
