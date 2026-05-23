# Add Course Page Enhancement Plan

## Goal
Update the `Add Course` page so the weekly schedule editor matches the `Edit Details` modal style in `CourseDetails`, add hover tooltip guidance for optional start/end dates, and ensure backend timetable APIs support `startDate` and `endDate`.

## Requirements
1. Make the `Weekly Schedule` UI in `src/pages/AddCourse.tsx` match the edit modal schedule UI in `src/pages/CourseDetails.tsx`.
2. Add tooltip help on the `Start Date` and `End Date` fields using the existing `Tooltip` component.
3. Confirm and keep the backend `createCourse`, `createTimetable`, and related timetable APIs ready to receive `startDate` and `endDate` values.

## Implementation Plan

### 1. UI parity with CourseDetails edit modal
- Review the schedule editor card style in `src/pages/CourseDetails.tsx`.
- Apply the same layout and design to the schedule rows in `src/pages/AddCourse.tsx`:
  - left-side day toggle button
  - right-side time entry cards
  - consistent border, background, and spacing
  - same `Badge` styling for active/off state
- Keep the row structure in `AddCourse` as a grid of schedule cards matching the edit modal.

### 2. Tooltip guidance for date inputs
- Reuse the `Tooltip` component from `src/components/Common.tsx`.
- Wrap each `Start Date` and `End Date` label/input with `Tooltip` so hover displays a short explanation.
- Suggested tooltip contents:
  - `Start Date (optional)` → "Optional first date for this weekly schedule. If empty, the next matching weekday is used."
  - `End Date (optional)` → "Optional last date for this weekly schedule. If empty, the timetable remains open until today."
- Ensure the tooltip uses the same hover styling as the admin dashboard session list.

### 3. Backend integration readiness
- Verify the following API support in `src/lib/apis/courses/courses.ts`:
  - `createCourse()` should accept schedule items with `startDate` and `endDate`
  - `createTimetable()` should store `startDate` and `endDate` fields on timetable rows
  - `replaceCourseTimetable()` should pass `startDate` and `endDate` when recreating timetable rows
- Confirm `weeklySchedule` state in `AddCourse` includes `startDate` and `endDate` on active slots.
- Ensure `handleSubmit()` sends the full schedule payload to `createCourse()`.

## Validation checklist
- [ ] `AddCourse` schedule cards visually match `CourseDetails` edit modal schedule cards.
- [ ] `Start Date` and `End Date` fields show tooltips on hover.
- [ ] Tooltips use the existing `Tooltip` component.
- [ ] `createCourse()` receives schedule objects with `startDate`/`endDate`.
- [ ] `createTimetable()` records the date values in the backend.
- [ ] Existing functionality (course create submit, schedule toggles, time inputs) still works.

## Notes
- `startDate` and `endDate` should remain optional in the UI.
- If either date is left blank, the frontend should calculate the appropriate date before sending the schedule row to the backend.
- The backend should receive actual dates, not empty strings, for rows where the frontend has computed them.
