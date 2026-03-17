import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  boolean,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["owner", "admin", "member"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "trialing",
  "incomplete",
  "paused",
]);

// Users
export const users = pgTable("users", {
  id: uuid().defaultRandom().primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  avatar: text(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// OAuth / credential accounts linked to users
export const accounts = pgTable("accounts", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: varchar({ length: 64 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: integer("expires_at"),
  tokenType: varchar("token_type", { length: 64 }),
  scope: text(),
  idToken: text("id_token"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Sessions
export const sessions = pgTable("sessions", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text().notNull().unique(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Organizations (teams / workspaces)
export const organizations = pgTable("organizations", {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull().unique(),
  logo: text(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Organization members (user ↔ org relationship)
export const organizationMembers = pgTable("organization_members", {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: roleEnum().notNull().default("member"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

// Stripe subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 255,
  }).unique(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  status: subscriptionStatusEnum().notNull().default("incomplete"),
  currentPeriodStart: timestamp("current_period_start", { mode: "date" }),
  currentPeriodEnd: timestamp("current_period_end", { mode: "date" }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  organizationMembers: many(organizationMembers),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  subscriptions: many(subscriptions),
}));

export const organizationMembersRelations = relations(
  organizationMembers,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [organizationMembers.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [organizationMembers.userId],
      references: [users.id],
    }),
  }),
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));
