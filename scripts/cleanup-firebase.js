#!/usr/bin/env node

/**
 * Clean up Firebase database - delete all test data
 * Usage: node scripts/cleanup-firebase.js
 */

const admin = require('firebase-admin');
const path = require('path');

let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function deleteCollection(collectionName) {
    console.log(`\n🗑️  Deleting all documents in "${collectionName}" collection...`);

    try {
      const snapshot = await db.collection(collectionName).get();

      if (snapshot.empty) {
        console.log(`   ✓ "${collectionName}" is already empty (0 documents)`);
        return;
      }

      const batch = db.batch();
      let count = 0;

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        count++;
      });

      await batch.commit();
      console.log(`   ✓ Deleted ${count} document(s) from "${collectionName}"`);
    } catch (error) {
      console.log(`   ✗ Error deleting "${collectionName}":`, error.message);
    }
  }

  async function cleanupFirebase() {
    console.log('\n🧹 Starting Firebase cleanup...\n');
    console.log('⚠️  WARNING: This will delete all data from the following collections:');
    console.log('   - participants');
    console.log('   - planks');
    console.log('   - challenges');
    console.log('   - invitations');
    console.log('   - fistbumps');
    console.log('\n   The "users" collection will be kept (so you don\'t lose your account).\n');

    // Wait 3 seconds to allow cancellation
    console.log('⏳ Starting in 3 seconds... (Press Ctrl+C to cancel)\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
      // Delete collections (but keep users)
      await deleteCollection('participants');
      await deleteCollection('planks');
      await deleteCollection('challenges');
      await deleteCollection('invitations');
      await deleteCollection('fistbumps');

      console.log('\n✅ Firebase cleanup complete!');
      console.log('\n📋 Next steps:');
      console.log('   1. Refresh your browser on both local and production');
      console.log('   2. Create a new challenge at /admin/create-challenge');
      console.log('   3. Invite yourself via email');
      console.log('   4. Accept the invitation and start fresh!\n');

    } catch (error) {
      console.error('\n❌ Error during cleanup:', error.message);
    } finally {
      process.exit();
    }
  }

  cleanupFirebase();

} catch (error) {
  console.log('\n❌ Firebase Admin SDK could not be initialized.\n');
  console.log('Error:', error.message);
  console.log('\nTo use this script, you need a Firebase service account key.\n');
  console.log('📖 How to get the service account key:\n');
  console.log('1. Go to: https://console.firebase.google.com/project/plank-challenge-app-2026/settings/serviceaccounts/adminsdk');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the downloaded file as "serviceAccountKey.json" in the project root');
  console.log('4. Run this script again\n');
  console.log('⚠️  NOTE: The serviceAccountKey.json is already in .gitignore and won\'t be committed.\n');
  console.log('\n📌 Alternative: Clean up manually via Firebase Console:');
  console.log('   https://console.firebase.google.com/project/plank-challenge-app-2026/firestore/data\n');
  process.exit(1);
}
