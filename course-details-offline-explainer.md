# Course Details Offline Support

This document explains how the Course Details page keeps useful information available when the app is offline.

The goal is simple: after a lecturer or admin has opened a course while online, the app should still be able to show that course's main information later when the device has no internet.

## What We Cached

The Course Details page depends on a few different data sources:

- course details
- course timetable/schedule
- assigned lecturers
- enrolled students
- class records used to detect recorded/missed/pending sessions

Instead of only relying on live Appwrite calls, we now save successful online responses into local cache. When the device is offline, the helper functions return the cached version.

The cache helper lives here:

```ts
// src/lib/localCache/offlineCache.ts
export const readCache = <T>(key: string): CacheEnvelope<T> | null => {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(keyFor(key));
    if (!raw) return null;
    return JSON.parse(raw) as CacheEnvelope<T>;
  } catch {
    return null;
  }
};

export const writeCache = <T>(key: string, value: T) => {
  if (!isStorageAvailable()) return;

  try {
    const payload: CacheEnvelope<T> = {
      value,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(keyFor(key), JSON.stringify(payload));
  } catch {
    // Ignore storage quota and serialization issues.
  }
};
```

The cache uses `localStorage`, with keys prefixed internally by `kora-cache:`.

## Course List Cache

When the course list is fetched online, the app now caches:

- the full course list
- each individual course detail

That second part matters because it lets a user open a course details page offline later, even if the course detail endpoint cannot be reached.

```ts
// src/lib/apis/courses/courses.ts
const coursesWithSchedule = coursesResponse.rows.map(course => ({
  ...course,
  schedule: timetableResponse.rows.filter(slot => slot.course === course.$id)
}));

writeCache(cacheKey, coursesWithSchedule);
coursesWithSchedule.forEach((course: any) => {
  if (course.$id) writeCache(`courses:detail:${course.$id}`, course);
});
```

So when `getCourses()` succeeds, it prepares Course Details for offline use too.

## Course Detail Cache

`getCourseById()` now supports both read and write caching.

When offline, it tries to read:

```ts
const cacheKey = `courses:detail:${courseId}`;

if (isOffline()) {
  const cached = readCache<any>(cacheKey);
  return cached?.value || null;
}
```

When online, it fetches the course and timetable, then writes that full object into cache:

```ts
const courseWithSchedule = {
  ...course,
  schedule: timetableResponse.rows,
};

writeCache(cacheKey, courseWithSchedule);
return courseWithSchedule;
```

If the live request fails, it still attempts to return cached data:

```ts
catch (error) {
  const cached = readCache<any>(cacheKey);
  if (cached) return cached.value;
  console.log(`Error getting course by id: ${error}`);
  throw error;
}
```

This means Course Details can survive temporary network failure as long as the course was cached earlier.

## Lecturer Cache

Course Details also needs institution users so it can resolve assigned lecturers.

That helper was already cache-aware:

```ts
// src/lib/apis/auth/getInstitutionUsers.ts
if (isOffline()) {
  const cached = readCache<any[]>(cacheKey);
  return cached?.value || [];
}

const response = await databases.listRows(
  databaseId,
  userTableId,
  [Query.limit(200)]
);

writeCache(cacheKey, response.rows);
return response.rows;
```

This allows `CourseDetails.tsx` to keep showing assigned teacher names offline if users were previously loaded.

## Enrolled Students Cache

The students tab uses `getStudentsInCourse(courseId)`.

That helper caches the enrolled students per course:

```ts
// src/lib/apis/students/students.ts
const cacheKey = `students:course:${courseId}`;

if (isOffline()) {
  const cached = readCache<any[]>(cacheKey);
  return cached?.value || [];
}
```

After fetching enrollment rows and student records online, it writes the result:

```ts
writeCache(cacheKey, enrolledStudents);
return enrolledStudents;
```

So the students tab works offline after that course's students have been opened online at least once.

## Class Records Cache

Recent Sessions and Attendance History need class records to know whether a past class was:

- `RECORDED`
- `MISSED`
- `PENDING`

We added caching to `getClassRecordsForCourse()`.

