"use client";

interface TimingDisplayProps {
  timing: [string, string];
  showIcon?: boolean;
}

export function TimingDisplay({ timing, showIcon = true }: TimingDisplayProps) {
  const [startDate, endDate] = timing;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const isSameDay = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start.toDateString() === end.toDateString();
  };
  
  const getDaysDifference = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const getTimingDescription = () => {
    const daysDiff = getDaysDifference();
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Tomorrow';
    if (daysDiff <= 7) return `Within ${daysDiff} days`;
    if (daysDiff <= 30) return `Within ${Math.ceil(daysDiff / 7)} weeks`;
    if (daysDiff <= 365) return `Within ${Math.ceil(daysDiff / 30)} months`;
    return `Within ${Math.ceil(daysDiff / 365)} years`;
  };
  
  return (
    <div className="flex items-center space-x-1">
      {showIcon && <span className="text-yellow-400">⏰</span>}
      
      <span className="text-xs text-yellow-200 font-medium">
        {isSameDay() ? (
          formatDate(startDate)
        ) : (
          `${formatDate(startDate)} - ${formatDate(endDate)}`
        )}
      </span>
      
      <span className="text-xs text-gray-400">
        ({getTimingDescription()})
      </span>
    </div>
  );
} 