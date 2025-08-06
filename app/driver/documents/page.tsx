// app/driver/documents/page.tsx
'use client';
import { Suspense } from 'react';
import Documents from "@/components/driver/Documents";

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <Suspense fallback={<div>Loading documents...</div>}>
        <Documents />
      </Suspense>
    </div>
  );
}