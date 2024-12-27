import type { AlpinePersistPlugin } from '@alpinejs/persist';
import type { Alpine } from 'alpinejs';

import type { AlpineStoreExtensions, ApplerouthAlpineComponent, XData } from './alpine-component';

interface ApplerouthAlpine extends Alpine {
  $persist?: AlpinePersistPlugin;
  /**
   * Retrieves state in the global store.
   *
   * @param name state key
   */
  store<K extends keyof AlpineStoreExtensions>(name: K): AlpineStoreExtensions[K];
  /**
   * Sets state in the global store.
   *
   * @param name state key
   * @param value the initial state value
   */
  store(name: string, value: XData): void;
  /**
   * Provides a way to reuse x-data contexts within your application.
   *
   * @param name the id of the x-data context
   * @param callback the initializer of the x-data context
   */
  data(name: string, callback: (...initialStateArgs: unknown[]) => ApplerouthAlpineComponent): void;
}

declare global {
  interface Window {
    Alpine: ApplerouthAlpine;
  }
}

export {};
