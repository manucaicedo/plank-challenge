#!/usr/bin/env node

/**
 * Delete today's plank record (useful for testing)
 * Usage: node scripts/delete-todays-plank.js
 */

const admin = require('firebase-admin');

let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function deleteTodaysPlank() {
    try {
      const userId = 'uHvs7RWnY7WamUVDCoC3v3ENNCl1'; // Your user ID
      const today = new Date().toISOString().split('T')[0];

      console.log('Looking for planks with:');
      console.log('  userId:', userId);
      console.log('  date:', today);

      const planksSnapshot = await db.collection('planks')
        .where('userId', '==', userId)
        .where('date', '==', today)
        .get();

      if (planksSnapshot.empty) {
        console.log('❌ No plank found for today');
        process.exit(0);
      }

      // Delete all matching records
      const batch = db.batch();
      planksSnapshot.docs.forEach(doc => {
        console.log('Deleting plank:', doc.id, doc.data());
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log('✅ Success! Deleted', planksSnapshot.size, 'plank record(s)');
      console.log('👉 Now refresh http://localhost:3000/record-plank and try again!');

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      process.exit();
    }
  }

  deleteTodaysPlank();

} catch (error) {
  console.log('\n⚠️  Firebase service account not found.');
  console.log('Please delete the plank manually via Firebase Console:');
  console.log('https://console.firebase.google.com/project/plank-challenge-app-2026/firestore/data/~2Fplanks');
  process.exit(1);
}
