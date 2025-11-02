import React, { useState } from 'react';
import ResumeUpload from './components/ResumeUpload';
import SemanticSearch from './components/SemanticSearch';
import CandidateProfile from './components/CandidateProfile';
import { Candidate, User } from './types';
import { Header } from './components/Header';
import { ToastContainer, Toast } from './components/Toast';
import CandidateList from './components/CandidateList';
import AdminPanel from './components/AdminPanel';

interface AppProps {
  user: User;
  onLogout: () => void;
}

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [view, setView] = useState<'dashboard' | 'list' | 'admin'>('dashboard');

  const handleSearch = (results: Candidate[]) => {
    setSearchResults(results);
    setSelectedCandidateId(null); // Clear profile view on new search
  };

  const handleSelectCandidate = (id: number) => {
    setSelectedCandidateId(id);
  };
  
  const handleUploadSuccess = (newCandidate: Candidate) => {
    setSearchResults(prev => [newCandidate, ...prev]);
    setSelectedCandidateId(newCandidate.id);
    setToast({ message: 'Resume uploaded and processed successfully!', type: 'success' });
  };
  
  const handleUploadError = (errorMessage: string) => {
      setToast({ message: errorMessage, type: 'error' });
  };

  const handleSelectCandidateFromList = (id: number) => {
    // For the list view, just set the ID. The view itself won't change.
    setSelectedCandidateId(id);
  };


  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header user={user} currentView={view} onSetView={setView} onLogout={onLogout} />
      <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              <ResumeUpload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
              <SemanticSearch onSearch={handleSearch} onSelectCandidate={handleSelectCandidate} searchResults={searchResults} />
            </div>
            <div className="lg:col-span-8">
              <CandidateProfile candidateId={selectedCandidateId} />
            </div>
          </div>
        )}
        {view === 'list' && (
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className={`transition-all duration-300 ease-in-out ${selectedCandidateId ? "lg:col-span-5" : "lg:col-span-12"}`}>
              <CandidateList onSelectCandidate={handleSelectCandidateFromList} selectedCandidateId={selectedCandidateId}/>
            </div>
            {selectedCandidateId && (
              <div className="lg:col-span-7">
                <CandidateProfile 
                  candidateId={selectedCandidateId} 
                  onClose={() => setSelectedCandidateId(null)} 
                />
              </div>
            )}
          </div>
        )}
        {view === 'admin' && user.isAdmin && (
           <div>
            <AdminPanel />
          </div>
        )}
      </main>
      <ToastContainer>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </ToastContainer>
    </div>
  );
};

export default App;