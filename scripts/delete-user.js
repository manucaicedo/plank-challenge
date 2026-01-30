#!/usr/bin/env node

/**
 * Delete a user from Firebase (both Auth and Firestore)
 * Usage: node scripts/delete-user.js <user-id>
 */

const admin = require('firebase-admin');
const path = require('path');

const userId = process.argv[2] || 'v9D1GGdYo3Tquu0Z7M6C8WrqjZX2';

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

  async function deleteUser() {
    console.log('\n🗑️  Deleting user:', userId);
    console.log('⏳ Starting in 2 seconds... (Press Ctrl+C to cancel)\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Delete from Firestore users collection
      const userDoc = db.collection('users').doc(userId);
      const userSnapshot = await userDoc.get();

      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        console.log('   ✓ Found user in Firestore:', userData?.email);
        await userDoc.delete();
        console.log('   ✓ Deleted from Firestore "users" collection');
      } else {
        console.log('   ℹ User not found in Firestore');
      }

      // Delete from Firebase Auth
      try {
        await auth.deleteUser(userId);
        console.log('   ✓ Deleted from Firebase Authentication');
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('   ℹ User not found in Firebase Auth');
        } else {
          console.log('   ✗ Error deleting from Auth:', authError.message);
        }
      }

      console.log('\n✅ User cleanup complete!');
      console.log('\n📋 Next steps:');
      console.log('   1. Sign up again at https://plank-challenge-chi.vercel.app/signup');
      console.log('   2. Create a challenge at /admin/create-challenge');
      console.log('   3. Dashboard should work immediately!\n');

    } catch (error) {
      console.error('\n❌ Error during user deletion:', error.message);
    } finally {
      process.exit();
    }
  }

  deleteUser();

} catch (error) {
  console.log('\n❌ Could not load Firebase service account key.\n');
  console.log('Error:', error.message);
  console.log('\nMake sure serviceAccountKey.json exists in the project root.\n');
  process.exit(1);
}
