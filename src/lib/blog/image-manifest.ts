import manifest from '../../../public/images/blog/blog-image-manifest.json';

type BlogImageInput = {
  slug: string;
  title: string;
  targetKeyword: string;
  category?: string;
  tags?: string[];
};

type ImageStrategy = 'explicit' | 'rotated' | 'placeholder';

type BlogImageResolution = {
  hero: string;
  og: string;
  placeholder: string;
  strategy: ImageStrategy;
  templateKey?: string;
  poolBucket?: string;
};

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

const OVERUSED_OR_GENERIC_TEMPLATE_KEYS = new Set([
  'section-21',
  'section-8',
  'tenancy-agreements',
  'money-claim',
  'rent-arrears',
  'court-process',
  'eviction-timeline',
  'product-notice-wizard',
]);

const HERO_POOL_BUCKETS: Array<{
  id: string;
  match: (input: BlogImageInput) => boolean;
  pool: string[];
}> = [
  {
    id: 'regions',
    match: (input) => /scotland|wales|northern ireland|ni/.test(toHaystack(input)),
    pool: ['region-scotland', 'region-wales', 'region-ni', 'law-reform', 'forms-paperwork', 'format-step-by-step'],
  },
  {
    id: 'money-claims',
    match: (input) => /money claim|arrears|mcol|county court|small claims|debt/.test(toHaystack(input)),
    pool: ['money-claim', 'product-money-claim', 'rent-arrears', 'court-process', 'format-calculator', 'forms-paperwork', 'format-checklist'],
  },
  {
    id: 'compliance-safety',
    match: (input) => /compliance|safety|gas|electrical|fire|epc|eicr|certificate|licensing/.test(toHaystack(input)),
    pool: ['compliance-certificate', 'safety-gas', 'safety-electrical', 'safety-fire', 'format-checklist', 'forms-paperwork', 'law-reform'],
  },
  {
    id: 'tenancy-agreements',
    match: (input) => /tenancy|agreement|ast|prt|occupation contract|joint tenancy/.test(toHaystack(input)),
    pool: ['tenancy-agreements', 'product-ast-builder', 'format-comparison', 'format-step-by-step', 'forms-paperwork', 'compliance-certificate'],
  },
  {
    id: 'eviction-guides',
    match: (input) => /eviction|section 8|section 21|notice|possession|bailiff|tribunal|ground/.test(toHaystack(input)),
    pool: ['section-21', 'section-8', 'product-notice-wizard', 'product-complete-pack', 'eviction-timeline', 'court-process', 'forms-paperwork', 'law-reform'],
  },
  {
    id: 'default',
    match: () => true,
    pool: ['format-step-by-step', 'format-comparison', 'forms-paperwork', 'law-reform', 'court-process', 'compliance-certificate'],
  },
];

const heroesByTemplateKey = new Map(manifest.heroes.map((entry) => [entry.templateKey, toPublicPath(entry.path)]));
const ogByTemplateKey = new Map(manifest.og.map((entry) => [entry.templateKey, toPublicPath(entry.path)]));

const placeholderVariants = manifest.placeholders
  .map((entry) => ({ file: entry.file, path: toPublicPath(entry.path) }))
  .filter((entry) => /^lh-blog-placeholder-v\d+\.webp$/.test(entry.file))
  .sort((a, b) => a.file.localeCompare(b.file));

const placeholderOgByVersion = new Map(
  manifest.placeholders
    .map((entry) => ({ file: entry.file, path: toPublicPath(entry.path) }))
    .filter((entry) => /^lh-blog-placeholder-v\d+-og\.webp$/.test(entry.file))
    .map((entry) => [entry.file.replace(/^lh-blog-placeholder-v(\d+)-og\.webp$/, '$1'), entry.path]),
);

function toPublicPath(path: string) {
  return path.replace(/^public/, '');
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function toHaystack(input: BlogImageInput) {
  return `${input.title} ${input.targetKeyword} ${input.category ?? ''} ${(input.tags ?? []).join(' ')}`.toLowerCase();
}

function getExplicitTemplateKey(input: BlogImageInput) {
  const haystack = `${input.title} ${input.targetKeyword}`;
  return KEYWORD_TEMPLATE_MAP.find((entry) => entry.match.test(haystack))?.key;
}

function getPlaceholderBySlug(slug: string) {
  if (placeholderVariants.length === 0) {
    return { hero: '/images/blog/placeholders/lh-blog-placeholder-v1.webp', og: '/images/blog/placeholders/lh-blog-placeholder-v1-og.webp' };
  }

  const selected = placeholderVariants[stableHash(slug) % placeholderVariants.length];
  const placeholderVersion = selected.file.replace(/^lh-blog-placeholder-v(\d+)\.webp$/, '$1');
  const ogPath = placeholderOgByVersion.get(placeholderVersion) ?? '/images/blog/placeholders/lh-blog-placeholder-v1-og.webp';
  return { hero: selected.path, og: ogPath };
}

function getRotatedTemplateKey(input: BlogImageInput) {
  const bucket = HERO_POOL_BUCKETS.find((entry) => entry.match(input)) ?? HERO_POOL_BUCKETS[HERO_POOL_BUCKETS.length - 1];
  const availablePool = bucket.pool.filter((templateKey) => heroesByTemplateKey.has(templateKey) && ogByTemplateKey.has(templateKey));

  if (availablePool.length === 0) {
    return { templateKey: null, bucket: bucket.id };
  }

  return {
    templateKey: availablePool[stableHash(input.slug) % availablePool.length],
    bucket: bucket.id,
  };
}

export function resolveBlogImageSet(input: BlogImageInput): BlogImageResolution {
  const explicitTemplateKey = getExplicitTemplateKey(input);

  if (explicitTemplateKey && heroesByTemplateKey.has(explicitTemplateKey) && ogByTemplateKey.has(explicitTemplateKey)) {
    if (!OVERUSED_OR_GENERIC_TEMPLATE_KEYS.has(explicitTemplateKey)) {
      return {
        hero: heroesByTemplateKey.get(explicitTemplateKey)!,
        og: ogByTemplateKey.get(explicitTemplateKey)!,
        placeholder: getPlaceholderBySlug(input.slug).hero,
        strategy: 'explicit',
        templateKey: explicitTemplateKey,
      };
    }

    const rotated = getRotatedTemplateKey(input);
    if (rotated.templateKey) {
      return {
        hero: heroesByTemplateKey.get(rotated.templateKey)!,
        og: ogByTemplateKey.get(rotated.templateKey)!,
        placeholder: getPlaceholderBySlug(input.slug).hero,
        strategy: 'rotated',
        templateKey: rotated.templateKey,
        poolBucket: rotated.bucket,
      };
    }
  }

  const fallback = getPlaceholderBySlug(input.slug);

  return {
    hero: fallback.hero,
    og: fallback.og,
    placeholder: fallback.hero,
    strategy: 'placeholder',
  };
}

export function getBlogImagesForPost(input: BlogImageInput) {
  const result = resolveBlogImageSet(input);
  return { hero: result.hero, og: result.og };
}

export function getBlogImagesForPostCard(input: BlogImageInput) {
  return getBlogImagesForPost(input);
}

export function getBlogImagesForPostThumb(input: BlogImageInput) {
  return getBlogImagesForPost(input);
}
