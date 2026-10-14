/**
 * Development-Only UI Preview Interceptor
 * 
 * Provides mock sample data for visual inspection in development without
 * connecting to a live database or requiring active administrator credentials.
 * 
 * STRICT SECURITY:
 * - Disabled completely in production builds (`process.env.NODE_ENV === "production"`).
 * - Never grants real API access or generates real credentials.
 */

const STORAGE_KEY = "SMARTMART_DEV_PREVIEW";

export function isDevPreviewActive(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  if (typeof window === "undefined") {
    return false;
  }

  // Check URL param first
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("preview") === "true") {
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignored
    }
    return true;
  }

  if (searchParams.get("preview") === "false") {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignored
    }
    return false;
  }

  // Check session storage
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setDevPreview(active: boolean): void {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") return;
  try {
    if (active) {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Ignored
  }
}

// ==========================================
// SAMPLE DATA DEFINITIONS (PREVIEW ONLY)
// ==========================================

const SAMPLE_CATEGORIES = [
  { categoryId: 1, categoryName: "Fresh Produce" },
  { categoryId: 2, categoryName: "Dairy & Cold Storage" },
  { categoryId: 3, categoryName: "Beverages & Drinks" },
  { categoryId: 4, categoryName: "Snacks & Bakery" },
];

const SAMPLE_SUPPLIERS = [
  { supplierId: 1, supplierName: "GreenFarm Agro Organics" },
  { supplierId: 2, supplierName: "DailyFresh Supplies Ltd." },
  { supplierId: 3, supplierName: "Prime Foods Logistics" },
];

let sampleProducts = [
  {
    productId: 101,
    productName: "Organic Alphonso Mangoes (1kg)",
    description: "Farm-fresh premium Alphonso mangoes with rich aroma.",
    price: "450.00",
    expiryDate: "2026-11-01",
    imageUrl: null,
    isActive: true,
    categoryId: 1,
    supplierId: 1,
    createdAt: "2026-08-10T10:00:00.000Z",
    categoryName: "Fresh Produce",
    supplierName: "GreenFarm Agro Organics",
    currentStock: 48,
    reorderLevel: 15,
  },
  {
    productId: 102,
    productName: "Full Cream A2 Farm Milk (1L)",
    description: "Pure pasture-raised cow milk, pasteurized and unhomogenized.",
    price: "85.00",
    expiryDate: "2026-10-20",
    imageUrl: null,
    isActive: true,
    categoryId: 2,
    supplierId: 2,
    createdAt: "2026-08-12T11:00:00.000Z",
    categoryName: "Dairy & Cold Storage",
    supplierName: "DailyFresh Supplies Ltd.",
    currentStock: 8,
    reorderLevel: 20, // Low stock
  },
  {
    productId: 103,
    productName: "Artisanal Sourdough Bread (400g)",
    description: "Naturally fermented whole grain slow-baked bread.",
    price: "140.00",
    expiryDate: "2026-10-18",
    imageUrl: null,
    isActive: true,
    categoryId: 4,
    supplierId: 3,
    createdAt: "2026-08-15T09:30:00.000Z",
    categoryName: "Snacks & Bakery",
    supplierName: "Prime Foods Logistics",
    currentStock: 14,
    reorderLevel: 10,
  },
  {
    productId: 104,
    productName: "Cold Pressed Coconut Water (500ml)",
    description: "Electrolyte-rich pure tender coconut water.",
    price: "65.00",
    expiryDate: "2026-12-15",
    imageUrl: null,
    isActive: true,
    categoryId: 3,
    supplierId: 1,
    createdAt: "2026-08-18T14:15:00.000Z",
    categoryName: "Beverages & Drinks",
    supplierName: "GreenFarm Agro Organics",
    currentStock: 5,
    reorderLevel: 15, // Low stock
  },
  {
    productId: 105,
    productName: "Roasted Spiced Almonds (250g)",
    description: "Crunchy California almonds lightly roasted with Himalayan salt.",
    price: "320.00",
    expiryDate: "2027-02-10",
    imageUrl: null,
    isActive: false, // Inactive
    categoryId: 4,
    supplierId: 3,
    createdAt: "2026-08-20T16:00:00.000Z",
    categoryName: "Snacks & Bakery",
    supplierName: "Prime Foods Logistics",
    currentStock: 35,
    reorderLevel: 10,
  },
];

let sampleOrders = [
  {
    orderId: 5001,
    orderDate: "2026-10-12T14:30:00.000Z",
    orderStatus: "Delivered",
    totalAmount: "1280.00",
    shippingAddress: "Flat 402, Lotus Residency, MG Road, Bengaluru 560001",
    customerId: 201,
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    items: [
      { orderDetailId: 1, productId: 101, quantity: 2, unitPrice: "450.00", productName: "Organic Alphonso Mangoes (1kg)" },
      { orderDetailId: 2, productId: 102, quantity: 2, unitPrice: "85.00", productName: "Full Cream A2 Farm Milk (1L)" },
      { orderDetailId: 3, productId: 103, quantity: 1, unitPrice: "140.00", productName: "Artisanal Sourdough Bread (400g)" },
    ],
    payment: {
      paymentId: 9001,
      orderId: 5001,
      paymentMethod: "UPI",
      paymentStatus: "Completed",
      paymentDate: "2026-10-12T14:32:00.000Z",
      amount: "1280.00",
    },
  },
  {
    orderId: 5002,
    orderDate: "2026-10-13T09:15:00.000Z",
    orderStatus: "Shipped",
    totalAmount: "855.00",
    shippingAddress: "Villa 12, Palm Meadows, Whitefield, Bengaluru 560066",
    customerId: 202,
    customerName: "Priya Patel",
    customerEmail: "priya.patel@example.com",
    items: [
      { orderDetailId: 4, productId: 101, quantity: 1, unitPrice: "450.00", productName: "Organic Alphonso Mangoes (1kg)" },
      { orderDetailId: 5, productId: 104, quantity: 3, unitPrice: "65.00", productName: "Cold Pressed Coconut Water (500ml)" },
      { orderDetailId: 6, productId: 103, quantity: 1, unitPrice: "140.00", productName: "Artisanal Sourdough Bread (400g)" },
    ],
    payment: {
      paymentId: 9002,
      orderId: 5002,
      paymentMethod: "Card",
      paymentStatus: "Completed",
      paymentDate: "2026-10-13T09:16:00.000Z",
      amount: "855.00",
    },
  },
  {
    orderId: 5003,
    orderDate: "2026-10-13T16:45:00.000Z",
    orderStatus: "Confirmed",
    totalAmount: "640.00",
    shippingAddress: "Apartment 3B, Sunshine Heights, Indiranagar, Bengaluru 560038",
    customerId: 203,
    customerName: "Rohan Verma",
    customerEmail: "rohan.v@example.com",
    items: [
      { orderDetailId: 7, productId: 105, quantity: 2, unitPrice: "320.00", productName: "Roasted Spiced Almonds (250g)" },
    ],
    payment: {
      paymentId: 9003,
      orderId: 5003,
      paymentMethod: "NetBanking",
      paymentStatus: "Completed",
      paymentDate: "2026-10-13T16:46:00.000Z",
      amount: "640.00",
    },
  },
  {
    orderId: 5004,
    orderDate: "2026-10-14T08:00:00.000Z",
    orderStatus: "Pending",
    totalAmount: "310.00",
    shippingAddress: "House 18, 5th Cross, Koramangala, Bengaluru 560034",
    customerId: 201,
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    items: [
      { orderDetailId: 8, productId: 102, quantity: 2, unitPrice: "85.00", productName: "Full Cream A2 Farm Milk (1L)" },
      { orderDetailId: 9, productId: 103, quantity: 1, unitPrice: "140.00", productName: "Artisanal Sourdough Bread (400g)" },
    ],
    payment: {
      paymentId: 9004,
      orderId: 5004,
      paymentMethod: "Cash",
      paymentStatus: "Pending",
      paymentDate: "2026-10-14T08:01:00.000Z",
      amount: "310.00",
    },
  },
];

const SAMPLE_CUSTOMERS = [
  {
    customerId: 201,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    address: "Flat 402, Lotus Residency, MG Road, Bengaluru 560001",
    createdAt: "2026-03-15T11:20:00.000Z",
  },
  {
    customerId: 202,
    name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "+91 98450 12345",
    address: "Villa 12, Palm Meadows, Whitefield, Bengaluru 560066",
    createdAt: "2026-05-22T14:10:00.000Z",
  },
  {
    customerId: 203,
    name: "Rohan Verma",
    email: "rohan.v@example.com",
    phone: "+91 99001 98765",
    address: "Apartment 3B, Sunshine Heights, Indiranagar, Bengaluru 560038",
    createdAt: "2026-07-08T09:45:00.000Z",
  },
  {
    customerId: 204,
    name: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 91234 56789",
    address: "102 Royal Palm Grove, HSR Layout, Bengaluru 560102",
    createdAt: "2026-08-30T16:20:00.000Z",
  },
];

export async function getDevPreviewResponse(
  endpoint: string,
  options: RequestInit = {}
): Promise<any | undefined> {
  const method = (options.method || "GET").toUpperCase();
  const urlObj = new URL(`http://dummy${endpoint}`);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // 1. Admin Me Auth verification
  if (pathname === "/api/admin/me" || pathname === "/api/auth/admin/me") {
    return {
      adminId: 1,
      name: "SmartMart Preview Admin",
      email: "preview-admin@smartmart.dev",
      createdAt: "2026-01-01T00:00:00.000Z",
    };
  }

  // 2. Categories
  if (pathname === "/api/categories") {
    return SAMPLE_CATEGORIES;
  }

  // 3. Suppliers
  if (pathname === "/api/suppliers") {
    return SAMPLE_SUPPLIERS;
  }

  // 4. Products List
  if (pathname === "/api/products" && method === "GET") {
    let prods = [...sampleProducts];
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const isActive = searchParams.get("isActive");

    if (search) {
      const q = search.toLowerCase();
      prods = prods.filter((p) => p.productName.toLowerCase().includes(q));
    }
    if (categoryId) {
      prods = prods.filter((p) => String(p.categoryId) === categoryId);
    }
    if (isActive !== null && isActive !== undefined) {
      prods = prods.filter((p) => String(p.isActive) === isActive);
    }
    return prods;
  }

  // 4b. Create Product
  if (pathname === "/api/products" && method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newId = 100 + sampleProducts.length + 1;
    const cat = SAMPLE_CATEGORIES.find((c) => String(c.categoryId) === String(body.categoryId));
    const sup = SAMPLE_SUPPLIERS.find((s) => String(s.supplierId) === String(body.supplierId));

    const newProd = {
      productId: newId,
      productName: body.productName || "New Product",
      description: body.description || "",
      price: String(body.price || "100.00"),
      expiryDate: body.expiryDate || null,
      imageUrl: null,
      isActive: body.isActive !== false,
      categoryId: Number(body.categoryId || 1),
      supplierId: Number(body.supplierId || 1),
      createdAt: new Date().toISOString(),
      categoryName: cat?.categoryName || "Fresh Produce",
      supplierName: sup?.supplierName || "GreenFarm Agro Organics",
      currentStock: Number(body.initialStock || 10),
      reorderLevel: Number(body.reorderLevel || 10),
    };
    sampleProducts.unshift(newProd);
    return newProd;
  }

  // 4c. Update / Delete Product
  if (pathname.startsWith("/api/products/")) {
    const id = Number(pathname.split("/").pop());
    if (method === "DELETE") {
      sampleProducts = sampleProducts.filter((p) => p.productId !== id);
      return {};
    }
    if (method === "PATCH") {
      const body = options.body ? JSON.parse(options.body as string) : {};
      const prod = sampleProducts.find((p) => p.productId === id);
      if (prod) {
        Object.assign(prod, body);
      }
      return prod || {};
    }
  }

  // 5. Orders List
  if (pathname === "/api/orders" && method === "GET") {
    let rows = sampleOrders.map((o) => ({
      orderId: o.orderId,
      orderDate: o.orderDate,
      orderStatus: o.orderStatus as any,
      totalAmount: o.totalAmount,
      shippingAddress: o.shippingAddress,
      customerId: o.customerId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
    }));

    const status = searchParams.get("status");
    const customerId = searchParams.get("customerId");

    if (status && status !== "ALL") {
      rows = rows.filter((r) => r.orderStatus === status);
    }
    if (customerId) {
      rows = rows.filter((r) => String(r.customerId) === customerId);
    }
    return rows;
  }

  // 5b-extra: POST /api/checkout — customer places an order (dev-preview)
  if (pathname === "/api/checkout" && method === "POST") {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const newOrderId = 5000 + sampleOrders.length + 1;
    const total = (body.items || []).reduce(
      (acc: number, it: any) => acc + (Number(it.unitPrice) * Number(it.quantity)),
      0
    );
    const newOrder = {
      orderId: newOrderId,
      orderDate: new Date().toISOString(),
      orderStatus: "Pending" as const,
      totalAmount: total.toFixed(2),
      shippingAddress: body.shippingAddress || "",
      customerId: 201,
      customerName: "Preview Customer",
      customerEmail: "preview@smartmart.dev",
      items: (body.items || []).map((it: any, idx: number) => ({
        orderDetailId: 100 + idx,
        productId: it.productId,
        quantity: it.quantity,
        unitPrice: String(it.unitPrice),
        productName: sampleProducts.find((p) => p.productId === it.productId)?.productName || "Product",
      })),
      payment: {
        paymentId: 9000 + newOrderId,
        orderId: newOrderId,
        paymentMethod: body.paymentMethod || "UPI",
        paymentStatus: body.paymentMethod === "cod" ? "Pending" : "Completed",
        paymentDate: new Date().toISOString(),
        amount: total.toFixed(2),
      },
    };
    sampleOrders.unshift(newOrder as any);
    return { orderId: newOrderId, orderStatus: "Pending", totalAmount: total.toFixed(2), message: "Order placed successfully" };
  }

  // 5b. Order Details
  if (pathname.startsWith("/api/orders/") && !pathname.endsWith("/status") && method === "GET") {
    const id = Number(pathname.split("/").pop());
    const found = sampleOrders.find((o) => o.orderId === id);
    if (found) return found;
    return sampleOrders[0];
  }

  // 5c. Update Order Status
  if (pathname.includes("/api/orders/") && pathname.endsWith("/status") && method === "PATCH") {
    const parts = pathname.split("/");
    const id = Number(parts[parts.length - 2]);
    const body = options.body ? JSON.parse(options.body as string) : {};
    const found = sampleOrders.find((o) => o.orderId === id);
    if (found && body.orderStatus) {
      found.orderStatus = body.orderStatus;
    }
    return found || {};
  }

  // 6. Inventory List
  if (pathname === "/api/inventory" && method === "GET") {
    let invs = sampleProducts.map((p, idx) => ({
      inventoryId: 300 + idx,
      productId: p.productId,
      currentStock: p.currentStock,
      reorderLevel: p.reorderLevel,
      lastUpdated: p.createdAt,
      productName: p.productName,
      categoryName: p.categoryName,
      supplierName: p.supplierName,
      isActive: p.isActive,
    }));

    if (searchParams.get("lowStock") === "true") {
      invs = invs.filter((i) => i.currentStock <= i.reorderLevel);
    }
    return invs;
  }

  // 6b. Update Inventory Stock
  if (pathname.startsWith("/api/inventory/") && method === "PATCH") {
    const id = Number(pathname.split("/").pop());
    const body = options.body ? JSON.parse(options.body as string) : {};
    const prod = sampleProducts.find((p) => p.productId === id);
    if (prod) {
      if (body.currentStock !== undefined) prod.currentStock = Number(body.currentStock);
      if (body.reorderLevel !== undefined) prod.reorderLevel = Number(body.reorderLevel);
    }
    return prod || {};
  }

  // 7. Customers List
  if (pathname === "/api/customers") {
    let custs = [...SAMPLE_CUSTOMERS];
    const search = searchParams.get("search");
    if (search) {
      const q = search.toLowerCase();
      custs = custs.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    }
    return custs;
  }

  // 8. Reports: Dashboard
  if (pathname === "/api/reports/dashboard") {
    const deliveredRevenue = sampleOrders
      .filter((o) => o.orderStatus === "Delivered")
      .reduce((acc, o) => acc + Number(o.totalAmount), 0);

    // Build ordersByStatus dynamically
    const statusCounts: Record<string, number> = {};
    sampleOrders.forEach((o) => {
      statusCounts[o.orderStatus] = (statusCounts[o.orderStatus] || 0) + 1;
    });

    return {
      totalOrders: sampleOrders.length,
      totalRevenue: deliveredRevenue.toFixed(2),
      totalCustomers: SAMPLE_CUSTOMERS.length,
      totalProducts: sampleProducts.filter((p) => p.isActive).length,
      lowStockItems: sampleProducts.filter((p) => p.currentStock <= p.reorderLevel).map((p) => ({
        productId: p.productId,
        productName: p.productName,
        currentStock: p.currentStock,
        reorderLevel: p.reorderLevel,
      })),
      recentOrders: [...sampleOrders].slice(0, 5).map((o) => ({
        orderId: o.orderId,
        orderDate: o.orderDate,
        orderStatus: o.orderStatus,
        totalAmount: o.totalAmount,
        customerName: o.customerName,
      })),
      ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    };
  }

  // 9. Reports: Sales
  if (pathname === "/api/reports/sales") {
    return [
      {
        productId: 101,
        productName: "Organic Alphonso Mangoes (1kg)",
        totalQty: 3,
        totalRevenue: "1350.00",
      },
      {
        productId: 105,
        productName: "Roasted Spiced Almonds (250g)",
        totalQty: 2,
        totalRevenue: "640.00",
      },
      {
        productId: 102,
        productName: "Full Cream A2 Farm Milk (1L)",
        totalQty: 4,
        totalRevenue: "340.00",
      },
      {
        productId: 103,
        productName: "Artisanal Sourdough Bread (400g)",
        totalQty: 2,
        totalRevenue: "280.00",
      },
      {
        productId: 104,
        productName: "Cold Pressed Coconut Water (500ml)",
        totalQty: 3,
        totalRevenue: "195.00",
      },
    ];
  }

  return undefined;
}
