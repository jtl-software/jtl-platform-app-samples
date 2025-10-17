import { useMutation, useQuery, type QueryKey } from '@tanstack/react-query';
import type { FetchOptions } from '../server/jtl-cloud-client';

/**
 * Wawi API item
 */
export type Item = {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
};

/**
 * Wawi API item description
 */
export type ItemDescription = {
  name: string;
  description: string;
  shortDescription: string;
  seoMetaDescription: string;
  seoMetaKeywords: string;
  seoTitleTag: string;
  locale: string;
  salesChannelId: string;
};

/**
 * Runs a request against the JTL Wawi API using our /api/jtl/erp endpoint wrapper
 */
async function fetchFromWawi<ResponseType>(opts: FetchOptions, signal?: AbortSignal): Promise<ResponseType> {
  const url = new URL('/api/jtl/erp', window.location.origin);
  const res = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(opts),
    signal,
  });
  const data = await res.json();
  if (!res.ok) {
    const message =
      [data && 'error' in data ? data.error : null, data && 'error_description' in data ? data.error_description : null]
        .filter(text => !!text)
        .join(': ') || 'Failed to get data from Wawi';
    throw new Error(message);
  } else {
    return data as ResponseType;
  }
}

/**
 * Fetches data from the ERP using our own backend endpoint /api/jtl/erp
 */
function useWawi<ResponseType>(opts: FetchOptions & { queryKey: QueryKey; enabled?: boolean; select?: (data: unknown) => ResponseType }) {
  return useQuery({
    queryKey: opts.queryKey,
    queryFn: ({ signal }) => fetchFromWawi(opts, signal),
    enabled: opts?.enabled,
    select: opts.select,
    staleTime: 0,
    retry: false,
    refetchOnMount: true,
  });
}

/**
 * Queries items (products) from the Wawi
 * https://developer.jtl-software.com/products/erpapi/1.0-cloud/openapi/item/itemheader_queryitemsasync
 */
export function useItemsQuery(query: string) {
  return useWawi<Item[]>({
    enabled: query.length > 0,
    queryKey: ['items', query],
    path: '/erp/items',
    query: {
      searchKeyWord: query,
      pageSize: 20,
    },
    select: data => {
      if (typeof data === 'object' && data !== null && 'Items' in data && Array.isArray(data.Items)) {
        return data.Items.map(item => ({
          id: item.Id,
          name: item.Name,
          description: item.Description,
          shortDescription: item.ShortDescription,
        }));
      } else {
        return [];
      }
    },
  });
}

/**
 * Queries item descriptions for all available locales and sales channels
 * https://developer.jtl-software.com/products/erpapi/1.0-cloud/openapi/item/itemheader_queryitemdescriptionsasync
 */
export function useItemDescriptionsQuery(itemId?: number) {
  return useWawi<ItemDescription[]>({
    enabled: !!itemId,
    queryKey: ['descriptions', itemId],
    path: `/erp/items/${itemId}/descriptions`,
    select: data => {
      if (Array.isArray(data)) {
        return data.map(item => ({
          id: item.Id,
          name: item.Name,
          description: item.Description,
          shortDescription: item.ShortDescription,
          seoMetaDescription: item.SeoMetaDescription,
          seoMetaKeywords: item.SeoMetaKeywords,
          seoTitleTag: item.SeoTitleTag,
          locale: item.LanguageIso,
          salesChannelId: item.SalesChannelId,
        }));
      } else {
        return [];
      }
    },
  });
}

/**
 * Creates a new item description for the specified itemId
 * https://developer.jtl-software.com/products/erpapi/1.0-cloud/openapi/item/itemheader_createitemdescriptionasync
 */
export function useCreateItemDescription() {
  return useMutation({
    mutationFn: (opts: { itemId: number; description: ItemDescription }) =>
      fetchFromWawi<void>({
        method: 'POST',
        path: `/erp/items/${opts.itemId}/descriptions`,
        data: {
          Name: opts.description.name,
          Description: opts.description.description,
          ShortDescription: opts.description.shortDescription,
          SeoMetaDescription: opts.description.seoMetaDescription,
          SeoMetaKeywords: opts.description.seoMetaKeywords,
          SeoTitleTag: opts.description.seoTitleTag,
          LanguageIso: opts.description.locale,
          SalesChannelId: opts.description.salesChannelId,
        },
      }),
  });
}

/**
 * Updates the item description for the specified itemId
 * https://developer.jtl-software.com/products/erpapi/1.0-cloud/openapi/item/itemheader_updateitemdescriptionasync
 */
export function useUpdateItemDescription() {
  return useMutation({
    mutationFn: (opts: { itemId: number; description: ItemDescription }) =>
      fetchFromWawi<void>({
        method: 'PATCH',
        path: `/erp/items/${opts.itemId}/descriptions/${opts.description.salesChannelId}/${opts.description.locale}`,
        data: {
          Name: opts.description.name,
          Description: opts.description.description,
          ShortDescription: opts.description.shortDescription,
          SeoMetaDescripotion: opts.description.seoMetaDescription,
          SeoMetaKeywords: opts.description.seoMetaKeywords,
          SeoTitleTag: opts.description.seoTitleTag,
        },
      }),
  });
}
