#!/usr/bin/env node

/**
 * Server-only admin provisioning.
 *
 * Usage:
 *   node scripts/create-admin.mjs --email owner@example.com --password "StrongPass123!" --name "Owner Name"
 *
 * Authentication:
 *   Set GOOGLE_APPLICATION_CREDENTIALS to a Firebase service-account JSON file, or
 *   set FIREBASE_SERVICE_ACCOUNT_KEY to the JSON contents.
 */

import process from "node:process";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const key = process.argv[i];
  const value = process.argv[i + 1];
  if (key.startsWith("--") && value && !value.startsWith("--")) {
    args.set(key.slice(2), value);
    i += 1;
  }
}

const email = args.get("email");
const password = args.get("password");
const name = args.get("name") || "Chao Admin";

if (!email || !password) {
  console.error('Missing required args. Use --email "admin@example.com" --password "StrongPass123!"');
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

let admin;
try {
  const adminModule = await import("firebase-admin");
  admin = adminModule.default ?? adminModule;
} catch {
  console.error("firebase-admin is not installed. Run npm install in the admin app first.");
  process.exit(1);
}

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
const appOptions = serviceAccountJson
  ? { credential: admin.cert(JSON.parse(serviceAccountJson)) }
  : { credential: admin.applicationDefault() };

if (!admin.getApps().length) {
  admin.initializeApp(appOptions);
}

const auth = admin.auth();
const db = admin.firestore();

let user;
try {
  user = await auth.getUserByEmail(email);
  user = await auth.updateUser(user.uid, {
    email,
    password,
    displayName: name,
    disabled: false,
  });
  console.log(`Updated existing admin auth user: ${user.uid}`);
} catch (error) {
  if (error?.code !== "auth/user-not-found") {
    throw error;
  }

  user = await auth.createUser({
    email,
    password,
    displayName: name,
    emailVerified: true,
    disabled: false,
  });
  console.log(`Created admin auth user: ${user.uid}`);
}

await auth.setCustomUserClaims(user.uid, {
  admin: true,
  role: "admin",
});

await db.collection("users").doc(user.uid).set(
  {
    name,
    email,
    userrole: "admin",
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  { merge: true }
);

console.log(`Admin profile ready for ${email}.`);
