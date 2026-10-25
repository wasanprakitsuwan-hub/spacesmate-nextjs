/**
 * canonical + hreflang for a page that exists in both languages.
 *
 * Google wants the full set on BOTH sides: the page itself, its other-language
 * twin, and x-default. Most pages here used to declare only the twin, which
 * Google treats as an incomplete cluster and may ignore. Thai is x-default
 * because Thai is served at the root and is the site's main audience.
 *
 * Paths are relative; rootMetadata sets metadataBase to https://spacesmate.com,
 * so Next turns them into absolute URLs. Pass the Thai path, already encoded
 * if it has Thai characters in it.
 */
export function hreflang(thPath: string, locale: 'th' | 'en') {
  const en = thPath === '/' ? '/en' : `/en${thPath}`
  return {
    canonical: locale === 'en' ? en : thPath,
    languages: { th: thPath, en, 'x-default': thPath },
  }
}
