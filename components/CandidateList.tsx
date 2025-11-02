import React, { useState, useEffect, useMemo } from 'react';
import { getAllCandidates } from '../services/api';
import { Candidate, CandidateNotes } from '../types';
import { SpinnerIcon } from './IconComponents';

const INITIAL_ROLES = ['SWE', 'SE', 'CLOUD SWE', 'CLOUD ARCH', 'DBA', 'DBE', 'SA', 'DEVOPS'];

interface EnrichedCandidate extends Candidate {
    potentialRoles: string[];
}

interface CandidateListProps {
  onSelectCandidate: (id: number) => void;
  selectedCandidateId: number | null;
}

const CandidateList: React.FC<CandidateListProps> = ({ onSelectCandidate, selectedCandidateId }) => {
  const [allCandidates, setAllCandidates] = useState<EnrichedCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  
  // Filters
  const [experienceFilter, setExperienceFilter] = useState<string>('any');
  const [roleFilter, setRoleFilter] = useState<string[]>([]);

  useEffect(() => {
    const fetchAndPrepareData = async () => {
      setIsLoading(true);

      // Fetch available roles from localStorage
      const savedRolesRaw = localStorage.getItem('rms-available-roles');
      if (savedRolesRaw) {
        try {
            setAvailableRoles(JSON.parse(savedRolesRaw));
        } catch(e) {
            setAvailableRoles(INITIAL_ROLES);
        }
      } else {
        setAvailableRoles(INITIAL_ROLES);
      }

      // Fetch candidates and enrich them with notes
      const candidates = await getAllCandidates();
      const enrichedCandidates = candidates.map(c => {
          const savedNotesRaw = localStorage.getItem(`rms-notes-${c.id}`);
          let potentialRoles: string[] = [];
          if (savedNotesRaw) {
              try {
                  const notes: CandidateNotes = JSON.parse(savedNotesRaw);
                  potentialRoles = notes.potentialRoles || [];
              } catch(e) { /* ignore parse error */ }
          }
          return { ...c, potentialRoles };
      });
      setAllCandidates(enrichedCandidates);
      setIsLoading(false);
    };
    fetchAndPrepareData();
  }, []);

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(prev => 
        prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const filteredCandidates = useMemo(() => {
    let candidates: EnrichedCandidate[] = [...allCandidates];
    
    // Experience filter
    if (experienceFilter !== 'any') {
      const [min, max] = experienceFilter.split('-').map(Number);
      candidates = candidates.filter(c => {
        if (!max) return c.years_of_experience >= min; // for 10+
        return c.years_of_experience >= min && c.years_of_experience <= max;
      });
    }

    // Role filter
    if (roleFilter.length > 0) {
      candidates = candidates.filter(c =>
        roleFilter.some(filterRole => c.potentialRoles.includes(filterRole))
      );
    }

    return candidates;
  }, [allCandidates, experienceFilter, roleFilter]);

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex justify-center items-center min-h-[400px]">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Candidate Directory</h2>
        
        {/* Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {/* Experience Filter */}
            <div className="flex-1">
                <label htmlFor="experience-filter" className="block text-sm font-medium text-slate-700 mb-1">Years of Experience</label>
                <select id="experience-filter" value={experienceFilter} onChange={e => setExperienceFilter(e.target.value)} className="w-full px-3 py-2 border bg-white border-slate-300 rounded-md focus:ring-brand-primary focus:border-brand-primary transition">
                    <option value="any">Any</option>
                    <option value="0-2">0 - 2 Years</option>
                    <option value="3-5">3 - 5 Years</option>
                    <option value="6-10">6 - 10 Years</option>
                    <option value="11-999">10+ Years</option>
                </select>
            </div>
            {/* Role Filter */}
            <div className="flex-[3]">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Potential Roles</label>
                 <div className="flex flex-wrap gap-2">
                    {availableRoles.map(role => (
                        <button key={role} onClick={() => handleRoleFilterChange(role)} className={`px-3 py-1 text-sm rounded-full border transition-colors ${roleFilter.includes(role) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}>
                            {role}
                        </button>
                    ))}
                 </div>
            </div>
        </div>

        {/* Candidate Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="p-3 font-semibold text-sm text-slate-600 w-1/4">Name</th>
                        <th className="p-3 font-semibold text-sm text-slate-600 w-1/6">Experience</th>
                        <th className="p-3 font-semibold text-sm text-slate-600 w-1/4">Potential Roles</th>
                        <th className="p-3 font-semibold text-sm text-slate-600 w-1/3">AI Summary</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCandidates.map(c => (
                        <tr key={c.id} 
                            onClick={() => onSelectCandidate(c.id)} 
                            className={`border-b border-slate-200 cursor-pointer transition-colors ${selectedCandidateId === c.id ? 'bg-brand-light' : 'hover:bg-blue-50/50'}`}>
                            <td className="p-3 align-top">
                                <div className="font-medium text-brand-dark">{c.name}</div>
                                <div className="text-sm text-slate-500">{c.email}</div>
                            </td>
                            <td className="p-3 text-sm text-slate-600 align-top">{c.years_of_experience} years</td>
                            <td className="p-3 align-top">
                                <div className="flex flex-wrap gap-1">
                                    {c.potentialRoles.map(role => (
                                        <span key={role} className="bg-slate-200 text-slate-800 text-xs font-medium px-2 py-0.5 rounded-full">{role}</span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-3 text-sm text-slate-600 align-top line-clamp-2">{c.ai_summary}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {filteredCandidates.length === 0 && (
                 <div className="text-center py-12 text-slate-500">
                    <h3 className="font-semibold text-lg">No candidates found</h3>
                    <p>Try adjusting your filters to find the perfect match.</p>
                 </div>
            )}
        </div>
    </div>
  );
};

export default CandidateList;