import React, { useState } from 'react';
import { searchCandidates } from '../services/api.ts';
import { Candidate } from '../types.ts';
import { SearchIcon, SpinnerIcon } from './IconComponents.tsx';
import { CandidateCard } from './CandidateCard.tsx';

interface SemanticSearchProps {
  onSearch: (results: Candidate[]) => void;
  onSelectCandidate: (id: number) => void;
  searchResults: Candidate[];
}

const SemanticSearch: React.FC<SemanticSearchProps> = ({ onSearch, onSelectCandidate, searchResults }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchCandidates(query);
      onSearch(results);
    } catch (error) {
      console.error('Search failed:', error);
      onSearch([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-700">Semantic Search</h2>
      <form onSubmit={handleSearch} className="flex space-x-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., Senior Java developer with AWS"
          className="flex-grow w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition"
          disabled={isSearching}
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isSearching ? <SpinnerIcon /> : <SearchIcon />}
        </button>
      </form>

      <div className="mt-6">
        <h3 className="text-lg font-medium text-slate-600 mb-3">Results</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {isSearching && searchResults.length === 0 && (
             <div className="text-center py-4 text-slate-500">Searching...</div>
          )}
          {!isSearching && searchResults.length === 0 && (
            <div className="text-center py-4 text-slate-500">No candidates found. Try a new search.</div>
          )}
          {searchResults.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} onSelect={onSelectCandidate} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SemanticSearch;