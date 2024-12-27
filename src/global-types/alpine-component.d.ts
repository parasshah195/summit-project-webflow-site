import type { AlpineMagics } from 'alpinejs';
import type { NPTStrategySessionStore } from 'src/pages/national-practice-test/event-strategy-sessions';
import type { NPTEventsAlpineStore } from 'src/pages/national-practice-test/events';
import type { PSATEventsAlpineStore } from 'src/pages/national-practice-test/events';

import type { FilterAlpineStore } from '$modules/filter-store';
import type { GeolocationAlpineStore } from '$modules/geolocation';
import type { SearchAlpineStore } from '$modules/search';
import type {
  FILTER_STORE_NAME,
  GEOLOCATION_STORE_NAME,
  NPT_EVENTS_STORE_NAME,
  NPT_STRATEGY_SESSIONS_STORE_NAME,
  PSAT_PATHWAYS_EVENTS_STORE_NAME,
  SEARCH_STORE_NAME,
} from '$utils/storeNames';

// Forked from original `XData` definition for `@types/alpinejs`
export type XData = XDataContext | string | number | boolean;

// Forked from original `XDataContext` definition for `@types/alpinejs`
interface XDataContext {
  /**
   * Will be executed before Alpine initializes the rest of the component.
   */
  init?(): void;
  [stateKey: string]: any;
}

/**
 * Define all custom stores
 */
export interface AlpineStoreExtensions {
  [GEOLOCATION_STORE_NAME]: GeolocationAlpineStore;
  [FILTER_STORE_NAME]: FilterAlpineStore;
  [SEARCH_STORE_NAME]: SearchAlpineStore;
  [NPT_EVENTS_STORE_NAME]: NPTEventsAlpineStore;
  [NPT_STRATEGY_SESSIONS_STORE_NAME]: NPTStrategySessionStore;
  [PSAT_PATHWAYS_EVENTS_STORE_NAME]: PSATEventsAlpineStore;
}

// Extend AlpineMagics type to include our custom stores
interface customMagics<T> extends AlpineMagics<T> {
  $store: AlpineStoreExtensions;
}

// Forked from original `AlpineComponent` definition from `@types/alpinejs`
export type ApplerouthAlpineComponent<T = Record<string, any>> = T &
  XDataContext &
  ThisType<T & XDataContext & customMagics<T>>;
