"use client";

interface ConfidenceMeterProps {
  confidence: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({ confidence, size = 'sm' }: ConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100);
  
  // Determine color based on confidence level
  const getColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.6) return 'bg-yellow-500';
    if (conf >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Determine size classes
  const sizeClasses = {
    sm: 'w-16 h-2 text-xs',
    md: 'w-24 h-3 text-sm',
    lg: 'w-32 h-4 text-base'
  };
  
  const barSizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  return (
    <div className="flex items-center space-x-2">
      {/* Progress bar */}
      <div className={`${sizeClasses[size]} bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`${getColor(confidence)} ${barSizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Percentage text */}
      <span className={`text-yellow-200 font-semibold ${sizeClasses[size].split(' ')[1]}`}>
        {percentage}%
      </span>
    </div>
  );
} 