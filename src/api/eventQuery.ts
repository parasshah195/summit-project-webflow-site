import type {
  APIResponse,
  APIResponseData,
  EmptyResponseData,
  QueryParams,
} from './eventQueryTypes';
import QueryAPI from './query';

export class EventQuery extends QueryAPI {
  API_ENDPOINT = '/events';
  API_BODY: QueryParams;
  DEFAULT_EVENT_LIMIT = 12;

  constructor(apiBody: QueryParams) {
    super();
    this.API_BODY = apiBody;

    this.setAPIDefaults();
  }

  /**
   * Sets the default values for the API
   * Currently, limits maximum number of events to 12
   */
  private setAPIDefaults(): void {
    if (!this.API_BODY.limit) {
      this.API_BODY.limit = this.DEFAULT_EVENT_LIMIT;
    }

    if (!this.API_BODY.start) {
      this.API_BODY.start = 0;
    }

    // if (!this.API_BODY.market) {
    //   this.API_BODY.market = 2;
    // }
  }

  /**
   * Overwrite of the query to respond events array within the `data` property
   */
  public async getQueryData(): Promise<APIResponse[] | EmptyResponseData | null> {
    const responseJSON = (await this.sendQuery()) as APIResponseData | null;

    if (!responseJSON) {
      return null;
    }

    const { data } = responseJSON;

    if (!data || !data.length) {
      console.warn(`Empty response from the query: ${this.API_BASE}${this.API_ENDPOINT}`);
      return this.emptyResponse();
    }

    return data;
  }

  /**
   * @returns Object Empty data object to mimic no results from the API query
   */
  protected emptyResponse(): EmptyResponseData {
    return [];
  }
}

export default EventQuery;
