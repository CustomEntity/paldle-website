import type en from './locales/en.json';

type StringKeyof<T> = Extract<keyof T, string>;

type NestedKeys<T> = T extends object
	? {
			[K in StringKeyof<T>]: T[K] extends object ? `${K}` | `${K}.${NestedKeys<T[K]>}` : `${K}`;
	  }[StringKeyof<T>]
	: '';

export type TranslationKeys = NestedKeys<typeof en>;
