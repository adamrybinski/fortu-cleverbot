
import React from 'react';
import { Sparkles } from 'lucide-react';

export const MainEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <Sparkles className="w-16 h-16 text-[#6EFFC6] mx-auto mb-4" />
      <h3 className="text-lg font-medium text-[#003079] mb-2">
        Ready to explore questions?
      </h3>
      <p className="text-[#1D253A]/70">
        Click "Generate Questions" to discover relevant insights for your challenge.
      </p>
    </div>
  );
};
