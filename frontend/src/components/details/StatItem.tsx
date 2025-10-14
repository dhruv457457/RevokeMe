// src/components/details/StatItem.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  colorClass?: string;
  index: number;
}

const StatItem: React.FC<Props> = ({ icon, label, value, colorClass = 'text-white', index }) => {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="bg-gray-800 p-2 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`text-lg font-bold ${colorClass}`}>{value}</p>
      </div>
    </motion.div>
  );
};

export default StatItem;