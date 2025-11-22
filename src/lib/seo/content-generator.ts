/**
 * SEO Content Generator
 *
 * AI-powered content generation for SEO landing pages
 * Supports:
 * - Location-based pages (e.g., "Section 21 Notice London")
 * - Topic pages (e.g., "How to Evict a Tenant")
 * - Service pages (e.g., "HMO Licensing Guide")
 * - Content refreshes (updating existing pages)
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ContentGenerationParams {
  contentType: 'location' | 'topic' | 'service' | 'guide';
  targetKeyword: string;
  location?: string;
  jurisdiction?: 'england-wales' | 'scotland' | 'northern-ireland';
  wordCount?: number;
  model?: 'gpt-4o-mini' | 'claude-sonnet';
  includeSchema?: boolean;
}

export interface GeneratedContent {
  title: string;
  metaDescription: string;
  h1: string;
  content: string;
  slug: string;
  secondaryKeywords: string[];
  wordCount: number;
  readabilityScore: number;
  qualityScore: number;
  schemaMarkup?: any;
}

/**
 * Generate SEO-optimized content using AI
 */
export async function generateSEOContent(
  params: ContentGenerationParams
): Promise<GeneratedContent> {
  const {
    contentType,
    targetKeyword,
    location,
    jurisdiction = 'england-wales',
    wordCount = 1500,
    model = 'gpt-4o-mini',
    includeSchema = true,
  } = params;

  // Build the AI prompt
  const prompt = buildContentPrompt(params);

  // Generate content using selected model
  let rawContent: string;

  if (model === 'gpt-4o-mini') {
    rawContent = await generateWithOpenAI(prompt, wordCount);
  } else {
    rawContent = await generateWithClaude(prompt, wordCount);
  }

  // Parse and structure the generated content
  const structured = parseGeneratedContent(rawContent);

  // Generate slug
  const slug = generateSlug(targetKeyword, location);

  // Calculate quality metrics
  const wordCountActual = countWords(structured.content);
  const readabilityScore = calculateReadability(structured.content);
  const qualityScore = assessQuality(structured, params);

  // Generate schema markup if requested
  let schemaMarkup;
  if (includeSchema) {
    schemaMarkup = generateSchemaMarkup({
      type: contentType,
      title: structured.title,
      description: structured.metaDescription,
      keyword: targetKeyword,
      location,
      jurisdiction,
    });
  }

  return {
    title: structured.title,
    metaDescription: structured.metaDescription,
    h1: structured.h1,
    content: structured.content,
    slug,
    secondaryKeywords: extractKeywords(structured.content, targetKeyword),
    wordCount: wordCountActual,
    readabilityScore,
    qualityScore,
    schemaMarkup,
  };
}

/**
 * Build AI prompt for content generation
 */
function buildContentPrompt(params: ContentGenerationParams): string {
  const { contentType, targetKeyword, location, jurisdiction, wordCount } = params;

  const jurisdictionInfo = getJurisdictionInfo(jurisdiction!);

  let prompt = `You are an expert UK landlord law content writer. Generate comprehensive, SEO-optimized content for Landlord Heaven.

TARGET KEYWORD: "${targetKeyword}"
${location ? `LOCATION: ${location}` : ''}
JURISDICTION: ${jurisdictionInfo.name}
CONTENT TYPE: ${contentType}
WORD COUNT: Approximately ${wordCount} words

REQUIREMENTS:
1. Write in clear, professional UK English
2. Focus on ${jurisdictionInfo.name} landlord law and procedures
3. Include practical, actionable advice
4. Use the target keyword naturally (keyword density: 1-2%)
5. Include relevant legal references and acts
6. Structure with clear headings (H2, H3)
7. Be authoritative but accessible
8. Include a clear call-to-action at the end

STRUCTURE:
1. Engaging introduction (include target keyword in first paragraph)
2. Main content sections with descriptive H2 headings
3. Practical examples and scenarios
4. Key takeaways or summary
5. Clear CTA directing to our services

${location ? `LOCATION-SPECIFIC: Include ${location}-specific information, local councils, and relevant local considerations.` : ''}

FORMAT YOUR RESPONSE AS:
---TITLE---
[SEO-optimized title with keyword, max 60 characters]

---META---
[Compelling meta description with keyword, 150-160 characters]

---H1---
[Clear H1 heading with keyword]

---CONTENT---
[Full article content in markdown format]

Begin now:`;

  return prompt;
}

/**
 * Generate content using OpenAI GPT-4o-mini
 */
async function generateWithOpenAI(prompt: string, targetWords: number): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert UK landlord law content writer specializing in SEO-optimized legal content.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: Math.min(targetWords * 2, 4000), // Estimate tokens
    temperature: 0.7,
  });

  return completion.choices[0].message.content || '';
}

/**
 * Generate content using Claude Sonnet
 */
async function generateWithClaude(prompt: string, targetWords: number): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: Math.min(targetWords * 2, 4000),
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  return content.type === 'text' ? content.text : '';
}

