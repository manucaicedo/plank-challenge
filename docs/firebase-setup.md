# Firebase Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `plank-challenge`
4. Disable Google Analytics (optional for MVP)
5. Click "Create project"

## 2. Register Web App

1. In Firebase Console, click the web icon `</>`
2. Enter app nickname: `Plank Challenge Web`
3. Check "Also set up Firebase Hosting"
4. Click "Register app"

## 3. Get Firebase Configuration

1. Copy the Firebase configuration object
2. Create `.env.local` file in project root
3. Add the configuration values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 4. Set Up Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. Click "Save"

## 5. Set Up Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose a location (e.g., `us-central1`)
5. Click "Enable"

### Firestore Security Rules (Development)

For development, use test mode rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2026, 3, 1);
    }
  }
}
```

**Note:** Before production, you MUST implement proper security rules!

## 6. Database Collections

Create these collections in Firestore:

- `users` - User profiles
- `challenges` - Challenge details
- `participants` - Challenge participants
- `planks` - Daily plank records
- `fistbumps` - Kudos given to participants
- `comments` - Comments on progress
- `notifications` - In-app notifications

## 7. Verify Setup

1. Make sure `.env.local` exists with your Firebase config
2. Start the dev server: `npm run dev`
3. Firebase should initialize without errors

## Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Use Firebase security rules in production
- Validate all data on the backend
- Limit Firestore reads/writes to prevent abuse

## Next Steps

After Firebase is set up:
1. Test authentication (sign up/login)
2. Test Firestore read/write
3. Implement security rules before production
