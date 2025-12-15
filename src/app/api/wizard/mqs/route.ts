/**
 * MQS Loading API Route
 * Server-side only - no client-side fs operations
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export async function POST(request: Request) {
  try {
    const { caseId, propertyLocation, jurisdiction, product } = await request.json();

    // Determine MQS file
    let mqsFile: string;

    if (jurisdiction === 'scotland') {
      mqsFile = 'scotland.yaml';
    } else if (propertyLocation === 'wales') {
      mqsFile = 'wales.yaml';
    } else {
      mqsFile = 'england.yaml';
    }

    // Load server-side
    const mqsPath = path.join(process.cwd(), 'config', 'mqs', product || 'notice_only', mqsFile);

    const content = await fs.readFile(mqsPath, 'utf-8');
    const mqs = yaml.load(content) as any;

    console.log(`[MQS-API] Loaded ${mqsFile} for ${propertyLocation || jurisdiction}`);

    return NextResponse.json({
      questions: mqs.questions,
      jurisdiction: mqs.jurisdiction,
      legal_framework: mqs.legal_framework,
      tenancy_type: mqs.tenancy_type,
      file_loaded: mqsFile,
    });
  } catch (error: any) {
    console.error('[MQS-API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load MQS', details: error.message },
      { status: 500 }
    );
  }
}
