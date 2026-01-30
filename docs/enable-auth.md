# Enable Firebase Authentication

Firebase Authentication needs to be enabled via the Firebase Console. Follow these quick steps:

## Quick Steps

1. **Open Firebase Console**
   Visit: https://console.firebase.google.com/project/plank-challenge-app-2026/authentication

2. **Get Started**
   - Click "Get started" button

3. **Enable Email/Password**
   - Click on "Email/Password" provider
   - Toggle "Enable" to ON
   - Click "Save"

That's it! Authentication is now enabled.

## Alternative: Using gcloud CLI

If you have gcloud CLI installed, you can enable it programmatically:

```bash
gcloud auth login
gcloud config set project plank-challenge-app-2026
gcloud services enable identitytoolkit.googleapis.com
```

## Verification

Once enabled, you can verify by running:
```bash
firebase auth:export test.json --project plank-challenge-app-2026
```

If it returns "No users found", authentication is working (just no users yet).

---

**Next:** After enabling authentication, restart your dev server (`npm run dev`) and you're ready to build the auth pages!
