import React, { useMemo, useState, useEffect } from 'react';
// import {actions} from '../App';

export default function FilterBar({
  trips,
  maxPrice, setMaxPrice,
  maxDays, setMaxDays,
  query, setQuery,
  sortBy, setSortBy,
  category, setCategory,
  country, setCountry,
  minRating, setMinRating,
  onReset,
  // dispatch
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);


  // Extract unique categories from trips 
  const categories = useMemo(() => {
    const set = new Set([]);
    (trips || []).forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [trips]);

  const suggestions = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return (trips || []).filter(t =>
      t.name.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query, trips]);

  const countries = useMemo(() => {
    const set = new Set([]);
    (trips || []).forEach(t => {
      const parts = (t.destination || '').split(',').map(s => s.trim());
      const c = parts.length ? parts[parts.length - 1] : 'Unknown';
      set.add(c || 'Unknown');
    });
    return Array.from(set).sort();
  }, [trips]);
 

  useEffect(() => { if (!query) setShowSuggestions(false); }, [query]);

  return (
    <div className={`bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden`}>
      {/* Search + suggestions */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            // onChange={(e)=>{setQuery(e.target.value);dispatch({type:actions.QUERY,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:e.target.value});  setShowSuggestions(true);}}
            placeholder="Search trips, names or destinations..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white border-slate-200 text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300`}
            onFocus={() => setShowSuggestions(!!query)}
            onBlur={() => setTimeout(()=>setShowSuggestions(false), 150)}
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-6-6M10 18a8 8 0 100-16 8 8 0 000 16z"/>
          </svg>

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-lg shadow-sm z-50 max-h-56 overflow-auto">
              {suggestions.map(s => (
                <li key={s.id} className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer" onMouseDown={() => { setQuery(s.name); setShowSuggestions(false); }}>
                  <div className="font-medium text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.destination}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 items-end">
          {/* Category */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Category</label>
            <select 
              value={category} 
              onChange={(e)=>setCategory(e.target.value)} 
              // onChange={(e)=>{setCategory(e.target.value); dispatch({type:actions.CATEGORY,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:e.target.value});}} 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
            <option value="All">All</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            
          </div>

          {/* Country */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Country</label>
            <select 
              value={country} 
              onChange={(e)=>setCountry(e.target.value)} 
              // onChange={(e)=>{setCountry(e.target.value); dispatch({type:actions.COUNTRY,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:e.target.value});}} 
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
            >
            <option value="All">All</option>
              {[...countries].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Budget range */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Budget (max)</label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="0" 
                max="5000" 
                step="50" 
                value={maxPrice} 
                onChange={(e)=>setMaxPrice(Number(e.target.value))} 
                // onChange={(e)=>{setMaxPrice(Number(e.target.value)); dispatch({type:actions.MAX_PRICE,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:Number(e.target.value)});}} 
                className="w-full accent-indigo-600" 
              />
              <div className="w-20 text-right text-sm text-indigo-600">${maxPrice}</div>
            </div>
          </div>

          {/* Duration range */}
          <div>
            <label className="block text-xs text-slate-600 mb-1">Max duration</label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="1" 
                max="30" 
                value={maxDays} 
                onChange={(e)=>{setMaxDays(Number(e.target.value)); }} 
                // onChange={(e)=>{setMaxDays(Number(e.target.value)); dispatch({type:actions.MAX_DAYS,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:Number(e.target.value)});}} 
                className="w-full accent-indigo-600" 
              />
              <div className="w-12 text-right text-sm text-indigo-600">{maxDays}d</div>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:gap-3 md:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm text-slate-600">Min rating</label>
            <select 
              value={minRating} 
              onChange={e => {setMinRating(Number(e.target.value))}} 
              // onChange={e => {setMinRating(Number(e.target.value)); dispatch({type:actions.MIN_RATING,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:Number(e.target.value)});}} 
              className="px-3 py-2 rounded-lg border border-slate-200"
            >
              <option value={0}>Any</option>
              {[1,2,3,4].map(n => <option key={n} value={n}>{n}+ stars</option>)}
            </select>

            <label className="text-sm text-slate-600 ml-4">Sort by</label>
            <select 
              value={sortBy} 
              onChange={(e)=>{setSortBy(e.target.value); }} 
              // onChange={(e)=>{setSortBy(e.target.value); dispatch({type:actions.SORT_BY,data:trips,max_price:maxPrice,max_days:maxDays,query:query,payload:e.target.value});}} 
              className="px-3 py-2 rounded-lg border border-slate-200"
            >
              <option value="none">Best match</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="days-asc">Duration: Short to Long</option>
              <option value="days-desc">Duration: Long to Short</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onReset} 
              className="text-sm px-3 py-2 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}