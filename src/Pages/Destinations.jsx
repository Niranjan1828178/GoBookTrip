import api from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Destinations() {
  const [trips, setTrips] = useState([]);
  useEffect(() => {
    let mounted = true;
    api.get('/tripsdata')
      .then(res => { if (!mounted) return; setTrips(Array.isArray(res.data) ? res.data : []); })
      .catch(err => { console.error('Failed to fetch trips for Destinations', err); if (mounted) setTrips([]); });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Destinations</h1>
        <p className="text-slate-600 mt-2">Browse destinations and curated trips.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trips.map(t => (
          <div key={t.id} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
            <div className="h-48 overflow-hidden">
              <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <div className="font-semibold text-slate-900">{t.name}</div>
              <div className="text-sm text-slate-500">{t.destination} • ${t.price}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}