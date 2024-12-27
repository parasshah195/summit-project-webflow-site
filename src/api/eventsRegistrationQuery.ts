import type {
  QueryStructure,
  ResponseStructure,
} from 'src/pages/national-practice-test/events-form-query';

import QueryAPI from './query';

export class EventRegistrationQuery extends QueryAPI {
  API_ENDPOINT = '/events-registration';
  API_BODY: QueryStructure;
  DEFAULT_EVENT_LIMIT = 12;

  constructor(apiBody: QueryStructure) {
    super();
    this.API_BODY = apiBody;
  }

  /**
   * Overwrite of the query to respond events array within the `data` property
   */
  public async getQueryData(): Promise<ResponseStructure | null> {
    const responseJSON = (await this.sendQuery()) as ResponseStructure | null;

    if (!responseJSON) {
      return null;
    }

    if (!responseJSON.event_codes || !responseJSON.event_codes.length) {
      console.warn(`Empty response from the query: ${this.API_BASE}${this.API_ENDPOINT}`);
      return this.emptyResponse();
    }

    return responseJSON;
  }

  /**
   * @returns Object Empty data object to mimic no results from the API query
   */
  protected emptyResponse(): null {
    return null;
  }
}

export default EventRegistrationQuery;
