#!/usr/bin/env node

/**
 * Delete a user from Firebase by email (both Auth and Firestore)
 * Usage: node scripts/delete-user-by-email.js <email>
 */

const admin = require('firebase-admin');
const path = require('path');

const email = process.argv[2];

if (!email) {
  console.log('\n❌ Please provide an email address');
  console.log('Usage: node scripts/delete-user-by-email.js <email>\n');
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

  async function deleteUserByEmail() {
    console.log('\n🗑️  Deleting user with email:', email);

    try {
      // Find user in Firebase Auth
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(email);
        console.log('   ✓ Found in Firebase Auth');
        console.log('     - UID:', userRecord.uid);
        console.log('     - Email:', userRecord.email);
        console.log('     - Display Name:', userRecord.displayName);
      } catch (authError) {
        if (authError.code === 'auth/user-not-found') {
          console.log('   ℹ User not found in Firebase Auth');
        } else {
          throw authError;
        }
      }

      console.log('\n⏳ Deleting in 2 seconds... (Press Ctrl+C to cancel)\n');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Delete from Firestore if we have a user ID
      if (userRecord) {
        const userDoc = db.collection('users').doc(userRecord.uid);
        const userSnapshot = await userDoc.get();

        if (userSnapshot.exists) {
          await userDoc.delete();
          console.log('   ✓ Deleted from Firestore "users" collection');
        } else {
          console.log('   ℹ User document not found in Firestore');
        }

        // Also check for and delete related data
        console.log('\n🧹 Cleaning up related data...');

        // Delete participants
        const participantsSnapshot = await db.collection('participants')
          .where('userId', '==', userRecord.uid)
          .get();
        if (!participantsSnapshot.empty) {
          const batch = db.batch();
          participantsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log(`   ✓ Deleted ${participantsSnapshot.size} participant record(s)`);
        }

        // Delete planks
        const planksSnapshot = await db.collection('planks')
          .where('userId', '==', userRecord.uid)
          .get();
        if (!planksSnapshot.empty) {
          const batch = db.batch();
          planksSnapshot.docs.forEach(doc => batch.delete(doc.ref));
          await batch.commit();
          console.log(`   ✓ Deleted ${planksSnapshot.size} plank record(s)`);
        }

        // Delete from Firebase Auth
        await auth.deleteUser(userRecord.uid);
        console.log('   ✓ Deleted from Firebase Authentication');
      }

      console.log('\n✅ User deletion complete!');
      console.log('\n📋 Next steps:');
      console.log('   1. Clear browser cache/localStorage (or use incognito)');
      console.log('   2. Sign up again at http://localhost:3000/signup');
      console.log('   3. User document will be created automatically!\n');

    } catch (error) {
      console.error('\n❌ Error during user deletion:', error.message);
      console.error(error);
    } finally {
      process.exit();
    }
  }

  deleteUserByEmail();

} catch (error) {
  console.log('\n❌ Could not load Firebase service account key.\n');
  console.log('Error:', error.message);
  console.log('\nMake sure serviceAccountKey.json exists in the project root.\n');
  process.exit(1);
}
