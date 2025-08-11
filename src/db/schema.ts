// src/db/schema.ts
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type LocationData = {
  longitude: number;
  latitude: number;
} | null;

// Add customers table
export const customersTable = sqliteTable('customers', {
  id: text('id').primaryKey().notNull(),
  name: text('name'),
  email: text('email').unique().notNull(),
  image: text('image'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Existing drivers table
export const driversTable = sqliteTable('drivers', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull(),
  phoneNumber: text('phone_number').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  profilePictureUrl: text('profile_picture_url'),
  balance: integer('balance').default(0).notNull(),
  vehicleType: text('vehicle_type').notNull(),
  carName: text('car_name').notNull(),
  numberPlate: text('number_plate').notNull(),
  licenseExpiry: text('license_expiry').notNull(),
  registrationExpiry: text('registration_expiry').notNull(),
  isOnline: integer('is_online', { mode: 'boolean' }).default(false).notNull(),
  lastLocation: text('last_location').$type<LocationData>().default(null),
  lastOnline: text('last_online').default(sql`CURRENT_TIMESTAMP`).notNull(),
  status: text('status').default('pending').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const driverTransactions = sqliteTable('driver_transactions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }).notNull(),
  driver_id: integer('driver_id').notNull().references(() => driversTable.id),
  amount: integer('amount').notNull(),
  payment_intent_id: text('payment_intent_id').notNull(),
  status: text('status').notNull(),
  created_at: text('created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export type InsertCustomer = typeof customersTable.$inferInsert;
export type SelectCustomer = typeof customersTable.$inferSelect;
export type InsertDriver = typeof driversTable.$inferInsert;
export type SelectDriver = typeof driversTable.$inferSelect;

export interface Driver extends Omit<SelectDriver, 'isOnline' | 'lastLocation'> {
  isOnline: boolean;
  lastLocation: { longitude: number; latitude: number } | null;
  profilePictureUrl: string;
}