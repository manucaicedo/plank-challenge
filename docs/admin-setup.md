# Admin Setup Guide

## How to Make a User an Admin

By default, all new users are created as participants. To make a user an admin, you need to update their role in the Firestore database.

## Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/project/plank-challenge-app-2026/firestore)
2. Open the `users` collection
3. Find the user you want to make an admin
4. Click on their document
5. Find the `role` field
6. Change the value from `"participant"` to `"admin"`
7. Click "Update"

The user will need to log out and log back in to see the admin features.

## Option 2: Using Node.js Script (Advanced)

### Prerequisites
1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin
   ```

2. Download Service Account Key:
   - Go to [Firebase Console > Project Settings > Service Accounts](https://console.firebase.google.com/project/plank-challenge-app-2026/settings/serviceaccounts/adminsdk)
   - Click "Generate New Private Key"
   - Save the file as `serviceAccountKey.json` in your project root
   - **Important**: Add `serviceAccountKey.json` to `.gitignore` (already done)

### Run the Script

```bash
node scripts/make-admin.js user@example.com
```

Replace `user@example.com` with the email of the user you want to make an admin.

## Testing Admin Access

1. Log in with the admin user account
2. You should see an "Admin" badge next to your name in the navbar
3. You should see an "Admin" link in the navigation
4. Click "Admin" to access the admin dashboard
5. You can now:
   - Create challenges
   - Invite participants
   - View all challenges
   - Manage participants

## Making Your First Account an Admin

If you just signed up and want to make yourself an admin:

1. **Note your email** that you used to sign up
2. **Use Firebase Console (easiest)**:
   - Open Firestore in Firebase Console
   - Go to `users` collection
   - Find your user document (by email)
   - Change `role` from `"participant"` to `"admin"`
3. **Log out and log back in**
4. You should now see the admin features!

## Troubleshooting

### "Admin" link not showing
- Make sure you logged out and logged back in after changing the role
- Check Firestore to confirm the role is set to "admin"
- Clear your browser cache

### Can't access admin pages
- Verify your role is "admin" in Firestore
- Check browser console for errors
- Make sure Firebase is properly configured

### Script errors
- Make sure `serviceAccountKey.json` exists in project root
- Verify you ran `npm install firebase-admin`
- Check that the email matches exactly with a user in the database
