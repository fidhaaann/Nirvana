import { z } from 'zod';
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertAppointmentSchema, 
  insertSettingsSchema,
  processVoiceSchema,
  products,
  orders,
  appointments,
  settings
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  // Voice/AI
  voice: {
    process: {
      method: 'POST' as const,
      path: '/api/process-voice',
      input: processVoiceSchema,
      responses: {
        200: z.object({
          textResponse: z.string(),
          action: z.object({
            type: z.enum(["ask_time", "confirm_appointment", "confirm_order", "check_stock", "none"]),
            data: z.any().optional(),
          }).optional()
        }),
        400: errorSchemas.validation,
      }
    }
  },

  // Products
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id',
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Orders
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: insertOrderSchema,
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/orders/:id',
      input: insertOrderSchema.partial(),
      responses: {
        200: z.custom<typeof orders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },

  // Appointments
  appointments: {
    list: {
      method: 'GET' as const,
      path: '/api/appointments',
      responses: {
        200: z.array(z.custom<typeof appointments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/appointments',
      input: insertAppointmentSchema,
      responses: {
        201: z.custom<typeof appointments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/appointments/:id',
      input: insertAppointmentSchema.partial(),
      responses: {
        200: z.custom<typeof appointments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  
  // Dashboard Stats
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          todayAppointments: z.number(),
          todayOrders: z.number(),
          totalRevenue: z.number(),
          lowStockCount: z.number(),
        }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
