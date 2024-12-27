import type { StoreSources } from '$api/geolocationQueryTypes';

import { GEOLOCATION_STORE_NAME } from './storeNames';

/**
 * Sets the source via which geolocation is set
 */
export function getGeoStoreSource(): StoreSources {
  const geoSource = localStorage.getItem('_x_geo_source');
  if (geoSource) {
    return JSON.parse(geoSource);
  }
  return '';
}

/**
 * Sets the source via which geolocation is set
 */
export function setGeoStoreSource(source: StoreSources) {
  window.Alpine.store(GEOLOCATION_STORE_NAME).geo_source = source;
}
