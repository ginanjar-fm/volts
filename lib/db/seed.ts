import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  users,
  organizations,
  organizationMembers,
  subscriptions,
} from "./schema";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  console.log("Seeding database...");

  // Create test users
  const [alice, bob] = await db
    .insert(users)
    .values([
      {
        email: "alice@example.com",
        name: "Alice Johnson",
        emailVerified: new Date(),
      },
      {
        email: "bob@example.com",
        name: "Bob Smith",
        emailVerified: new Date(),
      },
    ])
    .returning();

  console.log("Created users:", alice.email, bob.email);

  // Create test organization
  const [org] = await db
    .insert(organizations)
    .values({
      name: "Acme Corp",
      slug: "acme-corp",
    })
    .returning();

  console.log("Created organization:", org.name);

  // Add members
  await db.insert(organizationMembers).values([
    {
      organizationId: org.id,
      userId: alice.id,
      role: "owner",
    },
    {
      organizationId: org.id,
      userId: bob.id,
      role: "member",
    },
  ]);

  console.log("Added organization members");

  // Create test subscription
  await db.insert(subscriptions).values({
    organizationId: org.id,
    stripeCustomerId: "cus_test_123",
    stripeSubscriptionId: "sub_test_123",
    stripePriceId: "price_test_123",
    status: "active",
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  console.log("Created test subscription");
  console.log("Seeding complete.");

  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
