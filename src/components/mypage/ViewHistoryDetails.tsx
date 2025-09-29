import React from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { formatViewDate } from '@/utils/date-format';
import { ViewHistoryDetail } from '@/types/view-history';

interface ViewHistoryDetailsProps {
  itemId: string;
  viewHistory: ViewHistoryDetail;
  isOpen: boolean;
  toggleHistory: (itemId: string) => void;
  buttonText?: string;
}

export const ViewHistoryDetails: React.FC<ViewHistoryDetailsProps> = ({
  itemId,
  viewHistory,
  isOpen,
  toggleHistory,
  buttonText = '閲覧履歴を見る'
}) => {
  return (
    <div className="mt-auto border-t">
      <button 
        onClick={() => toggleHistory(itemId)}
        className="w-full p-2 text-xs flex items-center justify-between text-gray-600 hover:bg-gray-100"
        aria-expanded={isOpen}
      >
        <span>{buttonText}</span>
        {isOpen ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      
      {isOpen && (
        <div className="p-2 bg-gray-50 text-xs space-y-1 max-h-32 overflow-y-auto">
          {viewHistory.dates.map((date, index) => (
            <div key={index} className="flex justify-between">
              <span>閲覧 {index + 1}</span>
              <span>{formatViewDate(date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
