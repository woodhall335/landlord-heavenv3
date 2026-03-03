import manifest from '../../../public/images/blog/blog-image-manifest.json';

const HERO_FALLBACK = '/images/blog/placeholders/lh-blog-placeholder-v1.webp';
const OG_FALLBACK = '/images/blog/placeholders/lh-blog-placeholder-v1-og.webp';

const KEYWORD_TEMPLATE_MAP: Array<{ match: RegExp; key: string }> = [
  { match: /renters reform|law|act/i, key: 'law-reform' },
  { match: /section 21|form 6a/i, key: 'section-21' },
  { match: /section 8|grounds/i, key: 'section-8' },
  { match: /tenancy|agreement|ast|prt/i, key: 'tenancy-agreements' },
  { match: /notice|eviction/i, key: 'product-notice-wizard' },
  { match: /money claim|arrears/i, key: 'money-claim' },
  { match: /scotland/i, key: 'region-scotland' },
  { match: /wales/i, key: 'region-wales' },
  { match: /northern ireland|ni/i, key: 'region-ni' },
];

function toPublicPath(path: string) {
  return path.replace(/^public/, '');
}

export function getBlogImagesForPost(title: string, targetKeyword: string) {
  const haystack = `${title} ${targetKeyword}`;
  const template = KEYWORD_TEMPLATE_MAP.find((entry) => entry.match.test(haystack))?.key;

  const hero = manifest.heroes.find((entry) => entry.templateKey === template);
  const og = manifest.og.find((entry) => entry.templateKey === template);

  return {
    hero: hero ? toPublicPath(hero.path) : HERO_FALLBACK,
    og: og ? toPublicPath(og.path) : OG_FALLBACK,
  };
}
