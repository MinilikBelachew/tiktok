import React from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Interface to define the prop types for the StatCard component.
 */
interface StatCardProps {
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  title: string;
  value: string;
}

/**
 * A reusable card component for displaying a single statistic.
 *
 * @param {StatCardProps} props - The component props.
 */
const StatCard: React.FC<StatCardProps> = ({ icon: Icon, iconBgColor, iconColor, title, value }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-3xl p-4 flex-1">
      <div className="flex flex-col items-center space-y-3">
        {/* Icon Container with dynamic colors */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
        <div className="text-center">
          <p className="text-xl text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-[#1e2a4a]">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
