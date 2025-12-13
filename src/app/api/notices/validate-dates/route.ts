/**
 * API endpoint for validating notice dates
 *
 * Returns 422 if dates are invalid with precise error messages
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateSection8ExpiryDate,
  validateSection21ExpiryDate,
  validateNoticeToLeaveDate,
  type Section8DateParams,
  type Section21DateParams,
  type NoticeToLeaveDateParams,
} from '@/lib/documents/notice-date-calculator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface ValidateSection8Request {
  notice_type: 'section_8';
  proposed_date: string;
  params: Section8DateParams;
}

interface ValidateSection21Request {
  notice_type: 'section_21';
  proposed_date: string;
  params: Section21DateParams;
}

interface ValidateNoticeToLeaveRequest {
  notice_type: 'notice_to_leave';
  proposed_date: string;
  params: NoticeToLeaveDateParams;
}

type ValidateRequest = ValidateSection8Request | ValidateSection21Request | ValidateNoticeToLeaveRequest;

// ============================================================================
// POST HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    const body: ValidateRequest = await req.json();

    const { notice_type, proposed_date } = body;

    let validationResult;

    switch (notice_type) {
      case 'section_8': {
        const { params } = body as ValidateSection8Request;
        validationResult = validateSection8ExpiryDate(proposed_date, params);
        break;
      }

      case 'section_21': {
        const { params } = body as ValidateSection21Request;
        validationResult = validateSection21ExpiryDate(proposed_date, params);
        break;
      }

      case 'notice_to_leave': {
        const { params } = body as ValidateNoticeToLeaveRequest;
        validationResult = validateNoticeToLeaveDate(proposed_date, params);
        break;
      }

      default:
        return NextResponse.json(
          {
            error: 'Invalid notice_type. Must be one of: section_8, section_21, notice_to_leave',
          },
          { status: 400 }
        );
    }

    // If invalid, return 422 with errors
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          valid: false,
          errors: validationResult.errors,
          earliest_valid_date: validationResult.earliest_valid_date,
          suggested_date: validationResult.suggested_date,
        },
        { status: 422 }
      );
    }

    // Valid date
    return NextResponse.json(
      {
        valid: true,
        message: 'The proposed date is legally valid',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Date validation error:', error);
    return NextResponse.json(
      {
        error: 'Date validation failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET HANDLER (Calculate auto date)
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const noticeType = searchParams.get('notice_type');

    if (!noticeType) {
      return NextResponse.json(
        {
          error: 'notice_type query parameter is required',
        },
        { status: 400 }
      );
    }

    // For GET, we'd need to pass params via query string which is complex
    // Instead, this endpoint is primarily for POST validation
    // Calculation is done in the generators themselves

    return NextResponse.json(
      {
        message: 'Use POST to validate dates. Auto-calculation is done by the document generators.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Date calculation error:', error);
    return NextResponse.json(
      {
        error: 'Date calculation failed',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
