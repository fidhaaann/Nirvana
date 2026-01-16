import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { api } from "@shared/routes";
import { processVoiceInput } from "./openai";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerAudioRoutes(app);

  // === API ROUTES ===

  // VOICE PROCESSING
  app.post(api.voice.process.path, async (req, res) => {
    try {
      const { text, sessionId } = api.voice.process.input.parse(req.body);
      const response = await processVoiceInput(text, sessionId);
      res.json(response);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // PRODUCTS
  app.get(api.products.list.path, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err.errors);
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.patch(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err.errors);
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // ORDERS
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err.errors);
      res.status(500).json({ message: "Error creating order" });
    }
  });

  app.patch(api.orders.update.path, async (req, res) => {
    try {
      const input = api.orders.update.input.parse(req.body);
      const order = await storage.updateOrder(Number(req.params.id), input);
      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err.errors);
      res.status(500).json({ message: "Error updating order" });
    }
  });

  // APPOINTMENTS
  app.get(api.appointments.list.path, async (req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err.errors);
      res.status(500).json({ message: "Error creating appointment" });
    }
  });

  app.patch(api.appointments.update.path, async (req, res) => {
    try {
      const input = api.appointments.update.input.parse(req.body);
      const appointment = await storage.updateAppointment(Number(req.params.id), input);
      res.json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json(err.errors);
      res.status(500).json({ message: "Error updating appointment" });
    }
  });

  // STATS
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    console.log("Seeding database...");
    await storage.createProduct({
      name: "Premium Widget",
      description: "High quality widget for all your needs",
      price: 29.99,
      stock: 50,
      category: "Widgets",
      active: true
    });
    await storage.createProduct({
      name: "Super Gadget",
      description: "The latest gadget in tech",
      price: 199.99,
      stock: 15,
      category: "Gadgets",
      active: true
    });
    await storage.createProduct({
      name: "Consultation Hour",
      description: "One hour consultation with expert",
      price: 150.00,
      stock: 100,
      category: "Services",
      active: true
    });
    console.log("Database seeded!");
  }
}
