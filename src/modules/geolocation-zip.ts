/**
 * Component to enter ZIP code in a form (the Webflow component) and update geolocation
 *
 * Syncs with the `geolocation` store to update the location and respective modules sitewide
 *
 * Component Name - `geolocationZIP`
 */

/* eslint-disable @typescript-eslint/no-this-alias */

import GeolocationQuery from '$api/geolocationQuery';
import type { APIResponse, QueryParams } from '$api/geolocationQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { setGeoStoreSource } from '$utils/geoSourceGetSet';
import { ERROR_ANIMATION_TIMEOUT_IN_MS } from '$utils/inputErrorState';
import { GEOLOCATION_STORE_NAME } from '$utils/storeNames';
import { updateGeoStore } from '$utils/updateGeoStore';

interface GeolocationZIPComponent {
  /**
   * The ZIP code entered by the user. Syncs with the input
   */
  zipInput: string;
  /**
   * Whether the API is currently being queried
   */
  isLoading: boolean;
  /**
   * Whether the API returned an error for the given ZIP code
   */
  isError: boolean;
  /**
   * Returns the location name for the currently set geolocation
   * @returns string City name if available, else the market name
   */
  locationName: () => string;
  /**
   * Queries the API with the entered ZIP code and sets the appropriate geolocation, or triggers error
   */
  processQuery: () => Promise<void>;
}

document.addEventListener('alpine:init', () => {
  window.Alpine.data('geolocationZIP', function () {
    return {
      zipInput: '',

      isLoading: false,
      isError: false,

      locationName() {
        return this.$store[GEOLOCATION_STORE_NAME].location_name;
      },

      async processQuery() {
        const apiBody: QueryParams = {
          type: 'zip',
          zipcode: Number(this.zipInput),
        };

        this.isLoading = true;

        const responseData = (await new GeolocationQuery(apiBody).sendQuery()) as APIResponse;

        this.isLoading = false;

        if (!responseData || !responseData.market_id) {
          this.isError = true;

          // Trigger the error shake animation on the input
          this.$refs.zipErrorIXTrigger.click();

          setTimeout(() => {
            this.isError = false;
            this.zipInput = '';
            this.$refs.zipInputField.focus();
          }, ERROR_ANIMATION_TIMEOUT_IN_MS);

          console.warn('Geolocation query failed', { responseData });
          return;
        }

        setGeoStoreSource('zip');
        updateGeoStore(
          responseData.market,
          responseData.market_nickname,
          responseData.market_id,
          responseData.city_name,
          responseData.state_name
        );

        this.zipInput = '';

        // Close the location modal after successful location update
        this.$refs.modalClose.click();
      },
    } as ApplerouthAlpineComponent<GeolocationZIPComponent>;
  });
});
