import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md'
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-700',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs'
  };

  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${variants[variant]}
      ${sizes[size]}
    `}>
      {children}
    </span>
  );
};

// Confidence Badge
interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  const labels = {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig'
  };

  const variants: Record<typeof confidence, 'success' | 'warning' | 'error'> = {
    high: 'success',
    medium: 'warning',
    low: 'error'
  };

  return (
    <Badge variant={variants[confidence]} size="sm">
      {labels[confidence]}
    </Badge>
  );
};
