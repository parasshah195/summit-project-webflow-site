import type {
  APIResponseData,
  EmptyResponseData,
  QueryParams,
  ResponseRateObject,
} from './pricingQueryTypes';
import QueryAPI from './query';

export class PricingQuery extends QueryAPI {
  API_ENDPOINT = '/pricing';
  API_BODY: QueryParams;

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
    if (!this.API_BODY.minimum_quantity) {
      this.API_BODY.minimum_quantity = 0;
    }
  }

  /**
   * Overwrite of the query to respond events array within the `data` property
   */
  public async getQueryData(): Promise<ResponseRateObject[] | EmptyResponseData | null> {
    const responseJSON = (await this.sendQuery()) as APIResponseData | null;

    if (!responseJSON) {
      return null;
    }

    const { rates } = responseJSON;

    if (!rates || !rates.length) {
      console.warn(`Empty response from the query: ${this.API_BASE}${this.API_ENDPOINT}`);
      return this.emptyResponse();
    }

    return rates;
  }

  /**
   * @returns Object Empty data object to mimic no results from the API query
   */
  protected emptyResponse(): EmptyResponseData {
    return [];
  }
}

export default PricingQuery;