/**
 * Parse generated content into structured format
 */
function parseGeneratedContent(raw: string): {
  title: string;
  metaDescription: string;
  h1: string;
  content: string;
} {
  const titleMatch = raw.match(/---TITLE---\s*\n(.*?)\n/s);
  const metaMatch = raw.match(/---META---\s*\n(.*?)\n/s);
  const h1Match = raw.match(/---H1---\s*\n(.*?)\n/s);
  const contentMatch = raw.match(/---CONTENT---\s*\n([\s\S]*)/);

  return {
    title: titleMatch?.[1]?.trim() || 'Untitled',
    metaDescription: metaMatch?.[1]?.trim() || '',
    h1: h1Match?.[1]?.trim() || '',
    content: contentMatch?.[1]?.trim() || '',
  };
}

/**
 * Generate URL slug from keyword and location
 */
function generateSlug(keyword: string, location?: string): string {
  let slug = keyword.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (location) {
    const locationSlug = location.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    slug = `${slug}-${locationSlug}`;
  }

  return slug;
}

/**
 * Extract secondary keywords from content
 */
function extractKeywords(content: string, primaryKeyword: string): string[] {
  // Simple keyword extraction (can be enhanced with NLP)
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);

  const wordFreq: Record<string, number> = {};

  // Count 2-3 word phrases
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (!stopWords.has(words[i])) {
      wordFreq[phrase] = (wordFreq[phrase] || 0) + 1;
    }
  }

  // Sort by frequency and filter
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword]) => keyword)
    .filter(kw => kw !== primaryKeyword.toLowerCase());

  return keywords.slice(0, 5);
}

/**
 * Count words in content
 */
function countWords(content: string): number {
  return content.trim().split(/\s+/).length;
}

/**
 * Calculate readability score (Flesch Reading Ease)
 */
function calculateReadability(content: string): number {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = content.split(/\s+/).filter(w => w.trim().length > 0);
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0);

  if (sentences.length === 0 || words.length === 0) return 0;

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Flesch Reading Ease formula
  const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Count syllables in a word (simplified)
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Assess overall content quality
 */
function assessQuality(
  content: { title: string; metaDescription: string; content: string },
  params: ContentGenerationParams
): number {
  let score = 100;

  // Check title length
  if (content.title.length > 60) score -= 10;
  if (content.title.length < 30) score -= 10;

  // Check meta description length
  if (content.metaDescription.length > 160 || content.metaDescription.length < 140) score -= 10;

  // Check keyword presence in title
  if (!content.title.toLowerCase().includes(params.targetKeyword.toLowerCase())) score -= 20;

  // Check word count
  const wordCount = countWords(content.content);
  if (wordCount < (params.wordCount || 1500) * 0.8) score -= 15;

  // Check readability
  const readability = calculateReadability(content.content);
  if (readability < 40 || readability > 70) score -= 10;

  return Math.max(0, score);
}

/**
 * Generate Schema.org structured data
 */
function generateSchemaMarkup(params: {
  type: string;
  title: string;
  description: string;
  keyword: string;
  location?: string;
  jurisdiction?: string;
}): any {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: params.title,
    description: params.description,
    author: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Landlord Heaven',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
    },
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
  };

  // Add location-specific schema if applicable
  if (params.location) {
    return {
      ...baseSchema,
      '@type': 'LocalBusiness',
      name: `${params.keyword} - ${params.location}`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: params.location,
        addressCountry: 'GB',
      },
    };
  }

  return baseSchema;
}

/**
 * Get jurisdiction-specific information
 */
function getJurisdictionInfo(jurisdiction: string): { name: string; legalSystem: string } {
  const jurisdictions = {
    'england-wales': {
      name: 'England & Wales',
      legalSystem: 'Housing Act 1988, Section 8, Section 21',
    },
    'scotland': {
      name: 'Scotland',
      legalSystem: 'Private Housing (Tenancies) (Scotland) Act 2016, Private Residential Tenancies',
    },
    'northern-ireland': {
      name: 'Northern Ireland',
      legalSystem: 'Private Tenancies (Northern Ireland) Order 2006',
    },
  };

  return jurisdictions[jurisdiction as keyof typeof jurisdictions] || jurisdictions['england-wales'];
}

/**
 * Refresh existing content (update with latest information)
 */
export async function refreshContent(
  existingContent: string,
  params: ContentGenerationParams
): Promise<GeneratedContent> {
  const prompt = `You are refreshing existing SEO content for Landlord Heaven. Update the content below with:
1. Latest legal information and updates
2. Improved SEO optimization
3. Better structure and readability
4. Current year references

EXISTING CONTENT:
${existingContent}

TARGET KEYWORD: ${params.targetKeyword}
${params.location ? `LOCATION: ${params.location}` : ''}

Provide the refreshed content in the same format:
---TITLE---
---META---
---H1---
---CONTENT---`;

  return generateSEOContent({ ...params, model: 'gpt-4o-mini' });
}
