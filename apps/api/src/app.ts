import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import healthRoutes from "./modules/health/health.routes.js";
import categoriesRoutes from "./modules/categories/categories.routes.js";
import suppliersRoutes from "./modules/suppliers/suppliers.routes.js";
import supplierOrdersRoutes from "./modules/suppliers/supplier-orders.routes.js";
import productsRoutes from "./modules/products/products.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import ordersRoutes from "./modules/orders/orders.routes.js";
import checkoutRoutes from "./modules/cart/checkout.routes.js";
import cartRoutes from "./modules/cart/cart.routes.js";
import customersRoutes from "./modules/customers/customers.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth.js";
import { meRoutes } from "./modules/me/me.routes.js";
import { adminRoutes } from "./modules/admins/admins.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./utils/httpError.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.WEB_ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));

// 1. Better Auth MUST be before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

// 2. Body parsing for OUR custom routes
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/me", meRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/suppliers", suppliersRoutes);
app.use("/api/supplier-orders", supplierOrdersRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/reports", reportsRoutes);

app.use((req, res, next) => {
  next(notFound(`Route ${req.method} ${req.url} not found`));
});

app.use(errorHandler);

export { app };