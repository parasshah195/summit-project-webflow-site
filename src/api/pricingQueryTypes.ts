/**
 * All the product types offered by us
 */
export type SubjectIDs = {
  1: 'Test Prep';
  2: 'Elementary/Middle School Academic';
  10: 'High School/AP/IB Academic';
  12: 'College Academic';
  13: 'Executive Function Coaching';
};

/**
 * Modes of instruction
 */
export type ModeTypes = {
  1: 'In-Person';
  2: 'Online';
};

/**
 * Instructor levels
 */
export type LevelTypes = {
  1: 'Preferred';
  2: 'Premium';
};

export type GradeTypes = Pick<SubjectIDs, 2 | 10 | 12>;

export type QueryParams = {
  /**
   * Market for which to query the rates
   */
  market_id: number;
  /**
   * Subject ID for which to query the rates
   */
  subject_id?: keyof SubjectIDs;
  /**
   * Instructor level ID for which to query the rates
   */
  instructor_level_id?: keyof LevelTypes;
  /**
   * Instruction mode ID for which to query the rates
   */
  instruction_mode_id?: keyof ModeTypes;
  /**
   * Minimum quantity; always zero now because the company has moved away from packages
   */
  minimum_quantity: 0;
};

/**
 * API Response individual rate object for the pricing query
 */
export interface ResponseRateObject {
  /**
   * USD Rate in string format
   */
  rate: string;
  /**
   * Minimum quantity; always zero now because the company has moved away from packages
   * Irrelevant property
   */
  minimum_quantity: 0;
  /**
   * Subject ID for which the rate is supplied
   */
  subject_id: keyof SubjectIDs;
  /**
   * Market ID for which the rate is supplied
   */
  market_id: number;
  /**
   * Instruction mode ID for which the rate is supplied
   */
  instruction_mode_id: keyof ModeTypes;
  /**
   * Instructor level ID for which the rate is supplied
   */
  instructor_level_id: keyof LevelTypes;
}

/**
 * Used for return type of the pricing query; to determine if the API query includes "rates" object in return
 */
export type APIResponseData = {
  rates: ResponseRateObject[];
};

/**
 * Empty response data type in case no data received from the pricing API
 */
export type EmptyResponseData = [];
