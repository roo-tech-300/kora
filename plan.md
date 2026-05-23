# Course Attendance & Timetable Plan

## Goal
Add a reliable offline-friendly attendance workflow that uses timetable definitions to compute actual class instances and tracks class occurrence status.

## Requirements
1. Add `endDate` to timetable rows so the system stops generating future class instances once the timetable has expired.
2. In `CourseDetails`, show all missed class instances derived from the timetable and not yet recorded in the `classes` table.
3. Missed classes must include individual calendar dates so users can identify which Monday/Friday/etc. was missed.
4. Rename buttons to user-friendly labels instead of technical `occurred=true/false` terminology.

## Implementation Plan

### 1. Data model updates
- Extend the timetable record to include:
  - `startDate` (the date the timetable begins)
  - `endDate` (the final date the timetable should be considered)
  - `day` / `weekday` to represent the weekly recurrence
  - `start` / `end` times for the class window
- Keep the existing `active` field if needed for schedule visibility, but the new date range controls instance generation.

### 2. Timetable instance generation logic
- Persist only the timetable metadata in the database:
  - `startDate`, `endDate`, `day` / `weekday`, `start`, `end`
- Generate individual class occurrences in the frontend using that timetable metadata.
- Add a frontend helper to compute all scheduled dates between `startDate` and the lesser of `today` or `endDate` for each weekly timetable row.
- For a timetable that only occurs on Monday, generate every Monday date from `startDate` through today (or `endDate`) and treat those as individual class candidates.
- Ensure no unnecessary future instances are created beyond `endDate`.

### 3. Missed classes in CourseDetails
- Use the course timetable plus `classes` table records to derive missed classes:
  - All scheduled class dates that should have happened up to today
  - Exclude any dates already recorded in the `classes` table
- Display these as individual missed class rows with full dates, e.g. `Monday, May 19`.
- Rename the UI section from `Recent Sessions` to `Missed Classes` and style it in red.

### 4. Upload / occurrence UI
- Add two user-friendly buttons in `CourseDetails`:
  - `Report Missed Class` (marks a scheduled instance as not occurred)
  - `Upload Attendance CSV` (opens a dummy CSV upload flow for a class that occurred)
- `Report Missed Class` should immediately create a `classes` row with `occurred: false` and the correct scheduled date.
- `Upload Attendance CSV` should open a front-end-only upload interaction for now.
- The actual class date should be computed from the timetable recurrence and the next unrecorded scheduled session.

### 5. Behavior details
- If today is Friday and class only happens on Monday:
  - compute next class date as the next Monday after `startDate` or today
  - do not create instances before `startDate`
- If the timetable includes multiple weekdays, compute all missing scheduled dates up to today.
- If there are no missed classes this week:
  - display a friendly message like `No lectures for the rest of the week` or `No missed classes yet` depending on context.

## Next steps
- Persist timetable metadata with `startDate`/`endDate`, but generate occurrences in the frontend.
- Add a frontend computation helper to build missed class dates from weekly recurrence.
- Wire the `CourseDetails` UI to derive missed sessions from timetable metadata and the `classes` table.
- Add friendly buttons and a dummy CSV upload modal.

## Notes
- The focus is on frontend flow first, with attendance upload implemented as a CSV mock experience.
- The key enhancement is using actual calendar dates, not just weekday names, for missed/made classes.
- `endDate` prevents generating irrelevant future instances and keeps the class history bounded.
