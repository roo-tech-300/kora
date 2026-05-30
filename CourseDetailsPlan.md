# CourseDetails Attendance Verification Plan

## Goal
Ensure `CourseDetails` checks every scheduled past class instance against the `classes` table and displays the result in the Recent Sessions/Missed Classes section.

## Scope
- Keep existing `CourseDetails` schedule instance generation logic.
- Use a `classes.ts` helper to verify whether each date/start/end instance already exists as a class record.
- Stop truncating the past-instance list before display.
- Present all instances before today with recorded/missed/pending status.

## Assumptions
- `course.schedule` contains weekly timetable rows with `day`, `active`, `start`, `end`, `startDate`, and `endDate`.
- `classes` table records include `id`, `course`, `timetable` (the timetable row ID), `date`, and `occurred`.
- `occurred` is the flag that tells us whether a scheduled class actually happened or was canceled/missed.
- The frontend can generate past class dates from timetable metadata and compare them against persisted class records.

## Plan

1. Add/confirm helper in `src/lib/apis/courses/classes.ts`
   - `getClassRecordsForCourse(courseId)` to fetch all class rows for that course.
   - `findExistingClassRecords(courseId, instances)` to compare computed instances with saved class records.
   - Keep `findMissingClassInstances(...)` if needed later for missed-class creation.

2. In `src/pages/CourseDetails.tsx`
   - Import the helper from `classes.ts`.
   - Add state for past session statuses (instead of temporary local `acknowledgedClasses`).
   - On course load, compute all scheduled instances before today.
   - Map each instance to a course-specific object with `course`, `timetable`, and `date`.
   - Call `findExistingClassRecords(course.$id, instances)`.
   - Build a status map so each past instance becomes:
     - `RECORDED` if a matching class record exists and `occurred === true`,
     - `MISSED` if a matching record exists and `occurred === false`,
     - `PENDING` if no record exists.

3. Update `recentSessions` rendering
   - Use the full list of past instances, not `.slice(0, 3)`.
   - Sort by most recent first.
   - Display date, time window, attendance label, and status badge.

4. Keep UI semantics clear
   - Keep the existing card heading unless you want to rename it later.
   - Make sure status values are consistent with the `classes` record state.

## Notes
- This plan is intentionally limited to verification and display only.
- It does not create new attendance records or modify course scheduling logic until the verification flow is working.
- The `classes.ts` helper will serve as the source of truth for whether a scheduled instance already exists.
