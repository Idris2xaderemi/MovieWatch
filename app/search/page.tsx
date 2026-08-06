import { Suspense } from 'react';
import SearchContent from './SearchContent';

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}