import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type Product, type InsertProduct,
  type Order, type InsertOrder,
  type Appointment, type InsertAppointment,
  type StatsResponse
} from "@shared/schema";

// --- Stats ---
export function useStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

// --- Products ---
export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch products");
      return api.products.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertProduct) => {
      const res = await fetch(api.products.create.path, {
        method: api.products.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create product");
      return api.products.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertProduct>) => {
      const url = buildUrl(api.products.update.path, { id });
      const res = await fetch(url, {
        method: api.products.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update product");
      return api.products.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.products.delete.path, { id });
      const res = await fetch(url, {
        method: api.products.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete product");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.products.list.path] }),
  });
}

// --- Orders ---
export function useOrders() {
  return useQuery({
    queryKey: [api.orders.list.path],
    queryFn: async () => {
      const res = await fetch(api.orders.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch orders");
      return api.orders.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertOrder>) => {
      const url = buildUrl(api.orders.update.path, { id });
      const res = await fetch(url, {
        method: api.orders.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update order");
      return api.orders.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}

// --- Appointments ---
export function useAppointments() {
  return useQuery({
    queryKey: [api.appointments.list.path],
    queryFn: async () => {
      const res = await fetch(api.appointments.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch appointments");
      // Need to handle Date parsing from JSON string
      const raw = await res.json();
      const schema = api.appointments.list.responses[200];
      // Zod coerce date might handle this, or we rely on the schema definition
      // The schema defines date as Date object, but JSON transport is string.
      // We rely on Zod coerce in the schema if defined, or map manually if issues arise.
      // For now, assuming schema uses z.coerce.date() or similar if needed, 
      // but standard drizzle-zod uses z.date() which expects Date object.
      // We might need to map strings to dates manually here for robust frontend usage.
      return raw.map((apt: any) => ({
        ...apt,
        date: new Date(apt.date),
        createdAt: new Date(apt.createdAt),
      })) as Appointment[];
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertAppointment>) => {
      const url = buildUrl(api.appointments.update.path, { id });
      const res = await fetch(url, {
        method: api.appointments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update appointment");
      const raw = await res.json();
      return {
        ...raw,
        date: new Date(raw.date),
        createdAt: new Date(raw.createdAt)
      } as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.appointments.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
    },
  });
}
