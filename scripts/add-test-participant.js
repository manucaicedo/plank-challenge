#!/usr/bin/env node

/**
 * Quick script to add yourself as a participant to a challenge for testing
 * Usage: node scripts/add-test-participant.js
 */

const admin = require('firebase-admin');

// Check if service account exists
let serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json';

try {
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  const db = admin.firestore();

  async function addTestParticipant() {
    try {
      // Find the user
      const email = 'manuela.i.caicedo@gmail.com';
      const usersSnapshot = await db.collection('users').where('email', '==', email).get();

      if (usersSnapshot.empty) {
        console.log('❌ User not found. Make sure you\'ve signed up first.');
        process.exit(1);
      }

      const userDoc = usersSnapshot.docs[0];
      const userId = userDoc.id;
      const userName = userDoc.data().name;

      // Get all challenges
      const challengesSnapshot = await db.collection('challenges')
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();

      if (challengesSnapshot.empty) {
        console.log('❌ No challenges found. Create a challenge first at /admin/create-challenge');
        process.exit(1);
      }

      const challenge = challengesSnapshot.docs[0];
      const challengeId = challenge.id;
      const challengeTitle = challenge.data().title;

      // Check if already a participant
      const existingParticipant = await db.collection('participants')
        .where('userId', '==', userId)
        .where('challengeId', '==', challengeId)
        .get();

      if (!existingParticipant.empty) {
        console.log('✅ You\'re already a participant in:', challengeTitle);
        process.exit(0);
      }

      // Add as participant
      await db.collection('participants').add({
        userId: userId,
        userEmail: email,
        userName: userName,
        challengeId: challengeId,
        status: 'active',
        joinedAt: new Date().toISOString()
      });

      console.log('✅ Success! Added you as a participant to:', challengeTitle);
      console.log('👉 Now go to http://localhost:3000/record-plank to record your plank!');

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      process.exit();
    }
  }

  addTestParticipant();

} catch (error) {
  console.log('\n⚠️  To use this script, you need a Firebase service account key.');
  console.log('\nInstead, manually add yourself as a participant:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/project/plank-challenge-app-2026/firestore');
  console.log('2. Open "participants" collection');
  console.log('3. Click "Add document"');
  console.log('4. Add these fields:');
  console.log('   - userId: [your user ID from the users collection]');
  console.log('   - userEmail: manuela.i.caicedo@gmail.com');
  console.log('   - userName: [your name]');
  console.log('   - challengeId: [copy a challenge ID from challenges collection]');
  console.log('   - status: active');
  console.log('   - joinedAt: [today\'s date in ISO format]');
  process.exit(1);
}
