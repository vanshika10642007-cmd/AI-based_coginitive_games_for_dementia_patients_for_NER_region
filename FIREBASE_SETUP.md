# Firebase integration

This build keeps the project as a plain Express + Vanilla JS app. Firebase is loaded in the browser with the Firebase compatibility SDK, so no bundler is required.

## Included
- Firebase project config in `public/firebase-config.js`
- Firestore session writes to `sessions`
- Firestore reminders in `reminders`
- Firestore language settings in `settings/{userId}`
- Firebase-backed caregiver dashboard with local API fallback
- Offline session queue; queued sessions sync to the local API and Firestore when connectivity returns
- Adaptive level recommendation at `/api/adaptive/recommend`
- Five games with real level-dependent parameters

## Run
```bash
npm install
npm start
```
Then open `http://localhost:3001` (or the port shown by the terminal).

Demo PIN: `demo123`.

## Firestore note
The app currently assumes the Firestore database created for the project is available. The Firebase console was set to Test mode during setup; tighten Firestore rules before deploying publicly.
