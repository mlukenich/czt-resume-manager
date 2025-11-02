import React, { useState, useEffect } from 'react';
import { getCandidateById } from '../services/api.ts';
import { Candidate, TechnicalSkills, WorkExperience, CandidateNotes } from '../types.ts';
import { SpinnerIcon, GithubIcon, LinkedInIcon, ExternalLinkIcon } from './IconComponents.tsx';
import RoleTagger from './RoleTagger.tsx';

// This is now just a default for the very first time the app is run
const INITIAL_ROLES = ['SWE', 'SE', 'CLOUD SWE', 'CLOUD ARCH', 'DBA', 'DBE', 'SA', 'DEVOPS'];

interface CandidateProfileProps {
  candidateId: number | null;
  onClose?: () => void;
}

const SkillBadge: React.FC<{ skill: string }> = ({ skill }) => (
  <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 mb-2 px-3 py-1 rounded-full">
    {skill}
  </span>
);

const ExperienceTimelineItem: React.FC<{ experience: WorkExperience; isLast: boolean }> = ({ experience, isLast }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-1 h-full">
      <div className="w-px bg-slate-300 h-full"></div>
      <div className="absolute top-0 -left-[5px] w-3 h-3 bg-white border-2 border-slate-300 rounded-full"></div>
    </div>
    <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
      <h4 className="font-semibold text-slate-800">{experience.job_title}</h4>
      <p className="text-slate-600">{experience.company}</p>
      <p className="text-sm text-slate-500">{experience.duration}</p>
    </div>
  </div>
);

