'use client';

import { useTranslate } from '@/hooks/useTranslate';
import { useCreateItemDescription, useItemDescriptionsQuery, useUpdateItemDescription, type Item } from '@/hooks/useWawi';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  cn,
  Icon,
  Separator,
  Skeleton,
  Stack,
  Text,
} from '@jtl/platform-ui-react';
import React, { useEffect, useState } from 'react';
import FieldSelector from './components/FieldSelector';
import ItemSelector from './components/ItemSelector';
import LanguageSelector from './components/LanguageSelector';
import TranslationModeSelector from './components/TranslationModeSelector';
import { Language, Property, TranslationMode } from './types';
import { useAuth } from '@/hooks/useAuth';

/**
 * Configured languages - there is no API to get this from the Wawi
 * right now, so we assume a standard set of German and English.
 * Please make sure that these languages are enabled inside the Wawi.
 */
const languages: Language[] = [
  { iso: 'de', label: 'German' },
  { iso: 'en', label: 'English' },
];

/**
 * Item properties that can be translated
 */
const props: Property[] = [
  { prop: 'name', label: 'Name' },
  { prop: 'description', label: 'Description' },
  { prop: 'shortDescription', label: 'Short Description' },
  { prop: 'seoMetaDescription', label: 'SEO Description' },
  { prop: 'seoTitleTag', label: 'SEO Title Tag' },
  { prop: 'seoMetaKeywords', label: 'SEO Meta Keywords' },
];

