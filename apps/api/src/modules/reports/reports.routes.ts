import { Router } from "express";
import { db, orders, orderDetails, customer, user, product, category, inventory, payment, sql, eq, desc, and, gte, lte } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";

const router = Router();
router.use(requireAdmin);

// GET /api/reports/dashboard — high-level stats and analytics
router.get("/dashboard", async (_req, res, next) => {
  try {
    const [totalOrders] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const [totalRevenue] = await db.select({ sum: sql<string>`coalesce(sum(total_amount), 0)` }).from(orders);
    const [totalCustomers] = await db.select({ count: sql<number>`count(*)::int` }).from(customer);
    const [totalProducts] = await db.select({ count: sql<number>`count(*)::int` }).from(product).where(eq(product.isActive, true));

    const lowStockItems = await db
      .select({
        productId: inventory.productId,
        productName: product.productName,
        currentStock: inventory.currentStock,
        reorderLevel: inventory.reorderLevel,
        imageUrl: product.imageUrl,
      })
      .from(inventory)
      .leftJoin(product, eq(inventory.productId, product.productId))
      .where(sql`${inventory.currentStock} <= ${inventory.reorderLevel}`)
      .limit(10);

    const recentOrders = await db
      .select({
        orderId: orders.orderId,
        orderDate: orders.orderDate,
        orderStatus: orders.orderStatus,
        totalAmount: orders.totalAmount,
        customerName: user.name,
      })
      .from(orders)
      .leftJoin(customer, eq(orders.customerId, customer.customerId))
      .leftJoin(user, eq(customer.userId, user.id))
      .orderBy(desc(orders.orderDate))
      .limit(5);

    const ordersByStatus = await db
      .select({ status: orders.orderStatus, count: sql<number>`count(*)::int` })
      .from(orders)
      .groupBy(orders.orderStatus);

    // Category Sales breakdown
    const categorySalesRaw = await db
      .select({
        categoryId: product.categoryId,
        categoryName: sql<string>`coalesce(${category.categoryName}, 'Uncategorized')`,
        totalRevenue: sql<string>`coalesce(sum(${orderDetails.quantity} * ${orderDetails.unitPrice}), 0)`,
        unitsSold: sql<number>`coalesce(sum(${orderDetails.quantity}), 0)::int`,
      })
      .from(orderDetails)
      .innerJoin(product, eq(orderDetails.productId, product.productId))
      .leftJoin(category, eq(product.categoryId, category.categoryId))
      .groupBy(product.categoryId, category.categoryName)
      .orderBy(desc(sql`sum(${orderDetails.quantity} * ${orderDetails.unitPrice})`));

    // Top Selling Products
    const topProducts = await db
      .select({
        productId: product.productId,
        productName: product.productName,
        categoryName: sql<string>`coalesce(${category.categoryName}, 'General')`,
        imageUrl: product.imageUrl,
        unitsSold: sql<number>`sum(${orderDetails.quantity})::int`,
        revenue: sql<string>`sum(${orderDetails.quantity} * ${orderDetails.unitPrice})`,
      })
      .from(orderDetails)
      .innerJoin(product, eq(orderDetails.productId, product.productId))
      .leftJoin(category, eq(product.categoryId, category.categoryId))
      .groupBy(product.productId, product.productName, category.categoryName, product.imageUrl)
      .orderBy(desc(sql`sum(${orderDetails.quantity})::int`))
      .limit(5);

    // Sales Trend (Daily revenue)
    const salesTrendRaw = await db
      .select({
        date: sql<string>`to_char(${orders.orderDate}, 'YYYY-MM-DD')`,
        revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
        ordersCount: sql<number>`count(*)::int`,
      })
      .from(orders)
      .groupBy(sql`to_char(${orders.orderDate}, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(${orders.orderDate}, 'YYYY-MM-DD')`);

    res.json({
      totalOrders: totalOrders.count,
      totalRevenue: totalRevenue.sum,
      totalCustomers: totalCustomers.count,
      totalProducts: totalProducts.count,
      lowStockItems,
      recentOrders,
      ordersByStatus,
      categorySales: categorySalesRaw,
      topProducts,
      salesTrend: salesTrendRaw,
    });
  } catch (err) { next(err); }
});

// GET /api/reports/sales?from=&to=
router.get("/sales", async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const conditions: any[] = [];
    if (from) conditions.push(gte(orders.orderDate, new Date(from)));
    if (to) conditions.push(lte(orders.orderDate, new Date(to)));

    const rows = await db
      .select({
        productId: orderDetails.productId,
        productName: product.productName,
        totalQty: sql<number>`sum(${orderDetails.quantity})::int`,
        totalRevenue: sql<string>`sum(${orderDetails.quantity} * ${orderDetails.unitPrice})`,
      })
      .from(orderDetails)
      .leftJoin(orders, eq(orderDetails.orderId, orders.orderId))
      .leftJoin(product, eq(orderDetails.productId, product.productId))
      .where(conditions.length ? and(...conditions) : undefined)
      .groupBy(orderDetails.productId, product.productName)
      .orderBy(desc(sql`sum(${orderDetails.quantity} * ${orderDetails.unitPrice})`));

    res.json(rows);
  } catch (err) { next(err); }
});

export default router;
