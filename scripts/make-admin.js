// Script to make a user an admin
// Usage: node scripts/make-admin.js <user-email>

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Note: You'll need to download your service account key from Firebase Console
// Place it in the root directory as 'serviceAccountKey.json'

try {
  const serviceAccount = require('../serviceAccountKey.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Error: Could not load serviceAccountKey.json');
  console.error('Please download your service account key from Firebase Console:');
  console.error('1. Go to Project Settings > Service Accounts');
  console.error('2. Click "Generate New Private Key"');
  console.error('3. Save as serviceAccountKey.json in project root');
  process.exit(1);
}

const db = admin.firestore();

async function makeUserAdmin(email) {
  try {
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      console.error(`Error: No user found with email ${email}`);
      console.log('Make sure the user has signed up first!');
      process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;

    // Update user role to admin
    await usersRef.doc(userId).update({
      role: 'admin'
    });

    console.log(`✅ Success! User ${email} is now an admin`);
    console.log(`User ID: ${userId}`);
    console.log('They will need to log out and log back in to see admin features.');

    process.exit(0);
  } catch (error) {
    console.error('Error making user admin:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/make-admin.js <user-email>');
  console.error('Example: node scripts/make-admin.js user@example.com');
  process.exit(1);
}

makeUserAdmin(email);
