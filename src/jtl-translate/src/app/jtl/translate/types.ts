import { ItemDescription } from '@/hooks/useWawi';

export type TranslationField = { [iso: string]: string };

export type Property = {
  prop: keyof ItemDescription;
  label: string;
};

export type Language = {
  iso: string;
  label: string;
};

export type TranslationMode = 'empty-fields-only' | 'all-fields';
