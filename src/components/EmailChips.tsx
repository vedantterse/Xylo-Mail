import React, { useState, useRef, useEffect } from 'react';
import { X, AtSign, CornerDownLeft, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface EmailChipsProps {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  maxEmails: number;
}

export const EmailChips: React.FC<EmailChipsProps> = ({ emails, onEmailsChange, maxEmails }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddEmail = () => {
    const newEmail = inputValue.trim();
    if (newEmail && isValidEmail(newEmail) && !emails.includes(newEmail) && emails.length < maxEmails) {
      onEmailsChange([...emails, newEmail]);
      setInputValue('');
      setShowSuggestion(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
    if (e.key === 'Backspace' && inputValue === '' && emails.length > 0) {
      onEmailsChange(emails.slice(0, -1));
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    onEmailsChange(emails.filter(email => email !== emailToRemove));
  };

  useEffect(() => {
    if (isValidEmail(inputValue) && !emails.includes(inputValue) && emails.length < maxEmails) {
      const timer = setTimeout(() => setShowSuggestion(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowSuggestion(false);
    }
  }, [inputValue, emails, maxEmails]);

  useEffect(() => {
    if (inputValue.length > 0) {
      setIsDropdownOpen(true);
    }
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs md:text-sm font-medium text-foreground flex items-center gap-1.5">
          <AtSign className="h-3.5 w-3.5" />
          Recipients
        </label>
        <div 
          className="relative text-xs font-medium text-white/60 px-2 flex items-center gap-1 cursor-pointer"
          onClick={() => emails.length > 0 && setIsDropdownOpen(!isDropdownOpen)}
        >
          {emails.length} / {maxEmails}
          {emails.length > 0 && (
            <ChevronDown 
              size={14} 
              className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          )}
        </div>
      </div>
      
      <div 
        className="glass p-2 rounded-lg flex flex-wrap gap-2 items-center cursor-text"
        onClick={() => {
          inputRef.current?.focus();
          setIsDropdownOpen(true);
        }}
      >
        <div className="relative flex-grow min-w-[150px]">
          <input
            ref={inputRef}
            type="email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={emails.length === 0 ? 'Add recipient emails...' : ''}
            className="bg-transparent outline-none w-full text-sm placeholder:text-white/30 py-1 pr-8"
          />
          <AnimatePresence>
            {showSuggestion && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="suggestion-bubble-right"
              >
                Press Enter
              </motion.div>
            )}
          </AnimatePresence>
          {inputValue && (
            <button
              onClick={handleAddEmail}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-1"
              aria-label="Add email"
            >
              <CornerDownLeft size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {isDropdownOpen && emails.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-2 left-0 right-0 z-20 dropdown-card p-2 rounded-lg"
            >
              <ul className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {emails.map(email => (
                  <li key={email} className="email-dropdown-item">
                    <span className="truncate text-sm">{email}</span>
                    <button onClick={() => handleRemoveEmail(email)} className="text-white/50 hover:text-white transition-colors flex-shrink-0">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};