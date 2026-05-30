# Offline Attendance Tasks

This file tracks the work needed to make attendance usable offline and syncable when the device reconnects.

## Goal

Let a lecturer take attendance in class even without internet, store it locally, and sync it safely to the server later.

## Phase 1: Make the app work offline

- [ ] Add PWA support to the frontend.
- [ ] Register a service worker.
- [ ] Cache the app shell, JS, CSS, icons, and core routes.
- [ ] Make the app installable on mobile and desktop.
- [ ] Verify the app can reopen offline after the first online visit.

## Phase 2: Store attendance locally

- [ ] Choose IndexedDB for offline storage.
- [ ] Create a local attendance store.
- [ ] Save attendance records immediately when the teacher marks them.
- [ ] Add a local sync status field such as `pending`, `synced`, or `failed`.
- [ ] Keep a timestamp for every local attendance action.

## Phase 3: Add sync logic

- [ ] Create a queue for unsynced attendance records.
- [ ] Build a sync function that uploads queued records when internet returns.
- [ ] Trigger sync on app startup.
- [ ] Trigger sync when the browser fires the `online` event.
- [ ] Add a manual `Sync Now` action for backup.

## Phase 4: Prevent duplicates

- [ ] Define a unique attendance key.
- [ ] Use a stable combination like `courseId + sessionDate + studentId`.
- [ ] Make backend writes idempotent.
- [ ] Handle retry logic without creating duplicate records.

## Phase 5: Update the UI

- [ ] Show when attendance is saved offline.
- [ ] Show when records are waiting to sync.
- [ ] Show when sync succeeds.
- [ ] Show when sync fails.
- [ ] Add retry feedback for failed uploads.

## Phase 6: Backend support

- [ ] Add or confirm an attendance upload endpoint.
- [ ] Make the endpoint accept batch attendance uploads.
- [ ] Make sure the endpoint can safely receive the same record more than once.
- [ ] Return clear success and failure responses for each record.

## Phase 7: Test the full flow

- [ ] Open the app online and let it cache.
- [ ] Turn on airplane mode.
- [ ] Mark attendance offline.
- [ ] Close and reopen the app offline.
- [ ] Reconnect to the internet.
- [ ] Confirm queued attendance syncs correctly.
- [ ] Confirm duplicate records are not created.

## Phase 8: Deploy and verify

- [ ] Confirm the PWA build works on Vercel.
- [ ] Test offline behavior in production mode, not only locally.
- [ ] Verify icons, caching, and route loading after deployment.

## Notes

- The first app visit still needs internet.
- Offline use depends on the app being cached before class.
- Attendance should always be written locally first, then synced later.
