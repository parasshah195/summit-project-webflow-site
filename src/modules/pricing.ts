/**
 * General pricing module for the buy flow (`/buy/...` pages).
 * Considers different potential options and adjusts the viewable content accordingly.
 *
 * Test prep options include - Private Tutoring, Small Group Classes, and Self-Paced Online Courses
 *
 * Allows for adjustable predefined method steps for a checkout flow between Tutor Type and Mode.
 *
 * Component name - `pricing`
 *
 * Individual Steps for the flow required to be overwritten on the frontend using `x-init` attribute. This includes:
 * - `step` property of each type (currently - mode, level, method, grade)
 * - `flowSteps` involved in a given checkout flow. Defaults to Test Prep flow with `method, level, mode`
 *
 * On the frontend, some parts of components can be hidden using `x-show` and some with `x-if`
 * Reasons for using `x-show` over `x-if`:
 *  1. to access `x-ref` DOM elements of those parts even when their parents are hidden
 *  2. to not initialize those parts again when they're shown
 *  3. to allow the use of Webflow interactions on elements (like modals) without having to re-initialize the IX2 functionality everytime
 */

import { restartWebflow } from '@finsweet/ts-utils';

import PricingQuery from '$api/pricingQuery';
import type { APIResponse as EventAPIResponse } from '$api/eventQueryTypes';
import type {
  GradeTypes,
  LevelTypes,
  ModeTypes,
  QueryParams,
  ResponseRateObject,
  SubjectIDs,
} from '$api/pricingQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { getAnchorScrollOffset } from '$utils/getAnchorScrollOffset';
import {
  getAllQueryParams,
  getQueryParam,
  removeAllQueryParams,
  setQueryParam,
} from '$utils/queryParamOps';

interface TutoringBuyLink extends URL {
  searchParams: TutoringBuyLinkParams;
}

interface TutoringBuyLinkParams extends URLSearchParams {
  hours?: 0;
  instruction_mode_id?: number;
  subject_id?: number;
  instructor_level_id?: number;
  market_id?: number;
  topics?: string[];
  event_code?: string;
}

export interface PrivateTutoringOptions {
  method?: string;
  mode?: string;
  level?: string;
}

type StepOptions = keyof PrivateTutoringOptions | 'grade';

export interface TestPrepGroupClassEvent {
  name?: string;
  location?: string;
  date?: string;
  time?: string;
  event_code?: string;
  prepares_for?: string;
  address?: string;
}

/**
 * Properties of each pricing flow option
 * Generic T is for passing default ID type
 */
interface StepOptionProps<T = number> {
  id: T | undefined;
  name: string | undefined;
  step: number;
}

