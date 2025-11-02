import React from 'react';
import { Candidate } from '../types.ts';

interface CandidateCardProps {
  candidate: Candidate;
  onSelect: (id: number) => void;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(candidate.id)}
      className="group p-4 bg-white rounded-lg border border-slate-200 hover:border-brand-primary hover:shadow-md cursor-pointer transition-all duration-200 flex justify-between items-start"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-3">
            <h4 className="font-semibold text-brand-dark truncate">{candidate.name}</h4>
            <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{candidate.years_of_experience} yrs exp</span>
        </div>
        <p className="text-sm text-slate-500 truncate">{candidate.email}</p>
        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
          {candidate.ai_summary}
        </p>
      </div>
       <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
        </div>
    </div>
  );
};