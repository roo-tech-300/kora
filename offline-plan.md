# Offline Plan for Kora

## Goal

Make the app clearly show when it is offline, keep the courses section usable offline, and avoid empty states like "No students" when the network is unavailable.

## What We Want

- A red offline indicator that shows immediately when the app loses connection.
- A modal that tells the user they are offline but that the courses section still works.
- A button in that modal that takes the user to Courses, similar to a "go to downloads" action.
- Offline support for the data the courses section depends on.
- Cached helper data so the app can still show useful course information offline.

## Step 1: Detect Offline State Globally

- Add a global online/offline listener.
- Store the connection state in a shared hook or context.
- Show a red banner or toast-style indicator whenever the app is offline.
- Make the indicator appear immediately on app load if the device is already offline.

## Step 2: Show an Offline Modal

- Open a modal the first time the app detects offline mode.
- Message: "You are offline, but the courses section still works."
- Add a clear action button: "Go to Courses".
- Make the modal dismissible, but keep the red offline indicator visible.

## Step 3: Redirect Users to Courses

- Make the modal button navigate to the Courses page.
- Prefer the teacher/admin course landing screen depending on the current role.
- Keep the modal behavior simple so the user can recover quickly when offline.

## Step 4: Cache Course Data Locally

- Save the result of course-related helper calls into local storage or IndexedDB.
- Cache the data that the Courses section needs to render:
  - courses
  - schedules/timetables
  - lecturers
  - students
  - course details
- Add timestamps to cached entries so we know when they were last refreshed.

## Step 5: Make Helpers Offline-Aware

- Update course helpers so they first read from local cache when offline.
- If online, fetch from the server and update the cache.
- If offline and cache exists, return cached data instead of empty arrays.
- If offline and cache does not exist, show a helpful offline fallback state.

## Step 6: Prevent Empty UI States

- Replace empty states like "No students" with offline-aware messaging.
- Show cached course/student data if available.
- If data is missing and the app is offline, show "Offline data not available yet" instead of pretending the data is empty.

## Step 7: Persist the Most Important Data

- Decide which data must always be cached for offline mode.
- Good first targets:
  - course list
  - assigned courses
  - teachers assigned to each course
  - timetable/schedule rows
  - student lists for each course
- Save the data after every successful online fetch.

## Step 8: Sync Data Back Online

- Refresh cached course data whenever the device reconnects.
- Let the user manually refresh when online.
- Keep cached data in sync with the backend so offline and online views match as closely as possible.

## Step 9: Add Clear UI States

- Online state: normal UI.
- Offline state: red indicator plus modal on first detect.
- Cached offline state: show existing data from local cache.
- Missing offline data state: show a clear fallback note.

## Step 10: Test the Offline Flow

- Open the app online once.
- Let the course data cache.
- Turn off internet.
- Reload the app.
- Confirm the red offline indicator appears.
- Confirm the offline modal appears.
- Confirm the Courses page still shows cached data.
- Confirm the app does not display misleading empty states.

## Implementation Order

1. Add a global offline detector and indicator.
2. Add the offline modal with a "Go to Courses" button.
3. Add local caching for course helper data.
4. Make helper functions return cached data when offline.
5. Update empty states to respect offline mode.
6. Test the flow end to end.

## Notes

- The app should never pretend that offline data is the same as live data.
- The UI should always make it obvious whether data is cached or fresh.
- The first online visit is still required before the app can cache anything useful.
