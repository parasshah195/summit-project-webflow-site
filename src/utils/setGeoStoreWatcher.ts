import type { ApplerouthAlpineComponent } from '$types/alpine-component';
import { GEOLOCATION_STORE_NAME } from '$utils/storeNames';

interface OverrideOptions {
  /**
   * Whether `apiBody.market` property should be updated with the new market ID
   */
  autoUpdateMarket: boolean;
}

/**
 * Watches the geolocation store and updates the `apiBody.market` value by default
 *
 * @param {object} alpineComponentContext Alpine component context `this`
 * @param {Function} callbackFn Optional callback function to execute on change of the geolocation store
 * @param {object} options Optional options override
 */
export const setGeoStoreWatcher = (
  alpineComponentContext: ApplerouthAlpineComponent,
  callbackFn?: (newValue?: any) => unknown,
  options?: OverrideOptions
) => {
  alpineComponentContext.$watch(`$store.${GEOLOCATION_STORE_NAME}.market_id`, (value: any) => {
    // if the component is not in the DOM, don't process further
    if (!document.body.contains(alpineComponentContext.$root)) {
      return;
    }

    if (!options || options.autoUpdateMarket) {
      alpineComponentContext.apiBody.market = value;
    }

    callbackFn && callbackFn(value);
  });
};
