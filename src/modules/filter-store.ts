/**
 * Defines a store for filters for reactive syncing with the filter components
 */

import type { DaysOfWeek, QueryParams } from '$api/eventQueryTypes';
import { FILTER_STORE_NAME } from '$utils/storeNames';

export interface FilterAlpineStore {
  testName: string;
  testTopics: QueryParams['topics'];
  is_online?: boolean | '';
  /**
   * Date after which to show the events
   */
  start_date: QueryParams['after'];
  /**
   * Date before which to show the events
   */
  end_date: QueryParams['before'];
  extended_time_available: QueryParams['extended_time_available'];
  test_date: QueryParams['test_date'] | undefined;
  days_of_week: DaysOfWeek[] | undefined;
}

window.Alpine.store(FILTER_STORE_NAME, {
  testName: '',
  testTopics: undefined,
  is_online: undefined,
  start_date: undefined,
  end_date: undefined,
  extended_time_available: false,
  test_date: undefined,
  days_of_week: undefined,
} as FilterAlpineStore);
