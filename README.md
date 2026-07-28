# Mama Money Frontend Technical Assessment

## Overview

This technical assessment evaluates your ability to implement a push notification and content card inbox system using the Braze SDK in an Ionic/Angular mobile application.

## Flow

1. Homepage: Send custom event "INBOX_MESSAGE_TEST" via Braze SDK

   - Implemented in [`HomePage`](src/app/home/home.page.ts)
   - Triggers Braze campaign to send push notification

2. Push Notification: Handle incoming notification

   - [`PushNotificationService`](src/app/shared/services/push-notification.service.ts) receives notification
   - Check if notification type is 'inbox'
   - Trigger content card fetch

3. Content Cards: Fetch and filter

   - Fetch contend cards from Braze
   - Filter cards with type 'inbox'
   - Update inbox state

4. UI Updates: Reflect new messages

   - [`InboxButtonComponent`](src/app/shared/components/inbox-button/inbox-button.component.ts) shows unread indicator
   - Animate notification icon
   - Update inbox card list

5. Navigation: Handle card interactions
   - Log card impressions when viewed
   - Handle deep links for navigation
   - Manage card dismissal

## Objective

Implement a fully functional Braze push notification and content card inbox system that demonstrates your understanding of mobile application development, state management, and third-party SDK integration.

## Requirements

### 1. Custom Event Implementation

- Implement the [`sendInboxTestEvent`](src/app/home/home.page.ts) method in the homepage to trigger a custom "INBOX_MESSAGE_TEST" event using the [`Braze SDK`](https://www.braze.com/docs/developer_guide/home)
- This event will trigger a push notification from Braze containing a new content card

### 2. Push Notification Handling

- Complete the implementation of [`PushNotificationService`](src/app/shared/services/push-notification.service.ts)
  - Implement the TODO in `pushNotificationReceived` listener to check if notification is from Braze (type === 'inbox' in extras) and refetch content cards from Braze

### 3. Inbox Implementation

- Build the [`InboxComponent`](src/app/shared/components/inbox/inbox.component.ts) according to the [Figma design](https://www.figma.com/design/Xj5g90AVLs4HIycMGkF7Ef/Mama-Money-Frontend-Assessment---Inbox?node-id=0-1&m=dev&t=jph71z20fRpKQabb-1):
  - Implement the inbox UI following the provided design system
  - Update inbox cards array when new content is available
  - Implement card dismissal functionality with confirmation dialog
  - Handle deep linking for card URLs

## Getting Started

### Prerequisites

- **Node.js**: 22.22.3 (via nvm recommended)
- **Environment file**: A `.env` file is required in the project root with Braze API keys and FCM sender ID. This was provided with the assessment materials.

### Setup

```bash
# Install dependencies
npm install

# Build and run on Android
./build.sh
```

Or step-by-step:

```bash
source ~/.nvm/nvm.sh
nvm use 22.22.3
npx ionic build
npx cap run android
```

### Live reload

```bash
npm run start:android
```

## Notes

- A `.env` file has been supplied with credentials needed to access external resources
- You are only required to develop for Android
- The existing codebase includes guidance comments (Search codebase for TODO's), but you are encouraged to implement solutions that you believe best demonstrate your expertise
- Follow Angular best practices and maintain consistent code style

## Evaluation Criteria

- Code quality and organization
- Implementation of required features
- Understanding of Angular/Ionic patterns
- Integration with Braze SDK
- Mobile development best practices
- TypeScript Proficiency:
  - Demonstrates strong TypeScript fundamentals
  - Thoughtful use of interfaces, types, and enums
  - Accurately types services, components, and SDK interactions
  - Avoids unnecessary any and JavaScript-style patterns

## Additional Information

- [`Braze Documentation`](https://www.braze.com/docs/developer_guide/home)
- [`Braze Content Card Documentation`](https://www.braze.com/docs/user_guide/message_building_by_channel/content_cards/about/#use-cases)
- [`Ionic Documentation`](https://ionicframework.com/docs)

## Submission

Please submit your completed assessment as a Git repository with clear commit history showing your implementation process.

---

## Implementation summary

### Architecture

| Layer | Implementation |
|-------|---------------|
| **Splash screen** | HTML overlay in `index.html` with CSS background. Fades out after 2s via `ngOnInit`. Android 12+ system splash suppressed via theme override (`values-v31/styles.xml`). No native plugin needed. |
| **Event trigger** | `HomePage.sendInboxTestEvent()` → `BrazePlugin.logCustomEvent('INBOX_MESSAGE_TEST')` + `requestImmediateDataFlush()` |
| **Push handling** | `PushNotificationService` listens for both `pushNotificationReceived` (foreground) and `pushNotificationActionPerformed` (tray tap). Parses `ab_cd` from payload for instant card display without server call. |
| **State management** | `InboxStateService` with Angular signals (`cards`, `loading`, `unreadCount`). Tracks dismissals and viewed state client-side via `Set`s to prevent reappearance after re-fetch. |
| **Inbox UI** | `InboxComponent` as an Ionic modal with lazy loading. Pull-to-refresh, loading/empty states, dismiss confirmation, deep link navigation. SCSS fits within the 2kb style budget. |
| **Unread indicator** | `InboxButtonComponent` with `computed` from `unreadCount`. Anime.js shake animation triggered via `effect()` when new cards arrive. |

### Key design decisions

- **Card data from push payload**: The `ab_cd` field in the Braze push notification contains the content card data. Parsing it directly avoids an extra server call and eliminates the race condition between push arrival and card availability.
- **Web-layer splash**: Android 12+ forces a system SplashScreen API that doesn't support full-screen images. An HTML overlay in `index.html` bypasses this limitation completely.
- **Client-side dismissed/viewed tracking**: Braze doesn't persist these states locally. Without tracking, dismissed cards reappear on re-fetch and viewed cards lose their read state.
