#!/usr/bin/env node

/**
 * Create test data in Firestore
 */

const admin = require('firebase-admin');
const path = require('path');

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

  async function createTestData() {
    console.log('\n📝 Creating test data in Firestore...\n');

    try {
      // Create a test challenge
      const challengeRef = await db.collection('challenges').add({
        title: 'Test Challenge',
        description: 'A test challenge for debugging',
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        rules: 'Test rules',
        adminId: 'test-admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      });

      console.log('   ✓ Created test challenge:', challengeRef.id);

      // Verify we can read it back
      const doc = await challengeRef.get();
      if (doc.exists) {
        console.log('   ✓ Verified: Can read challenge back');
        console.log('   ✓ Challenge title:', doc.data().title);
      } else {
        console.log('   ✗ Error: Could not read challenge back');
      }

      // Test a query
      const snapshot = await db.collection('challenges').limit(1).get();
      console.log('   ✓ Query test: Found', snapshot.size, 'document(s)');

      console.log('\n✅ Test data created successfully!\n');
      console.log('Now try the firebase-test page again in production.\n');

    } catch (error) {
      console.error('\n❌ Error creating test data:', error.message);
    } finally {
      process.exit();
    }
  }

  createTestData();

} catch (error) {
  console.log('\n❌ Could not load Firebase service account key.\n');
  console.log('Error:', error.message);
  console.log('\nMake sure serviceAccountKey.json exists in the project root.\n');
  process.exit(1);
}
