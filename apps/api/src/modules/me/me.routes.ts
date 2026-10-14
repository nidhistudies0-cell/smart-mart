import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { db, user, customer, eq } from "@smartmart/db";

export const meRoutes = Router();

// GET /api/me — returns current authenticated user and customer profile
meRoutes.get("/", requireAuth, async (req, res, next) => {
  try {
    const [u] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, req.auth!.userId))
      .limit(1);

    const [c] = await db
      .select({
        customerId: customer.customerId,
        phone: customer.phone,
        address: customer.address,
      })
      .from(customer)
      .where(eq(customer.userId, req.auth!.userId))
      .limit(1);

    res.json({
      ok: true,
      user: {
        id: u?.id || req.auth!.userId,
        name: u?.name || req.auth!.name,
        email: u?.email || req.auth!.email,
        image: u?.image || null,
        role: u?.role || req.auth!.role,
        phone: c?.phone || "",
        address: c?.address || "",
        customerId: c?.customerId || req.auth!.customerId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/me — update personal details (name, phone, address, image)
meRoutes.patch("/", requireAuth, async (req, res, next) => {
  try {
    const { name, phone, address, image } = req.body;

    await db.transaction(async (tx) => {
      const userUpdates: Record<string, any> = {};
      if (typeof name === "string") userUpdates.name = name;
      if (typeof image === "string") userUpdates.image = image;

      if (Object.keys(userUpdates).length > 0) {
        await tx.update(user).set(userUpdates).where(eq(user.id, req.auth!.userId));
      }

      if (typeof phone === "string" || typeof address === "string") {
        const customerUpdates: Record<string, any> = {};
        if (typeof phone === "string") customerUpdates.phone = phone;
        if (typeof address === "string") customerUpdates.address = address;

        let [existing] = await tx
          .select({ id: customer.customerId })
          .from(customer)
          .where(eq(customer.userId, req.auth!.userId))
          .limit(1);

        if (existing) {
          await tx
            .update(customer)
            .set(customerUpdates)
            .where(eq(customer.customerId, existing.id));
        } else {
          await tx.insert(customer).values({
            userId: req.auth!.userId,
            ...customerUpdates,
          });
        }
      }
    });

    res.json({ ok: true, message: "Profile updated successfully" });
  } catch (err) {
    next(err);
  }
});