interface PricingComponent {
  checkoutBaseURL: string;
  checkoutLink: TutoringBuyLink | undefined;
  price: number | null;
  /**
   * Test name of the buy flow. E.g: "SAT". Set from the frontend
   */
  testName: string | undefined;
  subject: keyof SubjectIDs | undefined;
  method: StepOptionProps;
  level: StepOptionProps<keyof LevelTypes>;
  mode: StepOptionProps<keyof ModeTypes>;
  grade: StepOptionProps<keyof GradeTypes>;
  flowSteps: Array<StepOptions>;
  /**
   * Whether the pricing is to be fetched from the pricing API
   */
  isRatesPricing: boolean;
  groupClass: TestPrepGroupClassEvent;
  selfPacedCourse: {
    id: number | undefined;
    name: string | undefined;
  };
  topic: number;
  /**
   * Alternative for test prep group class query when multiple topics exist and no topic is set for checkout
   */
  eventTopics: EventAPIResponse['topics'];
  /**
   * Hours of tutoring. Fixed to 1 with the new company decision to move away from packages
   */
  hours: 0;
  /**
   * The pricing API query parameters
   */
  apiBody: QueryParams;
  /**
   * Rates returned from the API
   */
  rates: ResponseRateObject[] | [];
  /**
   * Total steps in the checkout flow. Including the last pricing part
   */
  totalSteps: number;
  /**
   * Current active step number in the checkout flow. Starts from 1
   */
  currentStep: number;
  /**
   * Checks if any offline rates available for the test prep
   */
  isOfflineModeAvailable: boolean;
  areRatesAvailable: boolean;
  isLoading: boolean;
  isQueryError: boolean;
  /**
   * Whether the Affirm EMI script is loaded
   */
  isAffirmLoaded: boolean;
  init(): void;
  getRates(): void;
  setInitialQueryParams(): void;
  /**
   * Moves self-paced CMS course list to another div
   */
  moveSelfPacedCoursesCMS(): void;
  resetParams(): void;
  onStepOptionUpdate(optionType: StepOptions): void;
  onTestPrepMethodUpdate(): void;
  updatePriceFromAPI(): void;
  updateCheckoutLink(): void;
  getNextStep(): number;
  setMethod(): void;
  setGrade(): void;
  setLevel(): void;
  setMode(): void;
  setGroupClass(event: EventAPIResponse): void;
  clearGroupClass(): void;
  setSelfPacedCourse(): void;
  isTestPrep(): boolean;
  isTestPrepPrivateTutoring(): boolean;
  isTestPrepGroupClass(): boolean;
  isTestPrepSelfPacedCourse(): boolean;
  isAcademicTutoring(): boolean;
  isExecutiveFunctionCoaching(): boolean;
  /**
   * Re-initializes the Webflow animation system.
   * Used to allow modal functionality for dynamic content previously not present in the DOM
   */
  reinitWebflowIX2(): void;
  getNewCheckoutURL(): URL;
  getAffirmPricing(price: number): number;
}

