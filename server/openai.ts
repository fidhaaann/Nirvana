import OpenAI from "openai";
import { storage } from "./storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// System prompt that defines the AI Receptionist's personality and capabilities
const SYSTEM_PROMPT = `
You are an intelligent AI Receptionist for a business. 
Your goal is to assist customers with:
1. Booking appointments
2. Ordering products
3. Answering general questions about the business (hours, location, services).

You have access to real-time tools/functions. 
ALWAYS call a function if the user's intent matches one of the available tools.
If you need more information to call a tool (e.g., date/time for appointment), ask the user for it politely.
Do NOT hallucinate availability or stock. Rely on the tool outputs.

Personality: Professional, friendly, concise, and helpful. 
Keep responses relatively short as they will be spoken aloud to the user.
`;

export async function processVoiceInput(text: string, sessionId: string) {
  // 1. Get current context (products, business info) if needed, 
  // or let the LLM decide to ask for it via tools.
  // For simplicity, we'll give it the product list in the system prompt or as a tool context.
  
  const products = await storage.getProducts();
  const productContext = products.map(p => `${p.name} ($${p.price}) - ${p.stock} in stock`).join("\n");

  const fullSystemPrompt = `${SYSTEM_PROMPT}\n\nAvailable Products:\n${productContext}`;

  // 2. Define Tools
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "check_availability",
        description: "Check if an appointment slot is available",
        parameters: {
          type: "object",
          properties: {
            date: { type: "string", description: "ISO date string or description (e.g. 2023-10-27T10:00:00)" },
          },
          required: ["date"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "book_appointment",
        description: "Book a confirmed appointment",
        parameters: {
          type: "object",
          properties: {
            customerName: { type: "string" },
            date: { type: "string", description: "ISO date string" },
            contactInfo: { type: "string" },
          },
          required: ["customerName", "date", "contactInfo"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "create_order",
        description: "Place an order for products",
        parameters: {
          type: "object",
          properties: {
            customerName: { type: "string" },
            items: { 
              type: "array", 
              items: { 
                type: "object", 
                properties: {
                  productName: { type: "string" },
                  quantity: { type: "number" }
                } 
              } 
            },
          },
          required: ["customerName", "items"],
        },
      },
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for speed/cost
      messages: [
        { role: "system", content: fullSystemPrompt },
        { role: "user", content: text },
      ],
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = response.choices[0].message;

    // Handle Function Calls
    if (responseMessage.tool_calls) {
      const toolCall = responseMessage.tool_calls[0];
      const fnName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      // --- EXECUTE TOOLS ---
      if (fnName === "check_availability") {
        // AI handles date parsing, but we should double check validity
        const date = new Date(args.date);
        if (isNaN(date.getTime())) {
          return { textResponse: "I couldn't understand that date. Could you please repeat it?" };
        }
        
        const isAvailable = await storage.checkAvailability(date);
        if (isAvailable) {
          return { 
            textResponse: `Yes, ${args.date} is available. Would you like me to book it?`,
            action: { type: "ask_time" } // Frontend hint
          };
        } else {
          return { textResponse: "Sorry, that time is already booked. Please choose another time." };
        }
      }

      if (fnName === "book_appointment") {
        const appointment = await storage.createAppointment({
          customerName: args.customerName,
          date: new Date(args.date),
          contactInfo: args.contactInfo,
          status: "confirmed"
        });
        return { 
          textResponse: `I've booked your appointment for ${args.date}. Thank you, ${args.customerName}!`,
          action: { type: "confirm_appointment", data: appointment }
        };
      }

      if (fnName === "create_order") {
        // Map names to IDs
        const orderItems = [];
        let totalAmount = 0;
        
        for (const item of args.items) {
          const product = await storage.getProductByName(item.productName);
          if (product) {
            if (product.stock < item.quantity) {
              return { textResponse: `Sorry, we only have ${product.stock} of ${product.name} left.` };
            }
            // Update stock (simplistic)
            await storage.updateProduct(product.id, { stock: product.stock - item.quantity });
            
            orderItems.push({
              productId: product.id,
              quantity: item.quantity,
              price: product.price
            });
            totalAmount += product.price * item.quantity;
          } else {
             return { textResponse: `I couldn't find a product named ${item.productName}.` };
          }
        }

        const order = await storage.createOrder({
          customerName: args.customerName,
          totalAmount,
          items: orderItems,
          status: "pending"
        });

        return {
          textResponse: `Order placed! Total is $${totalAmount}.`,
          action: { type: "confirm_order", data: order }
        };
      }
    }

    // Default text response
    return {
      textResponse: responseMessage.content || "I didn't quite catch that.",
      action: { type: "none" }
    };

  } catch (error) {
    console.error("OpenAI Error:", error);
    return {
      textResponse: "I'm having trouble connecting right now. Please try again later.",
      action: { type: "none" }
    };
  }
}
