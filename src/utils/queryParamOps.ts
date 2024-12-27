/**
 * This file contains utility functions for working with URL query parameters
 */

/**
 * An array of argument object to set as query params for the current page
 */
type SetQueryParamsArg = {
  param: string;
  value: string | undefined | null;
}[];

/**
 * Get a URL query parameter
 * @param param the query parameter to get
 * @returns the query parameter value or an empty string if not found
 */
export function getQueryParam(param: string): string {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get(param);

  return query || '';
}

/**
 * Get all URL query parameter
 * @returns {object} all query parameters found in the URL as a key-value pair
 */
export function getAllQueryParams(): Record<string, string> {
  const paramsObj: Record<string, string> = {};

  const params = new URLSearchParams(window.location.search);
  params.forEach((value, key) => {
    paramsObj[key] = value;
  });

  return paramsObj;
}

/**
 * Sets the query parameter to the given value. If undefined or null, the query parameter is removed
 * @param param the parameter to set
 * @param value the new query value to set
 * @param updateBrowserHistory Optional. Adds the new state to the browser history
 */
export function setQueryParam(
  param: string,
  value: string | undefined | null,
  updateBrowserHistory = false
): void {
  const url = new URL(window.location.href);

  if (!value) {
    url.searchParams.delete(param);
  } else {
    url.searchParams.set(param, value);
  }

  if (updateBrowserHistory) {
    // Update the browser history
    window.history.pushState({}, '', url.href);
  } else {
    window.history.replaceState({}, '', url.href);
  }
}

/**
 * Sets multiple query parameters to its given values. If undefined or null, the query parameter is removed
 * @param records the list of param-value pairs to set
 * @param updateBrowserHistory Optional. Adds the new state to the browser history
 */
export function setQueryParams(records: SetQueryParamsArg, updateBrowserHistory = false): void {
  const url = new URL(window.location.href);

  records.forEach((record) => {
    if (!record.value) {
      url.searchParams.delete(record.param);
    } else {
      url.searchParams.set(record.param, record.value);
    }
  });

  if (updateBrowserHistory) {
    // Update the browser history
    window.history.pushState({}, '', url.href);
  } else {
    window.history.replaceState({}, '', url.href);
  }
}

export function removeAllQueryParams(updateBrowserHistory = false) {
  const url = new URL(window.location.href);
  url.searchParams.forEach((value, param) => {
    url.searchParams.delete(param);
  });

  if (updateBrowserHistory) {
    // Update the browser history
    window.history.pushState({}, '', url.href);
  } else {
    window.history.replaceState({}, '', url.href);
  }
}
