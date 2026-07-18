# GrantPilot Client

Next.js, React and TypeScript frontend for GrantPilot AI.

```powershell
npm install --no-audit --no-fund
npm run dev
```

Environment file: `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_IMGBB_API_KEY=
```

The Add Scholarship page supports ImgBB image upload when `NEXT_PUBLIC_IMGBB_API_KEY` is configured.