window.addEventListener('alpine:init', () => {
  /**
   * Alpine component for the pricing page
   * Pass the subject and respective topic to the component via frontend attribute `x-data` value
   *
   * @param {number} subjectID The subject ID sent from the frontend
   * @param {number} topicID The topic ID sent from the frontend
   * @param {number} totalSteps The total number of steps available in the checkout
   */
  window.Alpine.data(
    'pricing',
    function (subjectID = undefined, topicID = undefined, totalSteps = 3) {
      const effectWatchers: unknown[] = [];
      const DEFAULT_LEVEL_ID = '1';
      const DEFAULT_MODE_ID = '1';
      /**
       * Used for a parameter in Enrolment checkout links
       */
      const DEFAULT_ENROLMENT_FEE_PRODUCT_ID = '166';

      return {
        checkoutBaseURL: 'https://applerouth.onecanoe.com/registration/create/',
        checkoutLink: undefined,
        price: null,

        testName: undefined,

        subject: subjectID,

        method: {
          id: undefined,
          name: undefined,
          step: 1,
        },

        grade: {
          id: undefined,
          name: undefined,
          step: 1,
        },

        level: {
          id: undefined,
          name: undefined,
          step: 2,
        },
        mode: {
          id: undefined,
          name: undefined,
          step: 3,
        },

        flowSteps: ['mode', 'level', 'method'],

        isRatesPricing: true,

        groupClass: {
          name: undefined,
          location: undefined,
          date: undefined,
          time: undefined,
          event_code: undefined,
          days: undefined,
          first_practice_test: undefined,
          prepares_for: undefined,
        },

        selfPacedCourse: {
          id: undefined,
          name: undefined,
        },

        topic: topicID,
        eventTopics: [],
        hours: 0,

        rates: [],
        apiBody: {
          minimum_quantity: 0,
        },

        // steps
        totalSteps: totalSteps,
        currentStep: 1,

        isOfflineModeAvailable: true,

        // view states
        areRatesAvailable: true,
        isLoading: false,
        isQueryError: false,

        isAffirmLoaded: true,

        init() {
          this.currentStep = 1; // reset current step on initialization

          if (this.isTestPrep()) {
            this.$watch('method.id', () => {
              this.onStepOptionUpdate('method');
            });

            this.moveSelfPacedCoursesCMS();
          }

          this.$watch('grade.id', () => {
            this.onStepOptionUpdate('grade');
          });

          this.$watch('level.id', () => {
            this.onStepOptionUpdate('level');
          });

          this.$watch('mode.id', () => {
            this.onStepOptionUpdate('mode');
          });

          // update the respective steps from the query params
          this.$nextTick(() => {
            this.setInitialQueryParams();
          });

          effectWatchers.push(
            window.Alpine.effect(() => {
              if (this.currentStep === this.totalSteps) {
                this.updateCheckoutLink();
              }
            })
          );

          effectWatchers.push(
            window.Alpine.effect(() => {
              if (this.currentStep === this.totalSteps) {
                // call triggers after last step condition is rendered on the frontend
                this.updatePriceFromAPI();
              }
            })
          );
        },

        destroy() {
          effectWatchers.forEach((effect: any) => {
            window.Alpine.release(effect);
          });
        },

        async getRates() {
          this.isLoading = true;

          const pricingData = (await new PricingQuery(this.apiBody).getQueryData()) as
            | ResponseRateObject[]
            | []
            | null;

          this.isLoading = false;

          if (!pricingData) {
            this.isQueryError = true;
            return;
          }
          if (!pricingData.length) {
            this.areRatesAvailable = false;
            return;
          }

          this.rates = pricingData;

          // when `mode = 1` (in-person)
          this.isOfflineModeAvailable = pricingData.find(
            (rateObj) => 1 === rateObj.instruction_mode_id
          )
            ? true
            : false;
        },

        setInitialQueryParams() {
          const params = getAllQueryParams();

          for (const param in params) {
            if (this.flowSteps.includes(param as StepOptions)) {
              const paramOption = param as StepOptions;
              // update the respective component property. e.g: `method.id = params.method`
              this[paramOption].id = parseInt(params[param]);
            } else {
              setQueryParam(param, null);
            }
          }
        },

        moveSelfPacedCoursesCMS() {
          const sourceEl: HTMLElement | null = this.$root.querySelector('[data-self-paced-cms]');
          const destinationEl: HTMLElement | null = this.$root.querySelector(
            '[data-self-paced-cms-dropzone]'
          );

          if (!sourceEl || !destinationEl) {
            console.warn(
              'Unable to find self-paced CMS source or destination dropzone.',
              'Use `data-self-paced-cms` attribute for Collection List Wrapper and `data-self-paced-cms-dropzone` attribute for destination div',
              { source: sourceEl, destination: destinationEl }
            );
            return;
          }

          const clonedSource = sourceEl.cloneNode(true);

          destinationEl.appendChild(clonedSource);
          sourceEl.remove();
        },

        resetParams() {
          setQueryParam('level', null);
          this.level.id = undefined;
          this.level.name = undefined;

          setQueryParam('mode', null);
          this.mode.id = undefined;
          this.mode.name = undefined;

          this.clearGroupClass();

          this.selfPacedCourse.id = undefined;

          if (
            (this.isTestPrep() && !this.method.id) ||
            (this.isAcademicTutoring() && !this.grade.id)
          ) {
            this.currentStep = 1;
          } else {
            this.currentStep = 2;
          }
        },

        // updates method, level, and mode name and param whenever ID changes
        onStepOptionUpdate(optionType) {
          // when ID is not set
          if (!this[optionType].id) {
            if ('method' === optionType || 'grade' === optionType) {
              removeAllQueryParams();
              this.currentStep = 1; // reset current step
            } else {
              setQueryParam(optionType, undefined);
              this.currentStep = this.getNextStep();
            }

            this[optionType].name = undefined;
            return;
          }

          if ('method' === optionType) {
            this.onTestPrepMethodUpdate();
          }

          if ('grade' === optionType) {
            this.subject = this.grade.id;
          }

          this[optionType].name =
            this.$refs[`${optionType}-${this[optionType].id}-text`]?.innerText || undefined;

          // update query param if not the same already
          if (this[optionType].id !== parseInt(getQueryParam(optionType))) {
            setQueryParam(optionType, this[optionType].id?.toString());
          }

          this.currentStep = this.getNextStep();
        },

        onTestPrepMethodUpdate() {
          switch (this.method.id) {
            case 1: // test prep
              this.isRatesPricing = true;
              this.totalSteps = 4;
              break;
            case 2: // small group
              this.isRatesPricing = false;
              this.totalSteps = 3;
              break;
            case 3: // self-paced course
              this.isRatesPricing = false;
              this.totalSteps = 3;
              break;
            default:
              this.isRatesPricing = true;
              this.totalSteps = 4;
              break;
          }
        },

        updatePriceFromAPI() {
          if (!this.isRatesPricing) {
            return;
          }

          if (!this.rates.length) {
            console.warn('Trying to update price before the rates being set from the API');
            return;
          }

          const levelPresent = this.flowSteps.includes('level') ? true : false;
          const modePresent = this.flowSteps.includes('mode') ? true : false;

          const price = this.rates.find((rateObj) => {
            let isMatch = false;

            const subjectCheck = rateObj.subject_id === this.subject;
            const levelCheck = levelPresent ? rateObj.instructor_level_id === this.level.id : true;
            const modeCheck = modePresent ? rateObj.instruction_mode_id === this.mode.id : true;

            if (subjectCheck && levelCheck && modeCheck) {
              isMatch = true;
            }

            return isMatch;
          })?.rate;

          if (!price) {
            console.warn('No price match found from the API');
            console.warn(
              'Subject',
              this.subject,
              'Mode',
              this.mode.id,
              'Level',
              this.level.id,
              'Rates',
              this.rates
            );
            return;
          }

          const priceNumber = parseInt(price);

          if (this.price === priceNumber) {
            return;
          }

          this.price = priceNumber;
        },

        updateCheckoutLink() {
          this.checkoutLink = this.getNewCheckoutURL();

          const subject = this.subject || 1;

          if (
            this.isTestPrepPrivateTutoring() ||
            this.isAcademicTutoring() ||
            this.isExecutiveFunctionCoaching()
          ) {
            const level = this.level.id || DEFAULT_LEVEL_ID;
            const mode = this.mode.id || DEFAULT_MODE_ID;
            this.checkoutLink.searchParams.set('hours', this.hours.toString());
            this.checkoutLink.searchParams.set('subject_id', subject.toString());
            this.checkoutLink.searchParams.set('instructor_level_id', level.toString());
            this.checkoutLink.searchParams.set('instruction_mode_id', mode.toString());
            this.checkoutLink.searchParams.set('fee_product_id', DEFAULT_ENROLMENT_FEE_PRODUCT_ID);

            if (this.topic) {
              this.checkoutLink.searchParams.set('topics[]', this.topic.toString());
            }
          }

          if (this.isTestPrepGroupClass()) {
            if (!this.groupClass.event_code) {
              return;
            }
            this.checkoutLink.searchParams.set('event_code', this.groupClass.event_code);
          }

          if (this.isTestPrepSelfPacedCourse()) {
            if (!this.selfPacedCourse.id) {
              return;
            }
            this.checkoutLink.searchParams.set('product_id', this.selfPacedCourse.id.toString());
          }
        },

        getNextStep() {
          let largestStep = 1;

          this.flowSteps.forEach((option) => {
            if (this[option].id && largestStep < this[option].step) {
              largestStep = this[option].step;
            } else if (!this[option].id && largestStep > this[option].step) {
              // if current step is not set, but the next step is set, revert back to the previous step
              largestStep = this[option].step - 1;
            }
          });

          if (largestStep >= this.totalSteps) {
            return totalSteps;
          }

          return largestStep + 1;
        },

        setMethod() {
          const methodID = this.$el.dataset.method;
          this.method.id = methodID ? parseInt(methodID) || undefined : undefined;
        },

        setGrade() {
          const gradeID = this.$el.dataset.grade;
          this.grade.id = gradeID
            ? (parseInt(gradeID) as keyof GradeTypes) || undefined
            : undefined;
        },

        setLevel() {
          const levelID = this.$el.dataset.level;
          this.level.id = levelID
            ? (parseInt(levelID) as keyof LevelTypes) || undefined
            : undefined;
        },

        setMode() {
          const modeID = this.$el.dataset.mode;
          this.mode.id = modeID ? (parseInt(modeID) as keyof ModeTypes) || undefined : undefined;

          // update price from here to avoid circular conditional dependency on frontend step+price check for enrolment block
          this.updatePriceFromAPI();
        },

        setGroupClass(event) {
          this.groupClass.name = this.$el.querySelector<HTMLElement>('[data-name]')?.innerText;
          this.groupClass.location =
            this.$el.querySelector<HTMLElement>('[data-location]')?.innerText;
          this.groupClass.date = this.$el.querySelector<HTMLElement>('[data-date]')?.innerText;
          this.groupClass.time = this.$el.querySelector<HTMLElement>('[data-time]')?.innerText;
          this.groupClass.prepares_for =
            this.$el.querySelector<HTMLElement>('[data-test-date]')?.innerText;
          this.groupClass.address =
            this.$el.querySelector<HTMLElement>('[data-address]')?.innerText;

          this.groupClass.event_code = event.event_code;

          this.price = parseInt(event.price);

          if (this.$refs?.groupClassScrollAnchor) {
            const scrollAnchorPos = getAnchorScrollOffset(this.$refs.groupClassScrollAnchor, 125);

            window.scrollTo({
              top: scrollAnchorPos,
              behavior: 'smooth',
            });
          }
        },

        clearGroupClass() {
          for (const key in this.groupClass) {
            if (this.groupClass.hasOwnProperty(key)) {
              this.groupClass[key as keyof TestPrepGroupClassEvent] = undefined;
            }
          }

          this.price = null;
          this.currentStep = 2;
        },

        setSelfPacedCourse() {
          const name = this.$el.querySelector<HTMLElement>('[data-name]')?.innerText;
          const price = this.$el.querySelector<HTMLElement>('[data-price]')?.innerText;
          const id = this.$el.getAttribute('data-product-id');

          if (!id || !price) {
            console.error('ID or price not found for the chosen self-paced course', this.$el);
            return;
          }

          this.selfPacedCourse.name = name;
          this.selfPacedCourse.id = parseInt(id);

          if (price) {
            this.price = parseInt(price);
          }

          this.currentStep += 1;
        },

        isTestPrep() {
          return 1 === this.subject;
        },

        isTestPrepPrivateTutoring() {
          return 1 === this.subject && 1 === this.method.id;
        },

        isTestPrepGroupClass() {
          return 1 === this.subject && 2 === this.method.id;
        },

        isTestPrepSelfPacedCourse() {
          return 1 === this.subject && 3 === this.method.id;
        },
        isAcademicTutoring() {
          return this.subject && [2, 10, 12].includes(this.subject);
        },
        isExecutiveFunctionCoaching() {
          return 13 === this.subject;
        },

        reinitWebflowIX2() {
          restartWebflow(['ix2']);
        },

        getNewCheckoutURL() {
          return new URL(this.checkoutBaseURL);
        },

        getAffirmPricing(price) {
          const decimalIntegratedPrice = price * 100;

          this.$nextTick(() => {
            try {
              affirm.ui.refresh();
            } catch (e) {
              this.isAffirmLoaded = false;
              console.error('Affirm UI Refresh failed after price update. Error stack:');
              console.error(e);
            }
          });

          return decimalIntegratedPrice;
        },
      } as ApplerouthAlpineComponent<PricingComponent>;
    }
  );
});
