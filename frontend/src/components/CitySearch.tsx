import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { API_BASE_URL } from '../lib/utils';

interface City {
  name: string;
  country: string;
  admin?: string;
  lat: number;
  lon: number;
}

interface CitySearchProps {
  onSelectCity: (city: City) => void;
  currentCity?: string;
}

export const CitySearch: React.FC<CitySearchProps> = ({ onSelectCity, currentCity }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`${API_BASE_URL}/api/search?q=${query}`);
          const data = await response.json();
          if (data.status === 'success') {
            setResults(data.data);
            setIsOpen(true);
          }
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="relative w-full max-w-md mx-auto z-50" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-zinc-400 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
          )}
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2.5 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/20 focus:border-zinc-300 dark:focus:border-zinc-700 transition-all backdrop-blur-md"
          placeholder={currentCity ? `Current: ${currentCity}` : "Search city (e.g. London, Tokyo)..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {results.map((city, index) => (
              <button
                key={`${city.lat}-${city.lon}-${index}`}
                className="w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-start gap-3 transition-colors group"
                onClick={() => {
                  onSelectCity(city);
                  setQuery('');
                  setIsOpen(false);
                }}
              >
                <div className="mt-1 p-1.5 bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 rounded-lg transition-colors">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{city.name}</div>
                  <div className="text-xs text-zinc-500">
                    {city.admin ? `${city.admin}, ` : ''}{city.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
