import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon } from './IconComponents';

interface RoleTaggerProps {
  roles: string[];
  availableRoles: string[];
  onChange: (newRoles: string[]) => void;
  onAddNewRole: (newRole: string) => void;
}

const RoleTagger: React.FC<RoleTaggerProps> = ({ roles, availableRoles, onChange, onAddNewRole }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This effect ensures the active suggestion is always visible in the list.
    if (activeSuggestionIndex > -1 && suggestionsRef.current?.children[activeSuggestionIndex]) {
      suggestionsRef.current.children[activeSuggestionIndex].scrollIntoView({
        block: 'nearest',
      });
    }
  }, [activeSuggestionIndex]);
  
  // Handles clicks outside the component to close the suggestion list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setSuggestions([]);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (inputValue.trim()) {
      const lowerInputValue = inputValue.toLowerCase();
      const filtered = availableRoles.filter(
        role =>
          !roles.includes(role) &&
          role.toLowerCase().includes(lowerInputValue)
      );
      
      const exactMatchExists = availableRoles.some(r => r.toLowerCase() === lowerInputValue);
      
      const newSuggestions: string[] = [...filtered];
      if (!exactMatchExists && inputValue.trim().length > 0) {
        newSuggestions.unshift(`Create "${inputValue.trim()}"`);
      }

      setSuggestions(newSuggestions);
      setActiveSuggestionIndex(-1); // Reset highlight when suggestions change

    } else {
      setSuggestions([]);
    }
  }, [inputValue, roles, availableRoles]);

  const addRole = (role: string) => {
    if (role && !roles.includes(role) && availableRoles.includes(role)) {
      onChange([...roles, role]);
    }
    setInputValue('');
    setSuggestions([]);
    setActiveSuggestionIndex(-1);
    inputRef.current?.focus();
  };
  
  const createAndAddRole = (newRole: string) => {
      if (newRole && !availableRoles.some(r => r.toLowerCase() === newRole.toLowerCase())) {
          onAddNewRole(newRole);
      }
      setInputValue('');
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
      inputRef.current?.focus();
  };

  const removeRole = (roleToRemove: string) => {
    onChange(roles.filter(role => role !== roleToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
            return;
        } 
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            return;
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            setSuggestions([]);
            return;
        }
    }
    
    if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        
        if (activeSuggestionIndex > -1 && suggestions[activeSuggestionIndex]) {
            handleSuggestionClick(suggestions[activeSuggestionIndex]);
        } else {
            // Default behavior if no suggestion is highlighted:
            // Prefer an exact match over creating a new one.
            const exactMatch = availableRoles.find(r => r.toLowerCase() === inputValue.trim().toLowerCase());
            if (exactMatch && !roles.includes(exactMatch)) {
                addRole(exactMatch);
            } else {
                createAndAddRole(inputValue.trim());
            }
        }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.startsWith('Create "')) {
      const newRole = suggestion.substring(8, suggestion.length - 1);
      createAndAddRole(newRole);
    } else {
      addRole(suggestion);
    }
  };

  return (
    <div ref={wrapperRef}>
      <label htmlFor="role-tagger" className="block text-sm font-medium text-gray-700">Potential Roles</label>
      <div className="relative mt-1">
        <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-brand-primary transition-shadow">
          {roles.map(role => (
            <span key={role} className="flex items-center bg-brand-primary text-white text-sm font-medium px-2 py-1 rounded-full">
              {role}
              <button
                type="button"
                onClick={() => removeRole(role)}
                className="ml-2 text-white hover:bg-brand-dark rounded-full p-0.5"
                aria-label={`Remove ${role}`}
              >
                <CloseIcon />
              </button>
            </span>
          ))}
          <input
            id="role-tagger"
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add or create a role..."
            className="flex-grow bg-transparent focus:outline-none p-1"
            aria-label="Add a potential role for the candidate"
            autoComplete="off"
          />
        </div>
        {suggestions.length > 0 && (
          <ul ref={suggestionsRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
                className={`px-4 py-2 cursor-pointer transition-colors ${
                  index === activeSuggestionIndex ? 'bg-brand-light' : ''
                }`}
              >
                {suggestion.startsWith('Create "') ? (
                    <span className="italic">{suggestion}</span>
                ) : (
                    suggestion
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoleTagger;