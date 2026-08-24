/**
 * One-time setup script: creates the first Administrator account.
 * Run with:  npm run seed:admin
 *
 * Reads SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from .env.
 * Safe to re-run: if an admin with that email already exists, it exits
 * without creating a duplicate.
 */
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Administrator = require("../models/Administrator");

async function seed() {
  await connectDB();

  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.error("[seed] Missing SEED_ADMIN_NAME / SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env");
    process.exit(1);
  }

  const existing = await Administrator.findOne({ email });
  if (existing) {
    console.log(`[seed] Administrator with email "${email}" already exists. Nothing to do.`);
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Administrator.create({ name, email, passwordHash, status: "active" });

  console.log(`[seed] Created administrator "${email}". You can now log in with this email/password.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err.message);
  process.exit(1);
});
