declare module '@alpinejs/persist' {
  interface AlpinePersistFunction {
    (Alpine: any): any;
    as(key: string): AlpinePersistFunction;
    using(target: Storage): AlpinePersistFunction;
  }

  interface AlpinePersistPlugin {
    [key: string]: any;
    as: (key: string) => AlpinePersistPlugin;
    using: (target: Storage) => AlpinePersistPlugin;
  }

  const persist: AlpinePersistFunction;

  export default persist;

  export function persist(
    key: string,
    options: {
      get: () => any;
      set: (value: any) => void;
    },
    storage?: Storage
  ): void;
}
