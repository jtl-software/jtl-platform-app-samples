import { useMutation } from '@tanstack/react-query';

/**
 * Resolves translations
 */
export function useTranslate() {
  const fetchItems = async (opts: { sourceLanguage: string; targetLanguage: string; keys: Record<string, string> }) => {
    const res = await fetch('/api/translate', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opts),
    });
    const data = await res.json();
    if (!res.ok || !data?.translations) {
      throw new Error(data && 'error' in data ? data.error : 'Failed to get translations');
    } else {
      return data.translations as Record<string, string>;
    }
  };

  return useMutation({
    mutationFn: fetchItems,
  });
}
