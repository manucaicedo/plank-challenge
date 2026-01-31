#!/usr/bin/env node

/**
 * Fix missing Firestore user documents for users that exist in Firebase Auth
 * Usage: node scripts/fix-user-document.js <email>
 */

const admin = require('firebase-admin');
const path = require('path');

const email = process.argv[2];

if (!email) {
  console.log('\n❌ Please provide an email address');
  console.log('Usage: node scripts/fix-user-document.js <email>\n');
  process.exit(1);
}

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

  async function fixUserDocument() {
    console.log('\n🔧 Fixing user document for:', email);

    try {
      // Step 1: Get user from Firebase Auth
      console.log('\n📧 Checking Firebase Authentication...');
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        console.log('   ✓ Found in Firebase Auth');
        console.log('     - UID:', userRecord.uid);
        console.log('     - Email:', userRecord.email);
        console.log('     - Display Name:', userRecord.displayName);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('   ✗ User not found in Firebase Auth');
          console.log('   Cannot create Firestore document without Auth user\n');
          process.exit(1);
        } else {
          throw authError;
        }
      }

      // Step 2: Check if Firestore document exists
      console.log('\n📁 Checking Firestore users collection...');
      const userDocRef = db.collection('users').doc(userRecord.uid);
      const userDoc = await userDocRef.get();

      if (userDoc.exists()) {
        console.log('   ✓ User document already exists in Firestore');
        const data = userDoc.data();
        console.log('     - Name:', data.name);
        console.log('     - Role:', data.role);
        console.log('     - Created:', data.createdAt);
        console.log('\n✅ No fix needed!\n');
        process.exit(0);
      }

      // Step 3: Create missing Firestore document
      console.log('   ✗ User document NOT found in Firestore');
      console.log('\n🔨 Creating Firestore user document...');

      const userData = {
        email: userRecord.email,
        name: userRecord.displayName || email.split('@')[0],
        role: 'participant',
        createdAt: new Date().toISOString(),
        avatar: null,
      };

      await userDocRef.set(userData);

      console.log('   ✓ Firestore user document created successfully!');
      console.log('     - Document ID:', userRecord.uid);
      console.log('     - Email:', userData.email);
      console.log('     - Name:', userData.name);
      console.log('     - Role:', userData.role);
      console.log('\n✅ User document fixed! You can now log in.\n');

    } catch (error) {
      console.error('\n❌ Error fixing user document:', error.message);
      console.error(error);
    } finally {
      process.exit();
    }
  }

  fixUserDocument();

} catch (error) {
  console.log('\n❌ Could not load Firebase service account key.\n');
  console.log('Error:', error.message);
  console.log('\nMake sure serviceAccountKey.json exists in the project root.\n');
  process.exit(1);
}