```ts
// src/lib/apis/courses/classes.ts
export const getClassRecordsForCourse = async (course: string) => {
  const cacheKey = `classes:course:${course}`;

  try {
    if (isOffline()) {
      const cached = readCache<ClassRecord[]>(cacheKey);
      return cached?.value || [];
    }

    const response = await databases.listRows(
      import.meta.env.VITE_APPWRITE_DATABASE_ID,
      import.meta.env.VITE_APPWRITE_CLASSES_TABLE_ID,
      [
        Query.equal('course', course),
        Query.limit(200),
      ]
    );

    const records = response.rows as unknown as ClassRecord[];
    writeCache(cacheKey, records);
    return records;
  } catch (error) {
    const cached = readCache<ClassRecord[]>(cacheKey);
    if (cached) return cached.value;
    throw error;
  }
};
```

Because `findExistingClassInstances()` calls `getClassRecordsForCourse()`, it automatically benefits from the cache:

```ts
export const findExistingClassInstances = async (course: string, instances: ClassInstance[]) => {
  const classRecords = await getClassRecordsForCourse(course);
  const existingKeys = new Set(classRecords.map(recordKey));
  return instances.filter((instance) => existingKeys.has(instanceKey(instance)));
};
```

## Updating Cache After Creating Class Records

When a class record is created online, we also append it to the cached class records for that course.

```ts
const cacheKey = `classes:course:${data.course}`;
const cached = readCache<ClassRecord[]>(cacheKey);
if (cached) {
  writeCache(cacheKey, [...cached.value, record as unknown as ClassRecord]);
}
```

That keeps the cache fresher after attendance/class records are created.

## Course Details Page Behavior

The Course Details page still calls the same helpers:

```ts
Promise.all([
  getCourseById(id),
  getInstitutionUsers(),
])
```

The important change is that these helpers now decide whether to return live data or cached data.

That keeps the page code cleaner. The page does not need to know too much about storage.

## Live Session and Upcoming Classes

The `LiveSessionCard` receives the course schedule:

```tsx
<LiveSessionCard
  session={currentSession}
  scheduleRows={course.schedule}
  className="lg:col-span-5"
  onTakeAttendance={() => {
    if (currentSession) {
      setActiveTab('attendance');
      setSelectedSession({
        date: currentSession.date,
        title: `${currentSession.start} - ${currentSession.end}`,
      });
    }
  }}
/>
```

If a session is live, the card shows the live design with the red glow and the `Take Attendance` button.

If no session is live, it shows the upcoming classes left for the rest of the week using the cached schedule.

```ts
const upcomingWeekClasses = (Array.isArray(scheduleRows) ? scheduleRows : [])
  .map((slot: any) => {
    const dayIndex = typeof slot.day === 'number'
      ? slot.day
      : (typeof slot.day === 'string' && /^\d+$/.test(slot.day))
        ? Number(slot.day)
        : WEEKLY_DAYS.findIndex((name) => name.toLowerCase() === String(slot.day).toLowerCase());

    if (dayIndex < 0 || dayIndex > 6) return null;

    return {
      ...slot,
      dayIndex,
      active: slot.active === 'True' || slot.active === true,
      start: slot.start || '00:00',
      end: slot.end || '00:00',
    };
  })
  .filter((slot: any) => slot && slot.active && slot.dayIndex >= today)
  .filter((slot: any) => {
    if (slot.dayIndex !== today) return true;
    return parseTimeToMinutes(slot.end) > currentMinutes;
  });
```

This is why the live/upcoming panel can still work offline if `course.schedule` was cached earlier.

## Current Offline Limitations

This is cache-based offline support, not full offline synchronization yet.

Important limits:

- The user must open the course online at least once before the detail page is available offline.
- The students tab must be opened online once before those enrolled students are available offline.
- Cached data may be stale until the app reconnects and fetches fresh data.
- Writes like editing course details still require online backend access.
- Attendance syncing still needs the dedicated offline queue to be fully connected to the attendance-taking flow.

## Summary

The Course Details page now keeps its important read-only data available offline by caching successful online API responses.

The main pattern is:

1. If offline, read cached data.
2. If online, fetch fresh data.
3. After a successful fetch, write the result to cache.
4. If a network request fails, fall back to cache before showing an error.

This gives us a practical offline experience now, while leaving room for a stronger IndexedDB-backed sync system later.
