/**
 * This file contains helper functions for formatting date, day, and time strings for use throughout events
 */

import type { APIResponse as EventsAPIResponse, DaysOfWeek } from '$api/eventQueryTypes';

import isMultiDayEvent from './isMultiDayEvent';

/**
 * Returns event date range along with days of week
 */
export function getEventDateRange(event: EventsAPIResponse) {
  if (isMultiDayEvent(event)) {
    return (
      dayjs(event.class_schedule?.first_session.starts_at).format('MMM Do') +
      ' - ' +
      dayjs(event.class_schedule?.final_session.starts_at).format('MMM Do') +
      ' (' +
      event.days_of_week.join(', ') +
      ')'
    );
  }

  return dayjs(event.starts_at).format('MMM Do') + ' (' + event.days_of_week.join(', ') + ')';
}

/**
 * Mapping API 3 letter day responses to full day names
 */
export const daysMap = {
  Mon: 'Mondays',
  Tue: 'Tuesdays',
  Wed: 'Wednesdays',
  Thu: 'Thursdays',
  Fri: 'Fridays',
  Sat: 'Saturdays',
  Sun: 'Sundays',
};

export type DateTimeRange = {
  /**
   * Format: 'August 12, 2023'
   */
  startDate: string;
  /**
   * Format: 'mm/dd/yy'
   */
  startDateShort: string;
  /**
   * Format: 'Aug 12'
   */
  startDateWithoutYear: string;
  /**
   * Format: 'Friday, August 12, 2023'
   */
  startDateWithWeekday: string;
  /**
   * Format: '9:00 AM'
   */
  startTime: string;
} & {
  /**
   * Format: 'August 12, 2023'
   */
  endDate?: string;
  /**
   * Format: 'mm/dd/yy'
   */
  endDateShort?: string;
  /**
   * Format: 'Aug 12'
   */
  endDateWithoutYear?: string;
  /**
   * Format: '9:00 AM'
   */
  endTime?: string;
  /**
   * Format: '9:00 AM - 12:00 PM (PST)'
   */
  timeRange?: string;
};

/**
 * @param start Start timestamp
 * @param end End timestamp
 * @param includeTimeZone Add timezone at the end of the time range
 * @returns Time string in the format "9:00 AM - 5:00PM (PDT)"
 */
export function getTimeRange(start: string, end?: string, includeTimeZone = true): string {
  const timeFormat = 'h:mm A';
  const startTime = dayjs(start).format(timeFormat);
  const endTime = dayjs(end).format(timeFormat);
  const timeZone = dayjs(start).format('z');

  if (!includeTimeZone) {
    return `${startTime} - ${endTime}`;
  }

  return `${startTime} - ${endTime} (${timeZone})`;
}

/**
 * Get days on which a group of events are available
 * @param {EventsAPIResponse[]} eventsList List of events to be processed
 */
export function getDays(eventsList: EventsAPIResponse[]): string {
  // Create a unique list of all days when the classes are available
  const daysSet: Set<DaysOfWeek> = new Set();

  const allDaysKeys = Object.keys(daysMap);

  eventsList.forEach((event) => {
    event.days_of_week.map((day) => daysSet.add(day));
  });

  // Convert it to an array for easier processing
  const daysListArray = [...daysSet];

  // Sort the days in order of `daysMap` object
  daysListArray.sort((a, b) => {
    return allDaysKeys.indexOf(a) - allDaysKeys.indexOf(b);
  });

  return `Weekly (${daysListArray.join(', ')})`;
}

/**
 * Get the day timings covered in a group of events
 * @param {EventsAPIResponse[]} eventsList List of events to be processed
 * @returns {string} Slash separated list of day times. E.g: "Mornings/Afternoons"
 */
export function getTimings(eventsList: EventsAPIResponse[]): string {
  const timeSet: Set<string> = new Set();

  const timeLabels = ['Mornings', 'Afternoons', 'Evenings', 'Nights'];

  eventsList.forEach((event) => {
    if (!event.starts_at) {
      return;
    }

    // Get hour from `event.starts_at` and return a string an appropriate day time from the `timeMap` array
    const hour = new Date(event.starts_at).getHours();
    if (hour >= 5 && hour < 12) {
      timeSet.add(timeLabels[0]);
    } else if (hour >= 12 && hour < 17) {
      timeSet.add(timeLabels[1]);
    } else if (hour >= 17 && hour < 21) {
      timeSet.add(timeLabels[2]);
    } else {
      timeSet.add(timeLabels[3]);
    }
  });

  // Sort the days in order of `timeMap` object
  const timeListArray = [...timeSet];
  timeListArray.sort((a, b) => {
    return timeLabels.indexOf(a) - timeLabels.indexOf(b);
  });

  // Return a slash separated time list of all tests present
  return timeListArray.join('/');
}

/**
 * Get the tests available in a group of events
 * @param {EventsAPIResponse[]} eventsList List of events to be processed
 * @returns {string} Comma separated list of tests. E.g: "ACT, SAT"
 */
export function getTestsList(eventsList: EventsAPIResponse[]): string {
  const testSet: Set<string> = new Set();

  eventsList.forEach((event) => {
    event.topics.map((topic) => testSet.add(topic));
  });

  // Return a comma separated list of all tests present
  return Array.from(testSet).join(', ');
}
