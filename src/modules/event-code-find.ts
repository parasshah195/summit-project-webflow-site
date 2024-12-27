/**
 * "Find by Event Code" component
 * Includes a form with an input to enter the event code - x-ref: `eventCodeInput`
 * Expected to redirect to the specific event code page in OneCanoe when a correct event code is entered
 *
 * Triggers a Webflow IX2 error animation on error - x-ref: `eventCodeErrorIXTrigger`
 *
 * Component Name - `eventCodeFind`
 */

/* eslint-disable @typescript-eslint/no-this-alias */
import EventQuery from '$api/eventQuery';
import type { APIResponse, QueryParams } from '$api/eventQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { ERROR_ANIMATION_TIMEOUT_IN_MS } from '$utils/inputErrorState';

interface EventCodeFindComponent {
  /**
   * Whether the API returned an error for the given event code
   */
  isError: boolean;
  /**
   * Whether the API is currently being queried
   */
  isLoading: boolean;
  /**
   * The event code entered by the user. Syncs with the input
   */
  eventCode: string;
  /**
   * Queries the API to check for an existing event for the given code
   * @returns void Redirects to the event page in case of a successful response
   */
  processQuery: () => Promise<void>;
}

window.addEventListener('alpine:init', () => {
  window.Alpine.data('eventCodeFind', function () {
    return {
      isError: false,
      isLoading: false,
      eventCode: '',

      async processQuery() {
        const apiBody: QueryParams = {
          category: ['all'],
          event_code: this.eventCode,
        };

        this.isLoading = true;

        const responseData = (await new EventQuery(apiBody).getQueryData()) as APIResponse[] | [];

        if (!responseData.length) {
          this.isLoading = false;
          this.isError = true;

          // Trigger the error shake animation on the input
          this.$refs.eventCodeErrorIXTrigger.click();

          setTimeout(() => {
            this.isError = false;
            this.eventCode = '';
            this.$refs.eventCodeInput.focus();
          }, ERROR_ANIMATION_TIMEOUT_IN_MS);
          return;
        }

        // Redirect to the event page
        window.location.href = responseData[0].event_page_url;
      },
    } as ApplerouthAlpineComponent<EventCodeFindComponent>;
  });
});
