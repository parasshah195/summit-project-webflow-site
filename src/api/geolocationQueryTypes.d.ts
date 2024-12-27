/**
 * Represents the query parameters used to fetch the geolocation area
 */
export type QueryParams = {
  /**
   * The type of parameter supplied to fetch the market name
   * Default is set as IP in the Query code
   *
   * Depending on the type of source, use the other parameters respectively
   */
  type: Sources;
} & (
  | {
      type: 'ip';
      /**
       * IP Address of the user
       * Optional. If not set, automatically considers the IP address of the browser query
       */
      ip?: string;
    }
  | {
      type: 'zip';
      /**
       * ZIP Code of the location
       */
      zipcode: number;
    }
  | {
      type: 'coord';
      /**
       * The coordinates of the location - latitude, longitude
       */
      coord: [number, number];
    }
);

/**
 * Represents the response from the geolocation API
 */
export interface APIResponse {
  /**
   * The market name
   */
  market: string;
  /**
   * The 3-letter market nickname
   */
  market_nickname: string;
  /**
   * The market ID
   */
  market_id: number;
  /**
   * The market city name
   */
  city_name: string | null;
  /**
   * The market state name
   */
  state_name: string | null;
}

export type Sources = 'zip' | 'coord' | 'ip';

export type StoreSources = Sources | '';

/**
 * Variable for mapping the `data` object of the API Response.
 * Used primarily to maintain consistency with the Events API response and the common query class
 */
export type APIResponseData = APIResponse;
/**
 * Empty response data object for the geolocation API, for the cases when the query fails
 */
export type EmptyResponseData = APIResponse;
