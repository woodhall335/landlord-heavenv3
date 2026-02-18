import { Suspense } from 'react';
import FreeSection21ToolClient from './FreeSection21ToolClient';

export default function FreeSection21ToolPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <FreeSection21ToolClient />
    </Suspense>
  );
}