const CandidateProfile: React.FC<CandidateProfileProps> = ({ candidateId, onClose }) => {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState<CandidateNotes>({
    salaryRange: '',
    potentialContracts: '',
    generalNotes: '',
    potentialRoles: [],
  });
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'skills' | 'experience'>('summary');

  useEffect(() => {
    // Load available roles from localStorage on initial component mount
    const savedRolesRaw = localStorage.getItem('rms-available-roles');
    if (savedRolesRaw) {
        try {
            const savedRoles = JSON.parse(savedRolesRaw);
            setAvailableRoles(savedRoles);
        } catch(e) {
            setAvailableRoles(INITIAL_ROLES);
        }
    } else {
        setAvailableRoles(INITIAL_ROLES);
        localStorage.setItem('rms-available-roles', JSON.stringify(INITIAL_ROLES));
    }
  }, []);

  useEffect(() => {
    const defaultNotes: CandidateNotes = { salaryRange: '', potentialContracts: '', generalNotes: '', potentialRoles: [] };
    if (candidateId === null) {
      setCandidate(null);
      setNotes(defaultNotes); // Clear notes when no candidate is selected
      return;
    }

    const fetchCandidate = async () => {
      setIsLoading(true);
      setActiveTab('summary'); // Reset to summary tab on new candidate
      const data = await getCandidateById(candidateId);
      setCandidate(data || null);
      
      // Load and parse notes from localStorage
      if (data) {
        const savedNotesRaw = localStorage.getItem(`rms-notes-${data.id}`);
        let loadedNotes = { ...defaultNotes };
        if (savedNotesRaw) {
          try {
            const parsed = JSON.parse(savedNotesRaw);
            if (typeof parsed === 'object' && parsed !== null) {
              loadedNotes = { ...defaultNotes, ...parsed };
            } else {
              loadedNotes.generalNotes = String(savedNotesRaw);
            }
          } catch (e) {
            loadedNotes.generalNotes = savedNotesRaw;
          }
        }
        setNotes(loadedNotes);
      } else {
        setNotes(defaultNotes);
      }
      
      setIsLoading(false);
    };

    fetchCandidate();
  }, [candidateId]);
  
  const handleNoteFieldChange = (field: keyof Omit<CandidateNotes, 'potentialRoles'>, value: string) => {
    const newNotes = { ...notes, [field]: value };
    setNotes(newNotes);
    if (candidateId) {
      localStorage.setItem(`rms-notes-${candidateId}`, JSON.stringify(newNotes));
    }
  };

  const handleRolesChange = (newRoles: string[]) => {
    const newNotes = { ...notes, potentialRoles: newRoles };
    setNotes(newNotes);
    if (candidateId) {
      localStorage.setItem(`rms-notes-${candidateId}`, JSON.stringify(newNotes));
    }
  };

  const handleAddNewRole = (newRole: string) => {
    if (!availableRoles.includes(newRole)) {
        const updatedAvailableRoles = [...availableRoles, newRole];
        setAvailableRoles(updatedAvailableRoles);
        localStorage.setItem('rms-available-roles', JSON.stringify(updatedAvailableRoles));
    }
    handleRolesChange([...notes.potentialRoles, newRole]);
  };


  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 flex justify-center items-center min-h-[400px]">
        <SpinnerIcon />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center min-h-[400px] flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.78-2.75 9.563M12 11c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-1.344 0-2.633-.263-3.832-.74M12 11a10.001 10.001 0 00-9.832 10.243" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-700">Select a Candidate</h3>
        <p className="text-slate-500 mt-2 max-w-sm">Upload a resume or search for a candidate to view their detailed profile here.</p>
      </div>
    );
  }

  const TabButton: React.FC<{ tabName: typeof activeTab, children: React.ReactNode }> = ({ tabName, children }) => (
      <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-brand-light text-brand-primary' : 'text-slate-500 hover:text-slate-800'}`}>
          {children}
      </button>
  );

  return (
    <div className="relative bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 animate-fade-in">
      {onClose && (
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors z-10"
          aria-label="Close candidate profile"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-start pb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">{candidate.name}</h2>
          <p className="text-md text-brand-secondary">{candidate.email}</p>
          {candidate.security_clearance && (
            <div className="mt-2">
                <p className="text-xs font-medium text-amber-800 bg-amber-100 inline-block px-2 py-0.5 rounded-full">Security Clearance: {candidate.security_clearance}</p>
            </div>
          )}
        </div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          {candidate.github_url && <a href={candidate.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800 transition-colors"><GithubIcon /></a>}
          {candidate.linkedin_url && <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-800 transition-colors"><LinkedInIcon /></a>}
          {candidate.original_resume_url && <a href={candidate.original_resume_url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-brand-primary hover:underline">View Resume <ExternalLinkIcon /></a>}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-2" aria-label="Tabs">
              <TabButton tabName="summary">Summary & Notes</TabButton>
              <TabButton tabName="skills">Skills</TabButton>
              <TabButton tabName="experience">Work Experience</TabButton>
          </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'summary' && (
          <div className="space-y-8 animate-fade-in">
             <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">AI At-a-Glance Summary</h3>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-md border border-slate-200">{candidate.ai_summary}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-700 mb-4">Private Notes & Roles</h3>
                <div className="space-y-4">
                    <RoleTagger roles={notes.potentialRoles} availableRoles={availableRoles} onChange={handleRolesChange} onAddNewRole={handleAddNewRole}/>
                    <div>
                        <label htmlFor="salaryRange" className="block text-sm font-medium text-slate-700">Salary Range</label>
                        <input type="text" id="salaryRange" value={notes.salaryRange} onChange={(e) => handleNoteFieldChange('salaryRange', e.target.value)} placeholder="e.g., $120k - $140k" className="mt-1 w-full bg-slate-50 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow" aria-label="Salary range for the candidate" />
                    </div>
                    <div>
                        <label htmlFor="potentialContracts" className="block text-sm font-medium text-slate-700">Potential Contracts / Projects</label>
                        <input type="text" id="potentialContracts" value={notes.potentialContracts} onChange={(e) => handleNoteFieldChange('potentialContracts', e.target.value)} placeholder="e.g., Project Phoenix, Apollo Initiative" className="mt-1 w-full bg-slate-50 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow" aria-label="Potential contracts for the candidate"/>
                    </div>
                    <div>
                        <label htmlFor="generalNotes" className="block text-sm font-medium text-slate-700">General Notes</label>
                        <textarea id="generalNotes" value={notes.generalNotes} onChange={(e) => handleNoteFieldChange('generalNotes', e.target.value)} placeholder="Add your general private notes here..." className="mt-1 w-full h-28 bg-slate-50 px-3 py-2 text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-shadow" aria-label="General private notes for the candidate"/>
                    </div>
                </div>
              </div>
          </div>
        )}
        {activeTab === 'skills' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Technical Skills</h3>
             <div className="space-y-6">
                  <div>
                      <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Languages</h4>
                      <div>{candidate.parsed_skills.programming_languages.map(s => <SkillBadge key={s} skill={s} />)}</div>
                  </div>
                  <div>
                      <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Frameworks & Libraries</h4>
                      <div>{candidate.parsed_skills.frameworks.map(s => <SkillBadge key={s} skill={s} />)}</div>
                  </div>
                  <div>
                      <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Databases</h4>
                      <div>{candidate.parsed_skills.databases.map(s => <SkillBadge key={s} skill={s} />)}</div>
                  </div>
                  <div>
                      <h4 className="font-semibold text-sm text-slate-500 uppercase tracking-wider mb-3">Platforms & Tools</h4>
                      <div>{candidate.parsed_skills.platforms_tools.map(s => <SkillBadge key={s} skill={s} />)}</div>
                  </div>
              </div>
          </div>
        )}
        {activeTab === 'experience' && (
           <div className="animate-fade-in">
              <h3 className="text-xl font-semibold text-slate-700 mb-6">Work Experience</h3>
              <div>
                {candidate.parsed_experience.map((exp, index) => (
                    <ExperienceTimelineItem key={index} experience={exp} isLast={index === candidate.parsed_experience.length - 1} />
                ))}
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default CandidateProfile;