import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
// Export everything from auth and chat models
export * from "./models/auth";
export * from "./models/chat";

// === TABLE DEFINITIONS ===

// Products table
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  status: text("status", { enum: ["pending", "completed", "cancelled"] }).default("pending").notNull(),
  totalAmount: real("total_amount").notNull(),
  items: jsonb("items").$type<{ productId: number; quantity: number; price: number }[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  date: timestamp("date").notNull(), // Specific date and time of appointment
  status: text("status", { enum: ["confirmed", "cancelled", "completed"] }).default("confirmed").notNull(),
  contactInfo: text("contact_info").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Settings table for business config
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(), // e.g., 'business_hours', 'contact_email'
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// === BASE SCHEMAS ===

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true, updatedAt: true });


// === EXPLICIT API CONTRACT TYPES ===

// Products
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Orders
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Appointments
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Settings
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;


// Voice Processing Request/Response
export const processVoiceSchema = z.object({
  text: z.string(),
  sessionId: z.string(),
});
export type ProcessVoiceRequest = z.infer<typeof processVoiceSchema>;

export type ProcessVoiceResponse = {
  textResponse: string;
  action?: {
    type: "ask_time" | "confirm_appointment" | "confirm_order" | "check_stock" | "none";
    data?: any;
  };
};

export type StatsResponse = {
  todayAppointments: number;
  todayOrders: number;
  totalRevenue: number;
  lowStockCount: number;
};
