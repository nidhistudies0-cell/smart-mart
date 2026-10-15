import { Router } from "express";
import { db, product, inventory, category, supplier, eq, asc, desc, ilike, and, sql } from "@smartmart/db";
import { requireAdmin } from "../../middleware/auth.js";
import { badRequest, notFound } from "../../utils/httpError.js";

const router = Router();

// GET /api/products?search=&categoryId=&supplierId=&isActive= — Public store catalog
router.get("/", async (req, res, next) => {
  try {
    const { search, categoryId, supplierId, isActive } = req.query as Record<string, string>;
    const conditions: any[] = [];
    if (search) conditions.push(ilike(product.productName, `%${search}%`));
    if (categoryId) conditions.push(eq(product.categoryId, Number(categoryId)));
    if (supplierId) conditions.push(eq(product.supplierId, Number(supplierId)));
    if (isActive !== undefined) conditions.push(eq(product.isActive, isActive !== "false"));

    const rows = await db
      .select({
        productId: product.productId,
        productName: product.productName,
        description: product.description,
        price: product.price,
        expiryDate: product.expiryDate,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        createdAt: product.createdAt,
        categoryName: category.categoryName,
        supplierName: supplier.supplierName,
        inventoryId: inventory.inventoryId,
        currentStock: inventory.currentStock,
        reorderLevel: inventory.reorderLevel,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.categoryId))
      .leftJoin(supplier, eq(product.supplierId, supplier.supplierId))
      .leftJoin(inventory, eq(product.productId, inventory.productId))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(product.productName));
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/products  — also creates inventory row (Admin only)
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { productName, description, price, expiryDate, imageUrl, categoryId, supplierId, isActive, initialStock, reorderLevel } = req.body as Record<string, any>;
    if (!productName?.trim()) return next(badRequest("productName is required"));
    if (!price) return next(badRequest("price is required"));
    if (!categoryId) return next(badRequest("categoryId is required"));
    if (!supplierId) return next(badRequest("supplierId is required"));

    const result = await db.transaction(async (tx) => {
      const [newProduct] = await tx.insert(product).values({
        productName: productName.trim(),
        description: description?.trim() || null,
        price: String(price),
        expiryDate: expiryDate || null,
        imageUrl: imageUrl?.trim() || null,
        categoryId: Number(categoryId),
        supplierId: Number(supplierId),
        isActive: isActive !== false,
        adminId: req.auth!.adminId!,
      }).returning();

      const [newInv] = await tx.insert(inventory).values({
        productId: newProduct.productId,
        currentStock: Number(initialStock ?? 0),
        reorderLevel: Number(reorderLevel ?? 10),
      }).returning();

      return { ...newProduct, currentStock: newInv.currentStock, reorderLevel: newInv.reorderLevel };
    });

    res.status(201).json(result);
  } catch (err) { next(err); }
});

// GET /api/products/:id — Public
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db
      .select({
        productId: product.productId,
        productName: product.productName,
        description: product.description,
        price: product.price,
        expiryDate: product.expiryDate,
        imageUrl: product.imageUrl,
        isActive: product.isActive,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        createdAt: product.createdAt,
        categoryName: category.categoryName,
        supplierName: supplier.supplierName,
        currentStock: inventory.currentStock,
        reorderLevel: inventory.reorderLevel,
      })
      .from(product)
      .leftJoin(category, eq(product.categoryId, category.categoryId))
      .leftJoin(supplier, eq(product.supplierId, supplier.supplierId))
      .leftJoin(inventory, eq(product.productId, inventory.productId))
      .where(eq(product.productId, id));
    if (!row) return next(notFound("Product not found"));
    res.json(row);
  } catch (err) { next(err); }
});

// PATCH /api/products/:id (Admin only)
router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { productName, description, price, expiryDate, imageUrl, categoryId, supplierId, isActive, currentStock, reorderLevel } = req.body as Record<string, any>;
    const updates: Record<string, any> = {};
    if (productName?.trim()) updates.productName = productName.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (price !== undefined) updates.price = String(price);
    if (expiryDate !== undefined) updates.expiryDate = expiryDate || null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl?.trim() || null;
    if (categoryId !== undefined) updates.categoryId = Number(categoryId);
    if (supplierId !== undefined) updates.supplierId = Number(supplierId);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const result = await db.transaction(async (tx) => {
      let row = undefined;
      if (Object.keys(updates).length > 0) {
        const [updatedProduct] = await tx.update(product).set(updates).where(eq(product.productId, id)).returning();
        row = updatedProduct;
      } else {
        const [existingProduct] = await tx.select().from(product).where(eq(product.productId, id)).limit(1);
        row = existingProduct;
      }
      if (!row) throw notFound("Product not found");

      if (currentStock !== undefined || reorderLevel !== undefined) {
        const invUpdates: Record<string, any> = { lastUpdated: new Date() };
        if (currentStock !== undefined) invUpdates.currentStock = Number(currentStock);
        if (reorderLevel !== undefined) invUpdates.reorderLevel = Number(reorderLevel);

        const [existingInv] = await tx.select().from(inventory).where(eq(inventory.productId, id)).limit(1);
        if (existingInv) {
          await tx.update(inventory).set(invUpdates).where(eq(inventory.productId, id));
        } else {
          await tx.insert(inventory).values({
            productId: id,
            currentStock: Number(currentStock ?? 0),
            reorderLevel: Number(reorderLevel ?? 10),
          });
        }
      }

      return row;
    });

    res.json(result);
  } catch (err) { next(err); }
});

// DELETE /api/products/:id (Admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.delete(product).where(eq(product.productId, id)).returning();
    if (!row) return next(notFound("Product not found"));
    res.status(204).send();
  } catch (err) { next(err); }
});

export default router;
