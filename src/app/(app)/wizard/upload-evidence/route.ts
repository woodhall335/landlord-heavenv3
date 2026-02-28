// src/app/wizard/upload-evidence/route.ts
// Thin wrapper that re-uses the canonical API implementation.
//
// This keeps any legacy /wizard/upload-evidence calls working,
// but ensures all logic lives in one place.

export { POST } from '@/app/api/wizard/upload-evidence/route';
