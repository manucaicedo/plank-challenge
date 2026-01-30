#!/usr/bin/env node

/**
 * Check if a user exists in Firebase (both Auth and Firestore)
 * Usage: node scripts/check-user.js <email>
 */

const admin = require('firebase-admin');
const path = require('path');

const email = process.argv[2] || 'manuela.i.caicedo@gmail.com';

let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);

  // Check if already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }

  const db = admin.firestore();
  const auth = admin.auth();

  async function checkUser() {
    console.log('\n🔍 Checking user:', email);

    try {
      // Check Firebase Auth
      console.log('\n📧 Checking Firebase Authentication...');
      try {
        const userRecord = await auth.getUserByEmail(email);
        console.log('   ✓ Found in Firebase Auth');
        console.log('     - UID:', userRecord.uid);
        console.log('     - Email:', userRecord.email);
        console.log('     - Display Name:', userRecord.displayName);
        console.log('     - Created:', new Date(userRecord.metadata.creationTime).toLocaleString());
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('   ✗ NOT found in Firebase Auth');
        } else {
          console.log('   ✗ Error checking Auth:', authError.message);
        }
      }

      // Check Firestore by email
      console.log('\n📁 Checking Firestore users collection...');
      const usersSnapshot = await db.collection('users').where('email', '==', email).get();

      if (usersSnapshot.empty) {
        console.log('   ✗ NOT found in Firestore');
      } else {
        console.log('   ✓ Found in Firestore');
        usersSnapshot.forEach(doc => {
          const data = doc.data();
          console.log('     - Document ID:', doc.id);
          console.log('     - Email:', data.email);
          console.log('     - Name:', data.name);
          console.log('     - Role:', data.role);
          console.log('     - Created:', data.createdAt);
        });
      }

    } catch (error) {
      console.error('\n❌ Error checking user:', error.message);
    } finally {
      process.exit();
    }
  }

  checkUser();

} catch (error) {
  console.log('\n❌ Could not load Firebase service account key.\n');
  console.log('Error:', error.message);
  console.log('\nMake sure serviceAccountKey.json exists in the project root.\n');
  process.exit(1);
}
