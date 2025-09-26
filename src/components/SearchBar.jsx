import React, { useState, useRef, useEffect } from 'react';

const sanitizeInput = (input) => {
  const div = document.createElement('div');
  div.innerText = input;
  return div.innerText
    .replace(/<[^>]+>/g, '')
    .replace(/[<>]/g, '')
    .replace(/["'`;(){}]/g, '')
    .trim();
};

const SearchBar = ({ value, onSearch }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [isBlocked, setIsBlocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const searchCountRef = useRef(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const triggerSearch = () => {
    if (isBlocked) return;

    const safe = sanitizeInput(inputValue);
    onSearch(safe);
    searchCountRef.current += 1;

    if (searchCountRef.current >= 15) {
      setIsBlocked(true);
      setRemainingTime(45);

      // Contador visible
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Desbloqueo total luego de 45 segundos
      timeoutRef.current = setTimeout(() => {
        setIsBlocked(false);
        searchCountRef.current = 0;
      }, 45000);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') triggerSearch();
  };

  const handleClick = () => {
    triggerSearch();
  };

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="searchbar-wrapper" style={{ display: 'flex', flexDirection: 'column',width:'50%', gap: '0.3rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          className="searchbar-input"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Buscar productos..."
          disabled={isBlocked}
          autoComplete="off"
          maxLength={100}
          inputMode="text"
          style={isBlocked ? { backgroundColor: '#fdd', color: '#555' } : {}}
        />
        <button
          onClick={handleClick}
          disabled={isBlocked}
          className="searchbar-button"
        >
          Buscar
        </button>
      </div>
      {isBlocked && (
        <span style={{ color: '#a00', fontSize: '0.9rem' }}>
          Buscador bloqueado. Espera {remainingTime} segundo{remainingTime !== 1 ? 's' : ''}...
        </span>
      )}
    </div>
  );
};

export default SearchBar;
