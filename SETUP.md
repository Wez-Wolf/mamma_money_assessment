# Setup & Implementation Notes

## Prerequisites

- **Node.js**: 22.22.3 (via nvm recommended)
- **Environment file**: A `.env` file is required in the project root with Braze API keys and FCM sender ID. This was provided with the assessment materials.

## Build & Run

```bash
# Quick build and run
./build.sh

# Or step-by-step:
source ~/.nvm/nvm.sh
nvm use 22.22.3
npx ionic build
npx cap run android

# Live reload
npm run start:android
```

## Architecture

| Layer | Implementation |
|-------|---------------|
| **Splash screen** | HTML overlay in `index.html` with CSS background. Fades out after 2s via `ngOnInit`. Android 12+ system splash suppressed via theme override (`values-v31/styles.xml`). No native plugin needed. |
| **Event trigger** | `HomePage.sendInboxTestEvent()` → `BrazePlugin.logCustomEvent('INBOX_MESSAGE_TEST')` + `requestImmediateDataFlush()` |
| **Push handling** | `PushNotificationService` listens for both `pushNotificationReceived` (foreground) and `pushNotificationActionPerformed` (tray tap). Parses `ab_cd` from payload for instant card display without server call. |
| **State management** | `InboxStateService` with Angular signals (`cards`, `loading`, `unreadCount`). Tracks dismissals and viewed state client-side via `Set`s to prevent reappearance after re-fetch. |
| **Inbox UI** | `InboxComponent` as an Ionic modal with lazy loading. Pull-to-refresh, loading/empty states, dismiss confirmation, deep link navigation. SCSS fits within the 2kb style budget. |
| **Unread indicator** | `InboxButtonComponent` with `computed` from `unreadCount`. Anime.js shake animation triggered via `effect()` when new cards arrive. |

## Key design decisions

- **Card data from push payload**: The `ab_cd` field in the Braze push notification contains the content card data. Parsing it directly avoids an extra server call and eliminates the race condition between push arrival and card availability.
- **Web-layer splash**: Android 12+ forces a system SplashScreen API that doesn't support full-screen images. An HTML overlay in `index.html` bypasses this limitation completely.
- **Client-side dismissed/viewed tracking**: Braze doesn't persist these states locally. Without tracking, dismissed cards reappear on re-fetch and viewed cards lose their read state.
