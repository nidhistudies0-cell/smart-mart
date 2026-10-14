import type { Request, RequestHandler } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { db, eq, customer, admin } from "@smartmart/db";
import { auth } from "../auth/auth";
import { unauthorized, forbidden } from "../utils/httpError";

export type Role = "customer" | "admin";
export interface AuthContext {
  userId: string;
  role: Role;
  name: string;
  email: string;
  customerId?: number; 
  adminId?: number;    
}

export async function resolveAuth(req: Request): Promise<AuthContext | null> {
  const s = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!s) return null;

  const role: Role = s.user.role === "admin" ? "admin" : "customer";
  const base = { userId: s.user.id, role, name: s.user.name, email: s.user.email };

  let adminId: number | undefined;
  let customerId: number | undefined;

  if (role === "admin") {
    let [a] = await db.select({ id: admin.adminId }).from(admin).where(eq(admin.userId, s.user.id)).limit(1);
    if (!a) {
      const [newA] = await db.insert(admin).values({ userId: s.user.id }).returning({ id: admin.adminId });
      a = newA;
    }
    adminId = a?.id;
  }

  let [c] = await db.select({ id: customer.customerId }).from(customer).where(eq(customer.userId, s.user.id)).limit(1);
  if (!c) {
    const [newC] = await db.insert(customer).values({ userId: s.user.id }).returning({ id: customer.customerId });
    c = newC;
  }
  customerId = c?.id;

  return { ...base, adminId, customerId };
}

const guard = (role?: Role): RequestHandler => async (req, _res, next) => {
  const ctx = await resolveAuth(req);
  if (!ctx) throw unauthorized("Please sign in");
  if (role === "admin" && ctx.role !== "admin") throw forbidden("You do not have access to this resource");
  // If role is customer, allow both customer and admin
  if (ctx.role === "admin" && !ctx.adminId) throw forbidden("Admin profile missing");
  req.auth = ctx;
  next();
};

export const requireAuth = guard();
export const requireCustomer = guard("customer");
export const requireAdmin = guard("admin");

