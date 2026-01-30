'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';

export default function FirebaseTestPage() {
  const [results, setResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  function log(message: string) {
    setResults((prev) => [...prev, message]);
    console.log(message);
  }

  async function runTests() {
    setTesting(true);
    setResults([]);

    log('=== Firebase Configuration Test ===');
    log('');

    // Check environment variables
    log('1. Checking environment variables:');
    log(`   API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing'}`);
    log(`   Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '✗ Missing'}`);
    log(`   Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '✗ Missing'}`);
    log(`   Storage Bucket: ${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '✗ Missing'}`);
    log(`   Messaging Sender ID: ${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '✗ Missing'}`);
    log(`   App ID: ${process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '✗ Missing'}`);
    log('');

    // Check Firebase Auth initialization
    log('2. Checking Firebase Auth:');
    try {
      if (auth && Object.keys(auth).length > 0) {
        log(`   ✓ Auth initialized`);
        log(`   Auth config: ${auth.config?.apiKey ? 'API key present' : 'No API key'}`);
      } else {
        log(`   ✗ Auth not initialized`);
      }
    } catch (error) {
      log(`   ✗ Error checking auth: ${error}`);
    }
    log('');

    // Check Firestore initialization
    log('3. Checking Firestore:');
    try {
      if (db && Object.keys(db).length > 0) {
        log(`   ✓ Firestore initialized`);
        log(`   DB type: ${db.type || 'unknown'}`);
      } else {
        log(`   ✗ Firestore not initialized`);
      }
    } catch (error) {
      log(`   ✗ Error checking Firestore: ${error}`);
    }
    log('');

    // Test Firestore query
    log('4. Testing Firestore query (10 second timeout):');
    try {
      const startTime = Date.now();
      const testQuery = query(collection(db, 'challenges'), limit(1));

      const result = await Promise.race([
        getDocs(testQuery),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
        )
      ]);

      const duration = Date.now() - startTime;
      log(`   ✓ Query succeeded in ${duration}ms`);
      log(`   Found ${result.docs.length} documents`);
    } catch (error: any) {
      log(`   ✗ Query failed: ${error.message}`);
      log(`   Error code: ${error.code || 'none'}`);
      log(`   Error name: ${error.name || 'none'}`);
      if (error.stack) {
        log(`   Stack (first 200 chars): ${error.stack.substring(0, 200)}`);
      }
    }
    log('');

    // Test a document get (should be faster than a query)
    log('5. Testing document get (5 second timeout):');
    try {
      const startTime = Date.now();
      const testDoc = doc(db, 'challenges', 'test-doc-that-does-not-exist');

      const result = await Promise.race([
        getDoc(testDoc),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Document get timeout after 5 seconds')), 5000)
        )
      ]);

      const duration = Date.now() - startTime;
      log(`   ✓ Document get succeeded in ${duration}ms`);
      log(`   Document exists: ${result.exists()}`);
    } catch (error: any) {
      log(`   ✗ Document get failed: ${error.message}`);
    }
    log('');

    // Test if we're running in a browser vs server
    log('6. Environment check:');
    log(`   Window defined: ${typeof window !== 'undefined' ? 'Yes' : 'No'}`);
    log(`   User agent: ${typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}`);
    log(`   Online: ${typeof navigator !== 'undefined' ? navigator.onLine : 'N/A'}`);
    log('');

    log('=== Test Complete ===');
    setTesting(false);
  }

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Firebase Connection Test</h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {testing ? 'Testing...' : 'Run Tests Again'}
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            {results.length === 0 ? (
              <div>Running tests...</div>
            ) : (
              <pre>{results.join('\n')}</pre>
            )}
          </div>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <p>This page tests the Firebase connection to help diagnose issues.</p>
          <p className="mt-2">
            <a href="/dashboard" className="text-blue-600 hover:underline">
              ← Back to Dashboard
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
