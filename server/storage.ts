import { db } from "./db";
import {
  products,
  orders,
  appointments,
  settings,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type Appointment,
  type InsertAppointment,
  type Setting,
  type InsertSetting,
  type StatsResponse
} from "@shared/schema";
import { eq, desc, sql, gte, lt, and } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth";
import { chatStorage } from "./replit_integrations/chat";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByName(name: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment>;
  checkAvailability(date: Date): Promise<boolean>; // Simple check

  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  setSetting(key: string, value: any): Promise<Setting>;

  // Stats
  getStats(): Promise<StatsResponse>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductByName(name: string): Promise<Product | undefined> {
    // Case-insensitive search could be better, but keeping it simple
    const [product] = await db.select().from(products).where(sql`lower(${products.name}) = lower(${name})`);
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: number, updates: Partial<InsertOrder>): Promise<Order> {
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.date));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return updated;
  }
  
  async checkAvailability(date: Date): Promise<boolean> {
    // Simple logic: check if there is an appointment within 30 mins of the requested time
    // In a real app, this would be more complex
    const thirtyMinutesBefore = new Date(date.getTime() - 30 * 60000);
    const thirtyMinutesAfter = new Date(date.getTime() + 30 * 60000);

    const conflicting = await db.select().from(appointments).where(
      and(
        eq(appointments.status, 'confirmed'),
        gte(appointments.date, thirtyMinutesBefore),
        lt(appointments.date, thirtyMinutesAfter)
      )
    );

    return conflicting.length === 0;
  }

  // Settings
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async setSetting(key: string, value: any): Promise<Setting> {
    const [setting] = await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } })
      .returning();
    return setting;
  }

  // Stats
  async getStats(): Promise<StatsResponse> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayAppointments = await db.select({ count: sql<number>`count(*)` })
      .from(appointments)
      .where(gte(appointments.date, startOfDay));

    const todayOrders = await db.select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(gte(orders.createdAt, startOfDay));
      
    const totalRevenue = await db.select({ total: sql<number>`sum(${orders.totalAmount})` })
      .from(orders)
      .where(eq(orders.status, 'completed'));

    const lowStock = await db.select({ count: sql<number>`count(*)` })
      .from(products)
      .where(lt(products.stock, 10));

    return {
      todayAppointments: Number(todayAppointments[0]?.count || 0),
      todayOrders: Number(todayOrders[0]?.count || 0),
      totalRevenue: Number(totalRevenue[0]?.total || 0),
      lowStockCount: Number(lowStock[0]?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
export { authStorage, chatStorage };
