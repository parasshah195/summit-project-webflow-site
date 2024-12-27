import type { EmptyResponseData, QueryParams } from './geolocationQueryTypes';
import QueryAPI from './query';

// Default market - "Other"
export const DEFAULT_MARKET_NAME = 'Other';
export const DEFAULT_MARKET_NICKNAME = 'OTH';
export const DEFAULT_MARKET_ID = 4;

export class GeolocationQuery extends QueryAPI {
  API_ENDPOINT = '/geolocation';
  API_BODY: QueryParams;

  constructor(apiBody?: QueryParams) {
    super();

    if (apiBody) {
      this.API_BODY = apiBody;
    } else {
      this.API_BODY = {
        type: 'ip',
      };
    }
  }

  /**
   * Returns the default Geolocation market
   * Currently - "Other"
   */
  public emptyResponse(): EmptyResponseData {
    return {
      market: DEFAULT_MARKET_NAME,
      market_nickname: DEFAULT_MARKET_NICKNAME,
      market_id: DEFAULT_MARKET_ID,
      city_name: null,
      state_name: null,
    };
  }
}

export default GeolocationQuery;
