/**
 * SEO Content Generation API
 *
 * POST /api/seo/generate - Generate new SEO content
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSEOContent } from '@/lib/seo/content-generator';
import { z } from 'zod';

const GenerateSchema = z.object({
  contentType: z.enum(['location', 'topic', 'service', 'guide']),
  targetKeyword: z.string().min(3),
  location: z.string().optional(),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']).optional(),
  wordCount: z.number().min(500).max(5000).optional(),
  model: z.enum(['gpt-4o-mini', 'claude-sonnet']).optional(),
  publishImmediately: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin
    const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
    if (!adminIds.includes(user.id)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = GenerateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error },
        { status: 400 }
      );
    }

    const params = validationResult.data;

    // Generate content using AI
    const generatedContent = await generateSEOContent({
      contentType: params.contentType,
      targetKeyword: params.targetKeyword,
      location: params.location,
      jurisdiction: params.jurisdiction || 'england-wales',
      wordCount: params.wordCount || 1500,
      model: params.model || 'gpt-4o-mini',
      includeSchema: true,
    });

    // Save to database
    const { data: seoPage, error } = await supabase
      .from('seo_pages')
      .insert({
        slug: generatedContent.slug,
        title: generatedContent.title,
        meta_description: generatedContent.metaDescription,
        h1: generatedContent.h1,
        content: generatedContent.content,
        content_type: params.contentType,
        target_keyword: params.targetKeyword,
        secondary_keywords: generatedContent.secondaryKeywords,
        location: params.location,
        jurisdiction: params.jurisdiction || 'england-wales',
        word_count: generatedContent.wordCount,
        readability_score: generatedContent.readabilityScore,
        ai_quality_score: generatedContent.qualityScore,
        status: params.publishImmediately ? 'published' : 'draft',
        published_at: params.publishImmediately ? new Date().toISOString() : null,
        last_generated_by: 'ai',
        schema_markup: generatedContent.schemaMarkup,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving SEO page:', error);
      return NextResponse.json(
        { error: 'Failed to save SEO page', details: error.message },
        { status: 500 }
      );
    }

    // Log the generation
    await supabase.from('seo_automation_log').insert({
      task_type: 'content_generation',
      task_name: `Generate: ${params.targetKeyword}`,
      status: 'success',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      items_processed: 1,
      items_successful: 1,
      summary: `Generated ${generatedContent.wordCount} words for "${params.targetKeyword}"`,
      triggered_by: 'api',
      metadata: {
        slug: generatedContent.slug,
        quality_score: generatedContent.qualityScore,
        readability: generatedContent.readabilityScore,
      },
    });

    return NextResponse.json({
      success: true,
      page: seoPage,
      metrics: {
        wordCount: generatedContent.wordCount,
        readabilityScore: generatedContent.readabilityScore,
        qualityScore: generatedContent.qualityScore,
        secondaryKeywords: generatedContent.secondaryKeywords.length,
      },
    });
  } catch (error: any) {
    console.error('SEO generation error:', error);

    return NextResponse.json(
      { error: 'Failed to generate content', details: error.message },
      { status: 500 }
    );
  }
}
