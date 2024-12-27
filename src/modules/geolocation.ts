/**
 * Component to update geolocation initially on first load
 *
 * Initially sets the market to the location derived from IP
 * If the user accepts Geolocation access, then loads it from there
 *
 * Order of priority (in decreasing order) - 1. Manual ZIP Code entry, 2. Browser Geolocation Access, 3. IP Query
 *
 * Uses localstorage to sync the location across pages and visits
 *
 * Store Name - `geolocation`
 *
 * Functioning:
 * 1. Get the Geolocation - either via browser or IP
 * 2. Set the appropriate location in localstorage, which is used as the central location point, then sync across components via the store
 */

/* eslint-disable @typescript-eslint/no-this-alias */

import GeolocationQuery, {
  DEFAULT_MARKET_ID,
  DEFAULT_MARKET_NAME,
  DEFAULT_MARKET_NICKNAME,
} from '$api/geolocationQuery';
import type { APIResponse, QueryParams, Sources } from '$api/geolocationQueryTypes';
import { getGeoStoreSource, setGeoStoreSource } from '$utils/geoSourceGetSet';
import { GEOLOCATION_STORE_NAME } from '$utils/storeNames';
import { updateGeoStore } from '$utils/updateGeoStore';

export interface GeolocationAlpineStore extends APIResponse {
  /**
   * The source through which geolocation is currently set. Starts as empty string
   */
  geo_source: Sources | '';
  /**
   * The full location name
   */
  location_name: string | undefined;
}

document.addEventListener('alpine:init', () => {
  window.Alpine.store(GEOLOCATION_STORE_NAME, {
    geo_source: window.Alpine.$persist(''),
    market: window.Alpine.$persist(DEFAULT_MARKET_NAME),
    market_nickname: window.Alpine.$persist(DEFAULT_MARKET_NICKNAME),
    market_id: window.Alpine.$persist(DEFAULT_MARKET_ID),
    city_name: window.Alpine.$persist(DEFAULT_MARKET_NAME),
    state_name: window.Alpine.$persist(''),
    location_name: window.Alpine.$persist(DEFAULT_MARKET_NAME),

    init() {
      /**
       * Check CookieYes consent
       * @link https://www.cookieyes.com/documentation/retrieving-consent-data-using-api-getckyconsent/
       */
      if (window.getCkyConsent) {
        const consent = getCkyConsent();
        if (consent.categories.functional) {
          initLocation();
        } else {
          if ('ip' === getGeoStoreSource()) {
            removeLocation();
          }
        }
      }

      /**
       * Process when CookieYes consent is enabled
       */
      document.addEventListener('cookieyes_consent_update', (eventData) => {
        const data = eventData?.detail;
        console.debug('cookieyes_consent_update', { eventData });
        if (data.accepted.includes('functional')) {
          initLocation();
        } else {
          if ('ip' === getGeoStoreSource()) {
            removeLocation();
          }
        }
      });
    },
  } as GeolocationAlpineStore);
});

/**
 * Sets an initial geolocation
 * Checks if browser geolocation is allowed, else, sets location by IP
 */
async function initLocation(): Promise<void> {
  /**
   * check if geolocation already exists in localstorage
   * if set by IP, then re-inits location checks to see if geolocation is allowed via browser
   * `ls` is an abbreviation for localstorage
   */
  const lsMarketID = localStorage.getItem('_x_market_id');
  let lsGeoSource = localStorage.getItem('_x_geo_source');
  lsGeoSource = lsGeoSource && JSON.parse(lsGeoSource);

  // if geolocation is already set
  if (lsMarketID && '' !== lsGeoSource && '0' !== lsMarketID) {
    // if geolocation source is not IP
    if ('ip' !== lsGeoSource) {
      return;
    }
  }

  const geoSource = getGeoStoreSource();

  // When location is already set on subsequent page loads by IP, but browser permission given later, then priorize browser coordinates
  if ('ip' === geoSource) {
    geoBrowserCheck();
  } else {
    // set location by IP by default
    runIPQuery();

    // try querying via geolocation coordinates for the first time
    initGeolocationBrowser();
  }
}

/**
 * Ask for Geolocation API access from the browser and if supplied, then set the coordinates
 */
function initGeolocationBrowser(): void {
  // Ask for geolocation access, timeout after 60 seconds
  navigator.geolocation?.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      runCoordinatesQuery(latitude, longitude);
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        console.error('User denied browser geolocation access');
      } else {
        console.error(`Geolocation error: ${error.message}`);
      }
    },
    {
      timeout: 60000,
    }
  );
}

/**
 * Queries the Geolocation API with coordinates number sent by the browser
 * @param latitude number
 * @param longitude number
 */
async function runCoordinatesQuery(latitude: number, longitude: number) {
  const apiBody: QueryParams = {
    type: 'coord',
    coord: [latitude, longitude],
  };

  const GeoQueryClass = new GeolocationQuery(apiBody);
  let responseData = (await GeoQueryClass.sendQuery()) as APIResponse;

  if (!responseData.market_id) {
    responseData = GeoQueryClass.emptyResponse();
  }

  setGeoStoreSource('coord');
  updateGeoStoreFromData(responseData);
}

/**
 * Run Query to get location by IP.
 * No IP Address is passed as the API automatically determines the IP from which the request is made
 */
async function runIPQuery() {
  const apiBody: QueryParams = {
    type: 'ip',
  };

  const GeoQueryClass = new GeolocationQuery(apiBody);
  let responseData = (await GeoQueryClass.sendQuery()) as APIResponse;

  if (!responseData.market_id) {
    responseData = GeoQueryClass.emptyResponse();
  }

  setGeoStoreSource('ip');
  updateGeoStoreFromData(responseData);
}

/**
 * Check if geolocation allowed. Times out within half a second
 * Only used for checks when browser geolocation is allowed after first blocking or timing out
 */
async function geoBrowserCheck(): Promise<void> {
  if (await isGeolocationPermissionGranted()) {
    // permission granted
    navigator.geolocation?.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      runCoordinatesQuery(latitude, longitude);
    });
  }
}

/**
 * Updates the Geolocation store from the response data
 * @param data APIResponse Requires the data in the form of Geolocation API Response object
 */
function updateGeoStoreFromData(data: APIResponse) {
  updateGeoStore(
    data.market,
    data.market_nickname,
    data.market_id,
    data.city_name,
    data.state_name
  );
}

/**
 * Checks if geolocation permission is granted by the user
 */
async function isGeolocationPermissionGranted(): Promise<boolean> {
  if (navigator.geolocation) {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
    if (permissionStatus.state === 'granted') {
      return true;
    }

    return false;
  }
  return false;
}

/**
 * Reset location to defaults
 */
function removeLocation() {
  window.Alpine.store(GEOLOCATION_STORE_NAME).geo_source = '';

  updateGeoStore(
    DEFAULT_MARKET_NAME,
    DEFAULT_MARKET_NICKNAME,
    DEFAULT_MARKET_ID,
    DEFAULT_MARKET_NAME,
    ''
  );
}
