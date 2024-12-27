import { type QueryParams, QueryParamsProperties } from '$api/eventQueryTypes';
import type { ApplerouthAlpineComponent } from '$types/alpine-component';

/**
 * Update query API Body params with the attribute values on the component reference
 * @param componentEl The componentEl reference
 * @param alpineComponentInstance Alpine's component `this` reference
 * @param API_BODY List of query params allowed to be overwritten
 */
export function setEventQueryFromAttr(
  componentEl: HTMLElement,
  alpineComponentInstance: ApplerouthAlpineComponent
) {
  const ATTR_PREFIX = 'query-';
  const ATTR_PREFIX_LENGTH = ATTR_PREFIX.length;

  for (const attr of componentEl.attributes) {
    if (attr.name.startsWith(ATTR_PREFIX)) {
      const attrName = attr.name.substring(ATTR_PREFIX_LENGTH) as keyof QueryParams;
      if (QueryParamsProperties.includes(attrName)) {
        alpineComponentInstance.apiBody[attrName] = parseAttrValue(attr.value);
      }
    }
  }
}

/**
 * Parses the value of attributes to their respective types
 * Supports checks for boolean, number, array, and Date types
 * @param {string} value - value of the attribute
 */
function parseAttrValue(value: string): number | boolean | string | Array<string | number> | Date {
  // Number check
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  // Date check
  if (!isNaN(Date.parse(value))) {
    return new Date(value);
  }

  // Boolean check
  const lowercaseValue = value.toLowerCase();
  if (lowercaseValue === 'true') {
    return true;
  }
  if (lowercaseValue === 'false') {
    return false;
  }

  // Array check
  try {
    const arrayPattern = /'([^']*)'/g;
    const parsedArray = JSON.parse(value.replace(arrayPattern, '"$1"'));

    if (Array.isArray(parsedArray)) {
      return parsedArray;
    }

    // if not array, return string
    return value;
  } catch (err) {
    // if JSON.parse fails, return the value as is, in string
    return value;
  }
}
