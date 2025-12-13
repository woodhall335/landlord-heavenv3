/**
 * SEO Daily Cron Job
 *
 * Triggered daily at 2am-6am
 * Processes content generation queue
 *
 * Usage: Call from Vercel Cron or external cron service
 * Authorization: Requires CRON_SECRET token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSEOContent } from '@/lib/seo/content-generator';
import {
  getSupabaseConfigForServerRuntime,
  warnSupabaseNotConfiguredOnce,
} from '@/lib/supabase/config';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseConfig = getSupabaseConfigForServerRuntime();
    if (!supabaseConfig || !supabaseConfig.serviceRoleKey) {
      warnSupabaseNotConfiguredOnce();
      throw new Error('Supabase not configured');
    }

    // Create Supabase admin client
    const supabase = createClient(
      supabaseConfig.url,
      supabaseConfig.serviceRoleKey
    );

    const startTime = new Date();

    // Get pending queue items (max 10 per day)
    const { data: queueItems, error: queueError } = await supabase
      .from('seo_content_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(10);

    if (queueError || !queueItems || queueItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items in queue',
        processed: 0,
      });
    }

    let successful = 0;
    let failed = 0;

    // Process each queue item
    for (const item of queueItems) {
      try {
        // Mark as processing
        await supabase
          .from('seo_content_queue')
          .update({ status: 'processing', started_at: new Date().toISOString() })
          .eq('id', item.id);

        // Generate content
        const content = await generateSEOContent({
          contentType: item.content_type.replace('_page', '') as any,
          targetKeyword: item.target_keyword,
          location: item.location,
          jurisdiction: item.jurisdiction as any,
          wordCount: item.word_count_target,
          model: item.ai_model as any,
          includeSchema: true,
        });

        // Save SEO page
        const { data: seoPage, error: pageError } = await supabase
          .from('seo_pages')
          .insert({
            slug: content.slug,
            title: content.title,
            meta_description: content.metaDescription,
            h1: content.h1,
            content: content.content,
            content_type: item.content_type.replace('_page', ''),
            target_keyword: item.target_keyword,
            secondary_keywords: content.secondaryKeywords,
            location: item.location,
            jurisdiction: item.jurisdiction,
            word_count: content.wordCount,
            readability_score: content.readabilityScore,
            ai_quality_score: content.qualityScore,
            status: content.qualityScore >= 70 ? 'published' : 'draft',
            published_at: content.qualityScore >= 70 ? new Date().toISOString() : null,
            last_generated_by: 'ai',
            schema_markup: content.schemaMarkup,
          })
          .select()
          .single();

        if (pageError) {
          throw new Error(`Failed to save page: ${pageError.message}`);
        }

        // Mark queue item as completed
        await supabase
          .from('seo_content_queue')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            generated_content: content.content.substring(0, 1000), // Store preview
            quality_score: content.qualityScore,
            page_id: seoPage.id,
          })
          .eq('id', item.id);

        successful++;
      } catch (error: any) {
        console.error(`Failed to process queue item ${item.id}:`, error);

        // Mark as failed
        await supabase
          .from('seo_content_queue')
          .update({
            status: 'failed',
            completed_at: new Date().toISOString(),
            error_message: error.message,
          })
          .eq('id', item.id);

        failed++;
      }
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Log the cron execution
    await supabase.from('seo_automation_log').insert({
      task_type: 'content_generation',
      task_name: 'Daily Content Generation',
      status: failed === 0 ? 'success' : 'partial',
      started_at: startTime.toISOString(),
      completed_at: endTime.toISOString(),
      duration,
      items_processed: successful + failed,
      items_successful: successful,
      items_failed: failed,
      summary: `Processed ${successful + failed} items: ${successful} successful, ${failed} failed`,
      triggered_by: 'cron',
    });

    return NextResponse.json({
      success: true,
      processed: successful + failed,
      successful,
      failed,
      duration,
    });
  } catch (error: any) {
    console.error('Daily SEO cron error:', error);

    return NextResponse.json(
      { error: 'Cron execution failed', details: error.message },
      { status: 500 }
    );
  }
}
