# CourseDetails Edit Schedule Plan

## Goal
Add the weekly schedule editor from `src/pages/AddCourse.tsx` into the `Edit Details` modal in `src/pages/CourseDetails.tsx`.

This must account for the fact that course schedule data is stored in a separate timetable table, not inside the main course row.

## What to change

1. Add schedule UI to the edit modal
   - Copy the weekly schedule card pattern from `AddCourse.tsx`
   - Include day toggles and start/end time inputs
   - Keep the same schedule state and helper logic (`schedule`, `toggleDay`, `updateTime`, `syncScheduleToState`)
   - Prefer keeping active schedule entries only for save operations

2. Initialize edit modal schedule state from the loaded course
   - Use `course.schedule` returned by `getCourseById()`
   - Map existing timetable rows into the modal state
   - Fall back to default weekly slots if none exist

3. Add course timetable persistence APIs
   - Extend `src/lib/apis/courses/courses.ts`
   - Add `deleteCourseTimetable(courseId)` or `replaceCourseTimetable(courseId, schedule)`
   - Use `createTimetable(courseId, slot)` for each active schedule item
   - Keep `updateCourse()` for title/code/venue/unit/teachers only

4. Update save flow in `CourseDetails.tsx`
   - Save course metadata via `updateCourse(courseId, {...})`
   - Then save timetable data through the new timetable API
   - Refresh local `course` state after successful save

5. Keep current admin UX behavior
   - Only admin can open the edit modal
   - The schedule editor should only appear inside that modal
   - Existing page schedule card can continue to render `course.schedule`

## Validation

- Ensure the modal still opens and closes normally
- Ensure existing course fields save correctly
- Ensure new schedule rows persist to the timetable table
- Ensure `course.schedule` remains available for display after save

## Questions before implementation

- Should edits delete all existing timetable rows and recreate them?
- Do we want to preserve inactive rows in the timetable table, or only store active schedule slots?
- Should the day labels use full names like `Monday` / `Tuesday` or numeric day indexes only?
