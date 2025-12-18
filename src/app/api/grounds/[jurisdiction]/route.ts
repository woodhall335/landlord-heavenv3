/**
 * API endpoint to fetch jurisdiction-specific grounds for eviction notices
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { jurisdiction: string } }
) {
  try {
    const { jurisdiction } = params;

    // Validate jurisdiction
    const validJurisdictions = ['england', 'wales', 'scotland'];
    if (!validJurisdictions.includes(jurisdiction)) {
      return NextResponse.json(
        { error: 'Invalid jurisdiction' },
        { status: 400 }
      );
    }

    // Build path to grounds directory
    const groundsDir = path.join(
      process.cwd(),
      'config',
      'jurisdictions',
      'uk',
      jurisdiction,
      'grounds'
    );

    // Check if directory exists
    if (!fs.existsSync(groundsDir)) {
      return NextResponse.json(
        { error: 'Grounds not found for jurisdiction' },
        { status: 404 }
      );
    }

    // Read all ground files
    const files = fs.readdirSync(groundsDir);
    const grounds = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const filePath = path.join(groundsDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(fileContent);
      })
      .sort((a, b) => {
        // Sort by ground number/code
        const aNum = parseInt(String(a.ground).replace(/[^0-9]/g, ''), 10) || 999;
        const bNum = parseInt(String(b.ground).replace(/[^0-9]/g, ''), 10) || 999;
        return aNum - bNum;
      });

    return NextResponse.json({
      jurisdiction,
      grounds,
    });
  } catch (error: any) {
    console.error('Error fetching grounds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grounds' },
      { status: 500 }
    );
  }
}
