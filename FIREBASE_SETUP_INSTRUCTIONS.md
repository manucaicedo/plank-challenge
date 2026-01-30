# Firebase Setup Instructions

Follow these steps to set up Firebase for your Plank Challenge app.

## Step 1: Login to Firebase CLI

Run this command and follow the browser prompts:

```bash
cd "/Users/mcaicedo/Documents/Claude Code/Plank-Challenge"
firebase login
```

This will:
- Open your browser
- Ask you to sign in with your Google account
- Grant permissions to Firebase CLI

## Step 2: Create Firebase Project

### Option A: Use Firebase CLI (Recommended)
```bash
firebase projects:create plank-challenge-app
```

### Option B: Use Firebase Console
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Project name: "Plank Challenge"
4. Project ID: "plank-challenge-app" (or let Firebase generate one)
5. Disable Google Analytics (optional for MVP)
6. Click "Create project"

## Step 3: Initialize Firebase in Your Project

```bash
cd "/Users/mcaicedo/Documents/Claude Code/Plank-Challenge"
firebase init
```

When prompted, select:
- ✅ Firestore
- ✅ Functions (optional, for later)
- ✅ Hosting

Follow the prompts:
- **Use existing project**: Select the project you just created
- **Firestore rules**: Use default (firestore.rules)
- **Firestore indexes**: Use default (firestore.indexes.json)
- **Public directory**: Enter `out` (for Next.js static export) or `public`
- **Single-page app**: Yes
- **Set up automatic builds**: No (we'll use Vercel)

## Step 4: Enable Authentication

### Via Firebase Console:
1. Go to https://console.firebase.google.com/
2. Select your project
3. Go to "Authentication" in the left sidebar
4. Click "Get started"
5. Enable "Email/Password" provider
6. Click "Save"

### Via Firebase CLI:
```bash
# This is done automatically when you add users later
```

## Step 5: Enable Firestore Database

### Via Firebase Console:
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose location: `us-central1` (or closest to you)
5. Click "Enable"

⚠️ **Important**: Test mode allows anyone to read/write. We'll add security rules later.

## Step 6: Get Your Web App Configuration

### Via Firebase Console:
1. In Firebase Console, go to "Project Settings" (gear icon)
2. Scroll to "Your apps" section
3. Click the web icon `</>`
4. Register app nickname: "Plank Challenge Web"
5. Copy the Firebase configuration object

### Via Firebase CLI:
```bash
firebase apps:create WEB "Plank Challenge Web"
firebase apps:sdkconfig WEB
```

You should see output like:
```javascript
{
  apiKey: "AIza...",
  authDomain: "plank-challenge-app.firebaseapp.com",
  projectId: "plank-challenge-app",
  storageBucket: "plank-challenge-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
}
```

## Step 7: Configure Environment Variables

Create `.env.local` file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste your Firebase config:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=plank-challenge-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=plank-challenge-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=plank-challenge-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Step 8: Restart Development Server

Stop the current dev server (Ctrl+C) and restart:

```bash
npm run dev
```

## Verification

Your Firebase setup is complete when:
- ✅ Firebase CLI is logged in
- ✅ Project is created
- ✅ Authentication is enabled
- ✅ Firestore is enabled
- ✅ `.env.local` has your Firebase config
- ✅ Dev server runs without Firebase errors

## Next Steps

Once Firebase is set up, we can:
1. Build the authentication pages (sign up, login)
2. Create Firestore collections
3. Add security rules
4. Start building features

---

**Need help?** Let me know which step you're on and I'll assist you!
