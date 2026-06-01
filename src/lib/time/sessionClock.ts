const DEFAULT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const getAppTimeZone = () => {
  return (import.meta.env.VITE_APP_TIMEZONE as string | undefined) || DEFAULT_TIME_ZONE;
};

export const getZonedDateParts = (date = new Date(), timeZone = getAppTimeZone()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value || '';

  return {
    weekday: get('weekday'),
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
  };
};

export const getZonedDayIndex = (date = new Date(), timeZone = getAppTimeZone()) => {
  const weekday = getZonedDateParts(date, timeZone).weekday;
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.findIndex((day) => day === weekday);
};

export const getZonedDateIso = (date = new Date(), timeZone = getAppTimeZone()) => {
  const parts = getZonedDateParts(date, timeZone);
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
};

export const getZonedCurrentMinutes = (date = new Date(), timeZone = getAppTimeZone()) => {
  const parts = getZonedDateParts(date, timeZone);
  return parts.hour * 60 + parts.minute;
};

export const getZonedCurrentTime = (date = new Date(), timeZone = getAppTimeZone()) => {
  const parts = getZonedDateParts(date, timeZone);
  return `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`;
};
