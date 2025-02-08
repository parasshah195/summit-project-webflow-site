import type {
  APIResponseData as EventsAPIResponseData,
  EmptyResponseData as EventsEmptyResponseData,
} from './eventQueryTypes';

type BaseAPIResponse = EventsAPIResponseData;
type BaseEmptyAPIResponse = EventsEmptyResponseData | null;

/**
 * Base class for querying Applerouth APIs
 */
abstract class QueryAPI {
  API_BASE = 'https://applerouth.onecanoe.com/api/public/v2';
  API_ENDPOINT?: string;
  abstract API_BODY?: Record<string, unknown>;

  /**
   *
   * @returns
   */
  public async sendQuery(): Promise<BaseAPIResponse | null> {
    let response: Response;
    try {
      response = await fetch(this.API_BASE + this.API_ENDPOINT, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.API_BODY),
      });
    } catch (error) {
      console.error(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`, error);
      return null;
    }

    if (!response.ok) {
      console.warn(`Error when sending query: ${this.API_BASE}${this.API_ENDPOINT}`);
      console.warn(response, response.statusText);

      return null;
    }

    const responseJSON: Promise<BaseAPIResponse> = await response.json();
    return responseJSON;
  }

  protected abstract emptyResponse?(): BaseEmptyAPIResponse;
}

export default QueryAPI;
