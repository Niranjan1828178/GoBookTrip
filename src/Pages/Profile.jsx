import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from '../Components/Modal';

function initials(name = '') {
  return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();
}

export default function Profile({ user, favorites = [], onToggleFavorite, trips = [] }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  // const [userReviews, setUserReviews] = useState([]);
  const navigate = useNavigate(); // Add this to use navigation

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/bookings', { params: { userId: user.id } });
        setBookings(res.data || []);
      } catch (err) {
        console.error(err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    load();

    // const loadReviews = async () => {
    //   try {
    //     const r = await api.get('/reviews', { params: { userId: user.id, _sort: 'date', _order: 'desc' } });
    //     setUserReviews(Array.isArray(r.data) ? r.data : []);
    //   } catch (err) {
    //     console.error('Failed loading user reviews', err);
    //     setUserReviews([]);
    //   }
    // };
    // loadReviews();
  }, [user]);

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/bookings/${id}`);
      setBookings(prev => prev.filter(b => b.id !== id));
      if (selectedBooking?.id === id) { setShowDetails(false); setSelectedBooking(null); }
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking');
    } finally {
      setDeletingId(null);
    }
  };

  const stats = useMemo(() => {
    const total = bookings.reduce((s, b) => s + (Number(b.totalPrice) || 0), 0); // <-- ensure number
    const upcoming = bookings.filter(b => new Date(b.startDate) > new Date()).length;
    return { total, count: bookings.length, upcoming };
  }, [bookings]);

  // resolve favorite trips from fetched trips array (trips from App)
  const favoriteTrips = favorites.map(id => trips.find(t => Number(t.id) === Number(id))).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white border-slate-100 rounded-2xl p-6 shadow-sm border mb-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xl">
          {initials(user.name)}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl font-semibold text-slate-900">{user.name}</div>
              <div className="text-sm text-slate-600">{user.email}</div>
            </div>

            <div className="flex gap-4">
              <div className="text-sm text-right">
                <div className="text-xs text-slate-500">Bookings</div>
                <div className="font-semibold text-slate-900">{stats.count}</div>
              </div>
              <div className="text-sm text-right">
                <div className="text-xs text-slate-500">Upcoming</div>
                <div className="font-semibold text-slate-900">{stats.upcoming}</div>
              </div>
              <div className="text-sm text-right">
                <div className="text-xs text-slate-500">Total spent</div>
                <div className="font-semibold text-slate-900">${stats.total}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <h3 className="text-lg font-semibold mb-3 text-slate-900">Favorites</h3>
      <div className="space-y-4 mb-8">
        {favoriteTrips.length === 0 ? (
          <div className="text-sm text-slate-500">No favorites yet. Click the ❤️ on a trip to save it.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteTrips.map(t => (
              <div key={t.id} className="bg-white border-slate-100 p-3 xs:p-4 rounded-lg border shadow-sm flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
                <div
                  className="flex items-center gap-3 xs:gap-4 cursor-pointer hover:bg-slate-50 rounded-lg transition w-full"
                  onClick={() => navigate('/')} // Navigate to home with the trip ID
                  title="View trip details"
                >
                  <div className="w-24 h-14 xs:w-28 xs:h-16 rounded-lg overflow-hidden">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm xs:text-base">{t.name}</div>
                    <div className="text-xs xs:text-sm text-slate-500">{t.destination}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="font-bold text-slate-900">${t.price}</div>
                  <button onClick={() => onToggleFavorite(t.id)} className="px-2 py-1 xs:px-3 xs:py-1 border border-slate-200 hover:bg-slate-50 rounded-md text-xs xs:text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking History */}
      <h3 className="text-lg font-semibold mb-3 text-slate-900">Booking History</h3>
      <div className="space-y-4">
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-sm text-slate-500">No bookings yet. Book a trip to get started.</div>
        ) : bookings.map(b => {
          const trip = trips.find(t => t.id === b.tripId) || {};
          return (
            <div key={b.id} className="bg-white border-slate-100 p-4 rounded-lg border shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-28 h-16 rounded-lg overflow-hidden bg-slate-100">
                  <img src={trip.image || 'https://via.placeholder.com/320x160?text=Trip'} alt={b.tripName} className="w-full h-full object-cover" />
                </div>

                <div>
                  <div className="font-semibold text-slate-900">{b.tripName}</div>
                  <div className="text-sm text-slate-500">{b.destination} • {b.numTravelers} traveler{b.numTravelers>1?'s':''}</div>
                  <div className="text-xs text-slate-400">{new Date(b.date).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="font-bold text-slate-900">${b.totalPrice}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => cancelBooking(b.id)}
                    disabled={deletingId === b.id}
                    className="text-sm px-3 py-1 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                  >
                    {deletingId === b.id ? 'Cancelling...' : 'Cancel'}
                  </button>

                  <button
                    onClick={() => { setSelectedBooking(b); setShowDetails(true); }}
                    className="text-sm px-3 py-1 border rounded-md bg-slate-50 hover:bg-slate-100"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Details Modal */}
      <Modal isOpen={showDetails} onClose={() => { setShowDetails(false); setSelectedBooking(null); }}>
        {selectedBooking && (() => {
          const trip = trips.find(t => t.id === selectedBooking.tripId) || {};
          const numTravelers = Number(selectedBooking.numTravelers) || 1;
          const basePrice = Number(trip.price) || 0;
          const additional = numTravelers > 1 ? (numTravelers - 1) * basePrice * 0.5 : 0;
          const subtotal = basePrice + additional;
          const tax = +(subtotal * 0.08).toFixed(2);
          const total = +(subtotal + tax).toFixed(2);
          const start = selectedBooking.startDate ? new Date(selectedBooking.startDate) : null;
          const end = start && trip.durationDays ? new Date(start.getTime() + (trip.durationDays - 1) * 24 * 60 * 60 * 1000) : null;

          return (
            <div className="max-w-2xl">
              <div className="flex gap-4">
                <div className="w-44 h-48 rounded-lg overflow-hidden">
                  <img src={trip.image || 'https://via.placeholder.com/320x160?text=Trip'} alt={selectedBooking.tripName} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="text-lg font-semibold text-slate-900">{selectedBooking.tripName}</div>
                  <div className="text-sm text-slate-500 mb-2">{selectedBooking.destination}</div>

                 
              <div className="mt-6">
                
                <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                  <div>
                    <div className="text-xs">Start Date</div>
                    <div className="font-medium">{start ? start.toLocaleDateString() : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs">End Date</div>
                    <div className="font-medium">{end ? end.toLocaleDateString() : '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs">Duration</div>
                    <div className="font-medium">{trip.durationDays} days</div>
                  </div>
                  <div>
                    <div className="text-xs">Travelers</div>
                    <div className="font-medium">{numTravelers} {numTravelers === 1 ? 'person' : 'people'}</div>
                  </div>
                </div>
                </div>
              </div>


                <div className="mt-4">
                  <div className="text-base font-semibold mb-2">Cost Breakdown</div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Base price (first person)</span>
                      <span>${basePrice.toFixed(2)}</span>
                    </div>
                    {numTravelers > 1 && (
                      <div className="flex justify-between text-sm">
                        <span>Additional travelers ({numTravelers - 1} × ${(basePrice * 0.5).toFixed(2)})</span>
                        <span>${additional.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base mt-2 pt-2 border-t">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => { setShowDetails(false); setSelectedBooking(null); }} className="px-4 py-2 border rounded-md">Close</button>
                <button 
                  onClick={() => cancelBooking(selectedBooking.id)} 
                  disabled={deletingId === selectedBooking.id} 
                  className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                >
                  {deletingId === selectedBooking.id ? 'Cancelling...' : 'Cancel booking'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}