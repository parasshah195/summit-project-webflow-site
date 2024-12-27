/**
 * Functionality for the search page (located at `/search-results`).
 * Creates a store to sync the search query across different search result components
 *
 * Store Name and Component Name - `search`
 */

import { getQueryParam } from '$utils/queryParamOps';
import { SEARCH_STORE_NAME } from '$utils/storeNames';

export interface SearchAlpineStore {
  /**
   * The search query
   */
  query: string;
}

/**
 * Search AlpineJS store and component class
 */
const URL_QUERY_PARAM = 'query';

document.addEventListener('alpine:init', () => {
  // init search store
  window.Alpine.store(SEARCH_STORE_NAME, {
    query: getQueryParam(URL_QUERY_PARAM),
  });
});
