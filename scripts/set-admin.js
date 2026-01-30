#!/usr/bin/env node

/**
 * Script to set a user as admin in Firestore
 * Usage: node scripts/set-admin.js <user-email>
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Check if email argument is provided
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('❌ Error: Please provide a user email');
  console.log('Usage: node scripts/set-admin.js <user-email>');
  process.exit(1);
}

// Initialize Firebase Admin (requires service account key)
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function setUserAsAdmin() {
    try {
      // Find user by email in Firestore
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', userEmail).get();

      if (snapshot.empty) {
        console.log('❌ No user found with email:', userEmail);
        console.log('Make sure the user has signed up first.');
        return;
      }

      // Update the first matching user to admin
      const userDoc = snapshot.docs[0];
      await userDoc.ref.update({ role: 'admin' });

      console.log('✅ Success! User', userEmail, 'is now an admin');
      console.log('User ID:', userDoc.id);

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      process.exit();
    }
  }

  setUserAsAdmin();

} catch (error) {
  console.error('❌ Error: Could not load Firebase service account');
  console.log('\nTo use this script, you need to:');
  console.log('1. Download your Firebase service account key from:');
  console.log('   https://console.firebase.google.com/project/plank-challenge-app-2026/settings/serviceaccounts/adminsdk');
  console.log('2. Save it as serviceAccountKey.json in the project root');
  console.log('3. Add serviceAccountKey.json to .gitignore (already done)');
  console.log('\nOr use the Firebase Console method instead (easier):');
  console.log('1. Go to: https://console.firebase.google.com/project/plank-challenge-app-2026/firestore');
  console.log('2. Navigate to "users" collection');
  console.log('3. Find your user and change role to "admin"');
  process.exit(1);
}