export default function ErpPage() {
  const { user, tenantId } = useAuth();
  const [item, setItem] = useState<Item | undefined>();
  const [selectedProps, setSelectedProps] = useState<Property[]>([...props.slice(0, 3)]);
  const [sourceLanguage, setSourceLanguage] = useState<Language>(languages[0]);
  const [targetLanguage, setTargetLanguage] = useState<Language>(languages[1]);
  const [translationMode, setTranslationMode] = useState<TranslationMode>('all-fields');
  const [translations, setTranslations] = useState<{ [locale: string]: Record<string, string> }>({});
  const [error, setError] = useState<Error | null>(null);
  const {
    data: itemDescriptions,
    isLoading: itemDescriptionsLoading,
    error: itemDescriptionsError,
    refetch: refetchItemDescriptions,
  } = useItemDescriptionsQuery(item?.id);
  const { mutateAsync: translate, isPending: translationsLoading, error: translationsError } = useTranslate();
  const {
    mutateAsync: createItemDescription,
    isPending: createItemDescriptionLoading,
    error: createItemDescriptionError,
  } = useCreateItemDescription();
  const {
    mutateAsync: updateItemDescription,
    isPending: updateItemDescriptionloading,
    error: updateItemDescriptionError,
  } = useUpdateItemDescription();

  /**
   * Reset translations if active item changes
   */
  useEffect(() => {
    setTranslations({});
  }, [item, itemDescriptions]);

  /**
   * Consolidate all errors into a single error
   */
  useEffect(() => {
    if (!tenantId) {
      setError(new Error(`The user ${user?.email} is not associated with a JTL Tenant. Please reactivate the app in JTL Hub.`));
    } else {
      setError(itemDescriptionsError || translationsError || createItemDescriptionError || updateItemDescriptionError);
    }
  }, [user, tenantId, itemDescriptionsError, translationsError, createItemDescriptionError, updateItemDescriptionError]);

  /**
   * Gets translations in the current target language
   */
  const handleTranslate = () => {
    const opts = {
      sourceLanguage: sourceLanguage.iso,
      targetLanguage: targetLanguage.iso,
      keys: {} as Record<string, string>,
    };
    for (const prop of selectedProps) {
      if (!canTranslateProperty(prop)) continue;
      opts.keys[prop.prop] = getPropertyValue(prop, sourceLanguage.iso);
    }
    translate(opts).then(data => {
      setTranslations({
        ...translations,
        [opts.targetLanguage]: data,
      });
    });
  };

  /**
   * Creates or updates the item description if we had any changes
   */
  const handleSave = async () => {
    // We need an active item to be able to save
    if (!item) return;

    // Get modified (translated) descriptions for the currently active target language
    const modifiedDescriptions = translations[targetLanguage.iso];
    if (!modifiedDescriptions || !Object.keys(modifiedDescriptions).length) return;

    // Get source and target descriptions
    const sourceDescriptions = itemDescriptions?.find(desc => desc.locale === sourceLanguage.iso);
    const targetDescriptions = itemDescriptions?.find(desc => desc.locale === targetLanguage.iso);

    // We cannot continue if we do not have active source descriptions
    if (!sourceDescriptions) return;

    try {
      // Update existing target descriptions if they exist
      if (targetDescriptions) {
        await updateItemDescription({
          itemId: item.id,
          description: {
            locale: targetDescriptions.locale,
            salesChannelId: targetDescriptions.salesChannelId,
            name: modifiedDescriptions.name || targetDescriptions.name,
            description: modifiedDescriptions.description || targetDescriptions.description,
            shortDescription: modifiedDescriptions.shortDescription || targetDescriptions.shortDescription,
            seoMetaDescription: modifiedDescriptions.seoMetaDescription || targetDescriptions.seoMetaDescription,
            seoMetaKeywords: modifiedDescriptions.seoMetaKeywords || targetDescriptions.seoMetaKeywords,
            seoTitleTag: modifiedDescriptions.seoTitleTag || targetDescriptions.seoTitleTag,
          },
        });
      } else {
        await createItemDescription({
          itemId: item.id,
          description: {
            locale: targetLanguage.iso,
            salesChannelId: sourceDescriptions.salesChannelId,
            name: modifiedDescriptions.name,
            description: modifiedDescriptions.description,
            shortDescription: modifiedDescriptions.shortDescription,
            seoMetaDescription: modifiedDescriptions.seoMetaDescription,
            seoMetaKeywords: modifiedDescriptions.seoMetaKeywords,
            seoTitleTag: modifiedDescriptions.seoTitleTag,
          },
        });
      }

      // Refetch item descriptions after they have been updated
      await refetchItemDescriptions();

      // Reset translations
      setTranslations({});
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error while saving'));
    }
  };

  /**
   * Gets the value of an item property. Will remove HTML tags.
   */
  const getPropertyValue = (prop: Property, iso: string, includeTranslation = false) => {
    let value: string | number | undefined = includeTranslation && iso === targetLanguage.iso ? translations[targetLanguage.iso]?.[prop.prop] : '';
    if (!value) value = itemDescriptions?.find(item => item.locale === iso)?.[prop.prop] ?? '';
    if (!value) return '';
    const div = document.createElement('div');
    div.innerHTML = `${value}`;
    return div.textContent || div.innerText || '';
  };

  /**
   * Checks if the property can / should be translated
   */
  const canTranslateProperty = (prop: Property) => {
    const sourceValue = getPropertyValue(prop, sourceLanguage.iso);
    const targetValue = getPropertyValue(prop, targetLanguage.iso);
    if (!sourceValue) return false;
    if (targetValue && translationMode === 'empty-fields-only') return false;
    return true;
  };

  /**
   * Checks if a translation exists
   */
  const getTranslationStatus = (prop: Property): 'changed' | 'unchanged' | 'untranslated' => {
    const originalValue = itemDescriptions?.find(desc => desc.locale === targetLanguage.iso)?.[prop.prop];
    const translatedValue = translations[targetLanguage.iso]?.[prop.prop];
    if (translatedValue) return translatedValue === originalValue ? 'unchanged' : 'changed';
    return 'untranslated';
  };

  /**
   * Gets a map of modified properties that should be saved. If no properties
   * have been modified, then it will return `null`
   */
  const getModifiedPropValues = () => {
    const values: Record<string, string> = {};
    for (const prop of selectedProps) {
      if (!canTranslateProperty(prop) || getTranslationStatus(prop) !== 'changed') continue;
      values[prop.prop] = getPropertyValue(prop, sourceLanguage.iso, true);
    }
    return Object.keys(values).length ? values : null;
  };

  /**
   * Checks if a property is currently being loaded or translated
   */
  const isPropertyLoading = (prop: Property, iso: string) => {
    if (itemDescriptionsLoading) return true;
    if (translationsLoading && iso === targetLanguage.iso) return canTranslateProperty(prop);
    return false;
  };

  /**
   * Tells if we are allowed to save currently
   */
  const canSave = item && !!getModifiedPropValues();

  /**
   * Tells if we are currently saving
   */
  const isSaving = !!(createItemDescriptionLoading || updateItemDescriptionloading || (canSave && itemDescriptionsLoading));

  return (
    <div className="flex flex-col flex-1 items-start gap-4 min-h-0">
      <Card className="w-full p-0">
        <CardHeader className="flex flex-row justify-between px-6 pt-6">
          <Stack spacing="4" direction="row">
            <Stack spacing="2" direction="column">
              <Text color="muted">Product</Text>
              <ItemSelector item={item} onItemSelected={setItem} />
            </Stack>
            <Stack spacing="2" direction="column">
              <Text color="muted">Fields</Text>
              <FieldSelector fields={props} value={selectedProps} onChange={setSelectedProps} />
            </Stack>
          </Stack>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert title="An error occured" description={error.message} variant="destructive" onClose={() => setError(null)}></Alert>
          </div>
        )}

        {item && <Separator />}

        <CardContent className="p-0">
          {/* Source and Target Language selection */}
          {item && (
            <div className="flex flex-row gap-6 -mt-6">
              <div className="flex flex-row flex-1 w-full gap-4 pl-6 py-6">
                <Stack spacing="2" direction="column">
                  <Text color="muted">Source Language</Text>
                  <LanguageSelector value={sourceLanguage} onChange={setSourceLanguage} languages={languages} />
                </Stack>
              </div>
              <div className="h-auto">
                <Separator orientation="vertical" />
              </div>
              <div className="flex flex-row flex-1 w-full gap-4 pr-6 py-6">
                <Stack spacing="2" direction="column">
                  <Text color="muted">Target Language</Text>
                  <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} languages={languages} />
                </Stack>
                <Stack spacing="2" direction="column">
                  <Text color="muted">Translation Mode</Text>
                  <TranslationModeSelector value={translationMode} onChange={setTranslationMode} />
                </Stack>
                <Stack spacing="2" direction="column">
                  <Text>&nbsp;</Text>
                  <Stack spacing="2" direction="row">
                    <Button label="Translate" variant="default" disabled={!item || translationsLoading} onClick={() => handleTranslate()}></Button>
                    {item && (
                      <Button label="Save Changes" variant="default" disabled={isSaving || !canSave} loading={isSaving} onClick={handleSave}></Button>
                    )}
                  </Stack>
                </Stack>
              </div>
            </div>
          )}

          {/* Translation fields */}
          {item &&
            selectedProps.map(prop => (
              <React.Fragment key={prop.prop}>
                <Separator />
                <div className="flex flex-row gap-6">
                  {[sourceLanguage, targetLanguage].map((lang, langIndex) => (
                    <React.Fragment key={langIndex}>
                      {langIndex !== 0 && (
                        <div className="h-auto">
                          <Separator orientation="vertical" />
                        </div>
                      )}
                      <div className={cn('flex-1 w-full pb-4 whitespace-pre-wrap', langIndex === 0 ? 'pl-6' : 'pr-6')}>
                        <CardDescription className="pt-4">
                          <div className="inline-flex flex-row gap-2 mb-1">
                            <Text color="muted" type="body">
                              {prop.label}
                            </Text>
                            <Badge variant="secondary" label={lang.iso.toUpperCase()} />
                            {langIndex === 1 && getTranslationStatus(prop) === 'changed' && <Badge variant="success" label="Translated" />}
                            {langIndex === 1 && getTranslationStatus(prop) === 'unchanged' && <Badge variant="info" label="Unchanged" />}
                          </div>
                        </CardDescription>
                        {isPropertyLoading(prop, lang.iso) ? (
                          <div className="flex flex-row gap-2 pt-2">
                            <Skeleton variant="line" />
                          </div>
                        ) : (
                          getPropertyValue(prop, lang.iso, langIndex === 1) || <Icon name="Ban" opacity={0.5} className="opacity-50 size-4" />
                        )}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </React.Fragment>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
