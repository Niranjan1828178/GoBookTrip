import React from 'react';
import TripCard from './TripCard';

export default function TripList({ trips = [], currentUser, onBookingCreated, favorites = [], onToggleFavorite }) {
  // Initial load shows loading state
  if (!trips) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">Loading trips...</h3>
        <p className="text-sm text-slate-500 mt-2">Please wait</p>
      </div>
    );
  }

  // No results after loading
  if (trips.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800">No trips found</h3>
        <p className="text-sm text-slate-500 mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  // Render trips grid
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-8">
      
      {trips.map(trip => (
        <TripCard
          key={trip.id}
          trip={trip}
          currentUser={currentUser}
          onBookingCreated={onBookingCreated}
          isFavorited={favorites.includes(trip.id)}
          onToggleFavorite={onToggleFavorite}
          
        />
      ))}
      
    </div>
  );
}