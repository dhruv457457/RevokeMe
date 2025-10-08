// src/components/ui/StatsCard.tsx
import React from 'react';

interface Props {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<Props> = ({ title, value, icon }) => {
  return (
    <div className="bg-[#0C0C0E] border border-[#333336] rounded-2xl p-4 flex items-center gap-4 h-full">
      <div className="bg-gray-800 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;