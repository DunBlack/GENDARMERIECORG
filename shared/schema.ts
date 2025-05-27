import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const officers = pgTable("officers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  badge: text("badge").notNull().unique(),
  initials: text("initials").notNull(),
  rank: text("rank").notNull(),
  available: boolean("available").notNull().default(true),
  vehicleId: integer("vehicle_id"),
  slotNumber: integer("slot_number"), // 1, 2, 3, or 4 for vehicle slots
  isAssignedToCorg: boolean("is_assigned_to_corg").notNull().default(false),
});

export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  callSign: text("call_sign").notNull(),
  license: text("license").notNull().unique(),
  status: text("status").notNull().default("Disponible"), // Disponible, En Patrouille, ASL, En Intervention, Hors Service
});

export const insertOfficerSchema = createInsertSchema(officers).omit({
  id: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
});

export type InsertOfficer = z.infer<typeof insertOfficerSchema>;
export type Officer = typeof officers.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

// For backwards compatibility
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
