/**
 * Used for return type of the query; to determine if the API query includes "data" object in return
 */
export type APIResponseData = {
  data: APIResponse[];
};

export type EmptyResponseData = [];

/**
 * Event query category types
 */
export type QueryParamsCategories = 'practice_test' | 'marketing_event' | 'class' | 'all';

/**
 * List of all days of the week in 3-letter format
 */
export type DaysOfWeek = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

/**
 * Query parameters for the event query
 * Defined as a type instead of interface to allow type-check mapping from the QueryAPI class
 */
export type QueryParams = {
  category: Array<QueryParamsCategories>; // The “all” option would query by all categories
  /**
   * The id of the market
   */
  market?: number;
  /**
   * ID of the event
   */
  id?: number;
  /**
   * Filters by partial match of name, used for search
   */
  name?: string;
  /**
   * Event code. E.g: “EVT83DD6”
   */
  event_code?: string | string[];
  /**
   * string will be the blog topic name (same in Webflow). Filters by blog topics
   */
  tags?: Array<string>;
  /**
   * The number of events sent at a time.
   * @default 12
   */
  limit?: number;
  /**
   * The starting event number for the query, used with limit for pagination. Counts from 0.
   * @default 0
   */
  start?: number;
  /**
   * ID of the tests this event belongs to. Eg: [134, 49] ("SAT", "ACT")
   */
  topics?: Array<number>;
  /**
   * Tests before this date
   */
  before?: Date;
  /**
   * Tests after this date.
   * @default Current timestamp
   */
  after?: Date;
  /**
   * Timezone string.
   * E.g: "GMT+0900", "+0900", "+09:00"
   */
  timezone?: string;
  /**
   * The “prepare for test date” date
   */
  test_date?: Date;
  /**
   * `true` for online, `false` for offline
   * for both, don't set the parameter
   */
  is_online?: boolean;
  extended_time_available?: boolean;
  /**
   * 3 letter day name Eg: [“Mon”, “Tue”]
   */
  days_of_week?: Array<string>;
  location_id?: number;
};

/**
 * Defines overwritable query param properties for the API
 */
export const QueryParamsProperties: (keyof QueryParams)[] = [
  'category',
  'market',
  'id',
  'name',
  'event_code',
  'tags',
  'limit',
  'start',
  'topics',
  'before',
  'after',
  'timezone',
  'test_date',
  'is_online',
  'extended_time_available',
  'days_of_week',
  'location_id',
];

/**
 * API Response for the event query
 */
export interface APIResponse {
  id: number;
  name: string;
  type: QueryParamsCategories;
  description: string;
  event_code: string;
  is_online: boolean;
  /**
   * The “prepare for test date” date
   */
  test_date?: Date | null;
  /**
   * The start timestamp of the event (with timezone). Null for on-demand tests
   */
  starts_at: string | null;
  /**
   * The end timestamp of the event (with timezone). Null for on-demand tests
   */
  ends_at: string | null;
  /**
   * Cost of the event, in USD
   */
  price: string;
  /**
   * Group class class schedule if available for the events
   */
  class_schedule?: null | {
    first_session: {
      starts_at: Date;
      ends_at: Date;
    };
    final_session: {
      starts_at: Date;
      ends_at: Date;
    };
    first_practice_test: {
      starts_at: Date;
      ends_at: Date;
    };
    final_practice_test: {
      starts_at: Date;
      ends_at: Date;
    };
    instructional_time: number;
    sessions_count: number;
  };
  /**
   * Blog tags
   */
  tags: Array<string>;
  /**
   * The market IDs where the event is accessible from
   */
  markets: Array<number>;
  /**
   * List of topics associated with this event
   */
  topics: Array<string>;
  /**
   * Days on which the event is available.
   * 3 letter weekday name. E.g: [“Mon”, “Tue”]
   */
  days_of_week: Array<DaysOfWeek>;
  address: string | null;
  /**
   * Presenters of the event. Only applies to webinars
   */
  presenters: Array<string> | null;
  location_id: number | null;
  location_name: string | null;
  /**
   * The event location's google maps URL
   */
  google_maps_url: string;
  extended_time_available: boolean | null;
  /**
   * OneCanoe event registration URL
   */
  event_page_url: string;
}
