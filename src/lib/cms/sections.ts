export type SiteSection<T = unknown> = {
  isVisible: boolean;
  content: T;
};

type DatabaseSection = {
  section_key: string;
  is_visible: boolean;
  content: unknown;
};

function mergeContent<T>(fallback: T, value: unknown): T {
  if (!fallback || typeof fallback !== 'object' || Array.isArray(fallback)) {
    return (value ?? fallback) as T;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;

  const merged = { ...(fallback as Record<string, unknown>), ...(value as Record<string, unknown>) };
  for (const [key, fallbackValue] of Object.entries(fallback as Record<string, unknown>)) {
    const dbValue = (value as Record<string, unknown>)[key];
    if (Array.isArray(fallbackValue) && (!Array.isArray(dbValue) || dbValue.length === 0)) {
      merged[key] = fallbackValue;
    } else if (
      fallbackValue &&
      typeof fallbackValue === 'object' &&
      !Array.isArray(fallbackValue) &&
      dbValue &&
      typeof dbValue === 'object' &&
      !Array.isArray(dbValue)
    ) {
      merged[key] = mergeContent(fallbackValue, dbValue);
    }
  }
  return merged as T;
}

async function fetchSections(keys: string[]): Promise<Record<string, DatabaseSection>> {
  if (keys.length === 0) return {};
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !apiKey) {
    console.error('Supabase public configuration is missing while loading site sections.');
    return {};
  }

  const query = new URLSearchParams({
    select: 'section_key,is_visible,content',
    section_key: `in.(${keys.map((key) => `"${key.replaceAll('"', '\\"')}"`).join(',')})`,
  });

  const response = await fetch(`${url}/rest/v1/site_sections?${query}`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Supabase site sections read failed:', response.status, await response.text());
    return {};
  }

  const data = (await response.json()) as DatabaseSection[];
  return Object.fromEntries(data.map((section) => [section.section_key, section]));
}

export async function getSiteSections(keys: string[]): Promise<Record<string, SiteSection<unknown>>> {
  const uniqueKeys = [...new Set(keys)].sort();
  const rows = await fetchSections(uniqueKeys);
  return Object.fromEntries(
    Object.entries(rows).map(([key, row]) => [key, { isVisible: row.is_visible, content: row.content }])
  );
}

export async function getSiteSection<T>(
  sectionKey: string,
  fallback: T
): Promise<{ isVisible: boolean; content: T }> {
  const sections = await getSiteSections([sectionKey]);
  const section = sections[sectionKey];
  if (!section) return { isVisible: true, content: fallback };

  return {
    isVisible: section.isVisible,
    content: mergeContent(fallback, section.content),
  };
}

export async function getSiteSectionsByPrefix(
  prefix: string
): Promise<Record<string, SiteSection<unknown>>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !apiKey) {
    console.error('Supabase public configuration is missing while loading site sections.');
    return {};
  }

  const query = new URLSearchParams({
    select: 'section_key,is_visible,content',
    section_key: `like.${prefix}*`,
  });

  const response = await fetch(`${url}/rest/v1/site_sections?${query}`, {
    headers: { apikey: apiKey, Authorization: `Bearer ${apiKey}` },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error('Supabase site sections prefix read failed:', response.status, await response.text());
    return {};
  }

  const rows = (await response.json()) as DatabaseSection[];
  return Object.fromEntries(
    rows.map((section) => [
      section.section_key,
      { isVisible: section.is_visible, content: section.content },
    ])
  );
}

export function visibleItems<T extends { isVisible?: boolean }>(items: T[]): T[] {
  return items.filter((item) => item.isVisible !== false);
}
