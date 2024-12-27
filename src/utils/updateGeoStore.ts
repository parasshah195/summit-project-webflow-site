import type { APIResponse } from '$api/geolocationQueryTypes';
import { GEOLOCATION_STORE_NAME } from '$utils/storeNames';

/**
 * Updates the Alpine Store with the specified location parameters
 * This will then trigger an update on all the modules that are using the store value
 */
export function updateGeoStore(
  market: APIResponse['market'],
  market_nickname: APIResponse['market_nickname'],
  market_id: APIResponse['market_id'],
  city_name: APIResponse['city_name'],
  state_name: APIResponse['state_name']
): void {
  window.Alpine.store(GEOLOCATION_STORE_NAME).market = market;
  window.Alpine.store(GEOLOCATION_STORE_NAME).market_nickname = market_nickname;
  window.Alpine.store(GEOLOCATION_STORE_NAME).market_id = market_id;
  window.Alpine.store(GEOLOCATION_STORE_NAME).city_name = city_name;
  window.Alpine.store(GEOLOCATION_STORE_NAME).state_name = state_name;
  window.Alpine.store(GEOLOCATION_STORE_NAME).location_name = getGeoLocationName(
    market,
    city_name,
    state_name
  );
}

function getGeoLocationName(
  market: APIResponse['market'],
  city_name: APIResponse['city_name'],
  state_name: APIResponse['state_name']
) {
  if ('-' === city_name || null === city_name) {
    return market;
  }

  if ('' !== state_name && null !== state_name) {
    return `${city_name}, ${state_name}`;
  }

  return city_name;
}
