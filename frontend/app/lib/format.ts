export function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

// JS Date.getDay() index (Sunday = 0) for each backend DayOfWeek name.
const WEEKDAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

// Turn a LocalTime string ("17:00" or "17:00:00") into a gentle label ("5:00 pm").
function formatTimeOfDay(scheduledTime: string): string {
  const [hourPart, minutePart] = scheduledTime.split(":");
  const hour = Number(hourPart);
  const minute = Number(minutePart ?? "0");
  if (Number.isNaN(hour)) {
    return scheduledTime;
  }
  const period = hour < 12 ? "am" : "pm";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

// Capitalised weekday from the backend's uppercase name ("FRIDAY" → "Friday").
function titleCaseDay(dayOfWeek: string): string {
  return dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();
}

// Days from today until the next occurrence of the given weekday (0 = today).
function daysUntilWeekday(weekdayIndex: number, from = new Date()): number {
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  return (weekdayIndex - today.getDay() + 7) % 7;
}

// The next calendar date (today or later) that falls on the given weekday.
function nextDateForWeekday(weekdayIndex: number, from = new Date()): Date {
  const result = new Date(from);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() + daysUntilWeekday(weekdayIndex, from));
  return result;
}

// A gentle countdown label for the next session ("today" / "tomorrow" / "in N days").
function relativeDayLabel(daysAway: number): string {
  if (daysAway <= 0) return "today";
  if (daysAway === 1) return "tomorrow";
  return `in ${daysAway} days`;
}

export type SessionSchedule = {
  dayLabel: string; // "Friday"
  dateLabel: string; // "6 June"
  timeLabel: string; // "5:00 pm"
  relative: string; // "in 3 days"
  full: string; // "Friday, 6 June · 5:00 pm"
};

// Build friendly schedule labels for the dashboard "this week" card from the
// DB's dayOfWeek + scheduledTime. Returns null if the data isn't available.
export function formatSessionSchedule(
  dayOfWeek?: string,
  scheduledTime?: string,
): SessionSchedule | null {
  if (!dayOfWeek || !scheduledTime) {
    return null;
  }
  const weekdayIndex = WEEKDAY_INDEX[dayOfWeek.toUpperCase()];
  const dayLabel = titleCaseDay(dayOfWeek);
  const timeLabel = formatTimeOfDay(scheduledTime);

  if (weekdayIndex === undefined) {
    return {
      dayLabel,
      dateLabel: "",
      timeLabel,
      relative: "",
      full: `${dayLabel} · ${timeLabel}`,
    };
  }

  const daysAway = daysUntilWeekday(weekdayIndex);
  const date = nextDateForWeekday(weekdayIndex);
  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
  }).format(date);

  return {
    dayLabel,
    dateLabel,
    timeLabel,
    relative: relativeDayLabel(daysAway),
    full: `${dayLabel}, ${dateLabel} · ${timeLabel}`,
  };
}

export function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
