require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const Administrator = require("../models/Administrator");
const BusinessSetting = require("../models/BusinessSetting");

async function seed() {
  await connectDB();

  const email = (process.env.SEED_ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeThisPassword123";
  const name = process.env.SEED_ADMIN_NAME || "Admin User";

  const existingAdmin = await Administrator.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin already exists for ${email}. Skipping admin creation.`);
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await Administrator.create({ name, email, passwordHash, status: "active" });
    console.log(`Admin created: ${email} (password comes from SEED_ADMIN_PASSWORD in your .env)`);
  }

  const existingSettings = await BusinessSetting.findOne();
  if (existingSettings) {
    console.log("Business settings document already exists. Skipping.");
  } else {
    await BusinessSetting.create({
      businessName: "Synexus Demo Business",
      description: "A sample business used to demo the reusable catalogue platform.",
      contact: { phone: "+92 300 0000000", email: "info@example.com", whatsapp: "+923000000000" },
      address: "Rawalpindi, Punjab, Pakistan",
      workingHours: "Mon-Sat: 10:00 AM - 8:00 PM",
      appearance: {
        primaryColor: "#0F766E",
        secondaryColor: "#0891B2",
        heroTitle: "Welcome to Synexus Demo Business",
        heroText: "Browse our catalogue and get in touch — no account needed.",
      },
    });
    console.log("Default business settings created.");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
