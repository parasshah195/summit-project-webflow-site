import type { APIResponse } from '$api/eventQueryTypes';
import { arrayCheck } from '$utils/arrayCheck';

export type DefinedExcludedTopics = string[];

/**
 * Attribute name for topics exclusion
 * Array of topics to exclude from showing in the events list
 * Filters at render level and not at API query level because of no such provision in the API
 * Add this attribute to the `componentEl` ref
 */
export const TOPICS_EXCLUSION_ATTR = 'data-topics-exclude';

export function filterExcludedTopics(
  componentEl: HTMLElement,
  eventsData: APIResponse[] | [] | null
) {
  if (!eventsData || !eventsData.length) {
    return eventsData;
  }

  const excludedTopics = componentEl.getAttribute(TOPICS_EXCLUSION_ATTR);

  if (!excludedTopics) {
    return eventsData;
  }

  const excludedTopicsArray = arrayCheck(excludedTopics);
  console.log(excludedTopicsArray);

  // filter out events to remove excluded topics
  eventsData = eventsData.filter((event) => {
    return !event.topics.some((topic) => {
      return excludedTopicsArray.includes(topic);
    });
  });

  return eventsData;
}
