import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const calculatorHistory = pgTable("calculator_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expression: text("expression").notNull(),
  result: text("result").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCalculatorHistorySchema = createInsertSchema(calculatorHistory).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCalculatorHistory = z.infer<typeof insertCalculatorHistorySchema>;
export type CalculatorHistory = typeof calculatorHistory.$inferSelect;
