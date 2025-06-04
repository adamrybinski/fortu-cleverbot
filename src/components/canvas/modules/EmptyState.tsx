
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  message, 
  iconColor = 'text-[#6EFFC6]' 
}) => {
  return (
    <div className="text-center py-8 text-[#1D253A]/60">
      <Icon className={`w-12 h-12 mx-auto mb-2 ${iconColor}`} />
      <p>{message}</p>
    </div>
  );
};
