# SmartMart — Full-Stack Grocery & Supermarket Management System

SmartMart is a production-grade, full-stack grocery e-commerce and retail inventory platform built with **Next.js (App Router)**, **Express.js**, and **PostgreSQL (via Drizzle ORM)**. It supports an end-to-end retail lifecycle—from customer discovery, live cart synchronisation, and checkout to real-time inventory deduction, supplier procurement, and admin business intelligence analytics.

---

## 📑 Table of Contents
1. [Project Overview](#project-overview)
2. [Why SmartMart is an Exemplary DBMS Project](#why-smartmart-is-an-exemplary-dbms-project)
3. [Database Architecture & Entity-Relationship Model](#database-architecture--entity-relationship-model)
4. [Relational Schema & Key Tables](#relational-schema--key-tables)
5. [DBMS Concepts Demonstrated](#dbms-concepts-demonstrated)
6. [Monorepo Architecture & Key Files](#monorepo-architecture--key-files)
7. [API & Data Flow](#api--data-flow)
8. [Setup & Running Locally](#setup--running-locally)

---

## Project Overview

SmartMart provides dual experiences:
1. **Customer Web Storefront (`apps/web`):**
   - Dynamic catalog browsing with category filtering, keyword search, price sliders, and real-time inventory indicators.
   - Synchronized cart: Cart items are recorded in PostgreSQL for authenticated users, preserving sessions across devices.
   - Full checkout flow: Supports UPI, Card, NetBanking, and Cash on Delivery (COD) with immediate stock deduction and order confirmation.
   - Profile management: Edit user info, manage delivery addresses, and track historical orders.

2. **Admin Management & Analytics Dashboard (`apps/web/src/app/admin`):**
   - **Reports & Analytics:** Dynamic 7-day revenue trend curves, live category revenue breakdown donut charts, and order status overview charts computed from raw database records.
   - **Product & Inventory Control:** Real-time stock adjustment, reorder level tracking, and automated low-stock warnings.
   - **Supplier Procurement:** Manage supplier relationships and track inbound supplier purchase orders.

---

## Why SmartMart is an exemplary DBMS Project

SmartMart was engineered from the schema upward to demonstrate real-world Database Management System (DBMS) principles beyond basic CRUD:

| DBMS Evaluation Metric | Implementation in SmartMart |
| :--- | :--- |
| **Relational Integrity & Normalisation** | Designed strictly in **Third Normal Form (3NF)** with 16 interconnected relational entities, preventing duplicate updates and insertion anomalies. |
| **Strict ACID Compliance & Transactions** | Checkout, stock deduction, and supplier receiving are wrapped in strict atomic transactions (`db.transaction`). If stock runs out during checkout, the order, payment, and cart deletion automatically roll back. |
| **Historical Data Integrity (Snapshots)** | Prices change over time. `order_details` and `supplier_order_item` capture historical `unit_price` / `unit_cost` snapshots rather than relying on dynamic joins to `product.price`. |
| **Domain-Level Constraints & Checks** | Enforced at the engine level: `CHECK (current_stock >= 0)`, `CHECK (quantity > 0)`, `CHECK (total_amount >= 0)`, and unique composite constraints `UNIQUE(customer_id, product_id)`. |
| **Referential Integrity Cascades** | Explicit `onDelete: "cascade"` for parent-child dependencies (`order_details` on `orders`, `inventory` on `product`) and `onDelete: "restrict"` to prevent accidental deletion of products linked to existing sales. |
| **Multi-Table Analytical Aggregations** | Complex SQL group-bys, window functions, and multi-table joins (`orders` $\times$ `order_details` $\times$ `product` $\times$ `category`) power live BI metrics with sub-millisecond query execution. |
| **High Performance Indexing** | Foreign keys, order dates, and status columns are indexed to optimize queries as tables scale into millions of rows. |

---

## Database Architecture & Entity-Relationship Model

```mermaid
erDiagram
    user ||--o| admin : "specializes as"
    user ||--o| customer : "specializes as"
    user ||--o{ session : "owns"
    user ||--o{ account : "auth via"
    
    admin ||--o{ category : "manages"
    admin ||--o{ supplierOrder : "places"
    
    supplier ||--o{ product : "supplies"
    supplier ||--o{ supplierOrder : "fulfills"
    
    category ||--o{ product : "categorizes"
    
    product ||--|| inventory : "monitored by (1:1)"
    
    customer ||--o{ cart : "stores"
    product ||--o{ cart : "added to"
    
    customer ||--o{ orders : "places"
    orders ||--|| payment : "paid with (1:1)"
    
    orders ||--|{ orderDetails : "contains (1:M)"
    product ||--o{ orderDetails : "referenced in"
    
    supplierOrder ||--|{ supplierOrderItem : "contains (1:M)"
    product ||--o{ supplierOrderItem : "ordered in"
```

---

## Relational Schema & Key Tables

Located in [`packages/db/src/schema.ts`](packages/db/src/schema.ts):

### 1. Core Users & RBAC
- **`user`**: Central identity managed by Better-Auth (`id`, `name`, `email`, `role`). Includes database-level check: `CHECK (role IN ('customer', 'admin'))`.
- **`customer`**: Extends user for shopping (`customer_id`, `user_id`, `phone`, `address`).
- **`admin`**: Extends user for store administrators (`admin_id`, `user_id`).

### 2. Catalog & Supply Chain
- **`category`**: Product taxonomies (`category_id`, `category_name`, `admin_id`).
- **`supplier`**: Merchant vendors (`supplier_id`, `supplier_name`, `contact_name`, `email`, `phone`, `address`).
- **`product`**: Product catalog (`product_id`, `product_name`, `description`, `price`, `expiry_date`, `is_active`, `category_id`, `supplier_id`).

### 3. Inventory & Stock Control
- **`inventory`**: 1-to-1 extension of product (`inventory_id`, `product_id`, `current_stock`, `reorder_level`, `last_updated`).
  - Constraint: `CHECK (current_stock >= 0)` ensures inventory can never drop below zero.

### 4. Transactions, Cart & Order Processing
- **`cart`**: Persistent customer cart (`cart_id`, `customer_id`, `product_id`, `quantity`, `added_date`).
  - Constraint: `UNIQUE (customer_id, product_id)` ensures idempotent quantity increments.
- **`orders`**: Order ledger (`order_id`, `customer_id`, `order_date`, `order_status`, `total_amount`, `shipping_address`).
- **`order_details`**: Normalized junction (`order_detail_id`, `order_id`, `productId`, `quantity`, `unit_price`).
  - `unit_price`: Immutable historical price snapshot at the moment of purchase.
- **`payment`**: 1-to-1 order payment audit (`payment_id`, `order_id`, `payment_method`, `payment_status`, `amount`).

### 5. Inbound Supplier Procurement
- **`supplier_order`**: Admin purchase orders (`supplier_order_id`, `supplier_id`, `status`, `total_cost`).
- **`supplier_order_item`**: Inbound line items (`supplier_order_item_id`, `supplier_order_id`, `product_id`, `quantity`, `unit_cost`).

---

## DBMS Concepts Demonstrated

### 1. Atomic Transaction with Stock Locking (Checkout)
Checkout cannot leave an order half-processed. If a user orders 3 units of an item with only 2 remaining, the entire operation is rolled back:
```typescript
// apps/api/src/modules/cart/checkout.routes.ts
await db.transaction(async (tx) => {
  // 1. Verify stock within transaction
  const [inv] = await tx.select().from(inventory).where(eq(inventory.productId, item.productId));
  if (inv.currentStock < item.quantity) {
    throw new Error(`Insufficient stock for ${item.productName}`);
  }

  // 2. Decrement inventory atomically
  await tx.update(inventory)
    .set({ currentStock: sql`${inventory.currentStock} - ${item.quantity}` })
    .where(eq(inventory.productId, item.productId));

  // 3. Insert order header and lines
  const [newOrder] = await tx.insert(orders).values(...).returning();
  await tx.insert(orderDetails).values(...);
  await tx.insert(payment).values(...);

  // 4. Clear the customer cart
  await tx.delete(cart).where(eq(cart.customerId, customerId));
});
```

### 2. Multi-Table Aggregations for Analytics
BI dashboard reporting runs dynamic analytical SQL aggregations rather than processing in application memory:
```typescript
// apps/api/src/modules/reports/reports.routes.ts
const categorySales = await db
  .select({
    categoryName: category.categoryName,
    totalRevenue: sql`coalesce(sum(${orderDetails.quantity} * ${orderDetails.unitPrice}), 0)`,
    unitsSold: sql`sum(${orderDetails.quantity})::int`,
  })
  .from(orderDetails)
  .innerJoin(product, eq(orderDetails.productId, product.productId))
  .leftJoin(category, eq(product.categoryId, category.categoryId))
  .groupBy(category.categoryName);
```

---

## Monorepo Architecture & Key Files

```
smart-mart/
├── apps/
│   ├── api/                               # Express REST API Backend
│   │   ├── src/
│   │   │   ├── app.ts                     # Express server & middleware router
│   │   │   ├── auth/auth.ts               # Better-Auth authentication config
│   │   │   ├── middleware/auth.ts         # Role-based guards (requireAdmin, requireCustomer)
│   │   │   └── modules/
│   │   │       ├── products/              # Product & stock management routes
│   │   │       ├── categories/            # Category catalog routes
│   │   │       ├── cart/                  # Cart CRUD & atomic checkout pipeline
│   │   │       ├── orders/                # Order status management
│   │   │       ├── reports/               # SQL aggregation reports & BI analytics
│   │   │       └── me/                    # User profile and address sync
│   └── web/                               # Next.js 16 Storefront & Admin Portal
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx               # Storefront homepage (Popular picks, hero, categories)
│       │   │   ├── (store)/products/      # Filterable product catalog with live stock
│       │   │   ├── (store)/cart/          # Shopping cart & coupon management
│       │   │   ├── (store)/checkout/      # Multi-step checkout & payment
│       │   │   ├── (store)/account/       # Customer profile & address management
│       │   │   └── admin/                 # Admin operations
│       │   │       ├── page.tsx           # Main executive overview
│       │   │       ├── reports/page.tsx   # Live BI analytics (Sales trend, category donuts)
│       │   │       ├── inventory/         # Stock level adjustments
│       │   │       ├── products/          # CRUD product catalog
│       │   │       └── orders/            # Order fulfillment tracking
│       │   ├── components/                # Reusable UI components
│       │   └── context/CartContext.tsx    # Session-persistent cart synchronization
└── packages/
    └── db/                                # Shared Database Package
        ├── src/
        │   ├── schema.ts                  # Drizzle ORM schema, relations & check constraints
        │   └── client.ts                  # PostgreSQL connection pool
        └── scripts/
            └── seed.ts                    # Realistic database seed dataset
```

---

## API & Data Flow

```
[Customer Browser / Admin Dashboard]
               │
               ▼  HTTP JSON / Cookies
[Next.js Web App (:3000)]
               │
               ▼  API Proxy / Rewrites
[Express REST API (:5001)]
       │               │
       │ (Session)     │ (Queries & Mutations via Drizzle ORM)
       ▼               ▼
[Better-Auth]   [PostgreSQL Database]
                 ├── ACID Transactions
                 ├── Relational Constraints
                 └── Indexed Lookups
```

---

## Setup & Running Locally

### Prerequisites
- Node.js $\ge$ 18.x
- PostgreSQL instance (or Neon / Supabase cloud connection)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env` in the project root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/smartmart
BETTER_AUTH_SECRET=your_random_32_char_secret_key
BETTER_AUTH_URL=http://localhost:5001
API_URL=http://localhost:5001
PORT=5001
WEB_ORIGIN=http://localhost:3000
```

### 3. Push Database Schema & Seed Data
```bash
# Push table definitions and constraints to PostgreSQL
npm run db:push

# (Optional) Seed catalog, categories, products, inventory & suppliers
npx tsx packages/db/scripts/seed.ts
```

### 4. Create an Admin Account
```bash
npm run admin:create
```

### 5. Start Development Servers
```bash
# Starts both Express API (:5001) and Next.js Web (:3000)
npm run dev
```

Inspect your database live anytime with Drizzle Studio:
```bash
npm run db:studio
```

---

## Technologies Used
- **Database Engine:** PostgreSQL
- **Object-Relational Mapping (ORM):** Drizzle ORM
- **Backend Service:** Express.js, Node.js, TypeScript
- **Authentication:** Better-Auth (Session cookies & RBAC)
- **Frontend Framework:** Next.js (App Router), React, Tailwind CSS
- **Visualisation & Charts:** SVG Analytical Curves & Dynamic SVG Arcs