// src/App.jsx
import React, { useMemo, useState, useEffect, useReducer } from 'react';
import api from './api';
// import { tripsData as fallbackTrips } from './assets/data.js';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import FilterBar from './Components/FilterBar';
import TripList from './Components/TripList';
import Footer from './Components/Footer';
import SignIn from './Pages/SignIn';
import SignUp from './Pages/SignUp';
import Profile from './Pages/Profile';
import About from './Pages/About';
import Destinations from './Pages/Destinations';
import Guides from './Pages/Guides';
import FAQs from './Pages/FAQs';
import Privacy from './Pages/Privacy';
import Terms from './Pages/Terms';
import Contact from './Pages/Contact';

// export const actions={
//   INITIALIZE:'initialize',
//   MAX_PRICE:'max_price',
//   MAX_DAYS:'max_days',
//   QUERY:'query',
//   SORT_BY:'sort_by',
//   CATEGORY:'category',
//   COUNTRY:'country',
//   MIN_RATING:'min_rating',
//   SORT_BY:'sort_by'
// }


// function filteredTrip(filter_trip,action){
//   let list = (action.data || []).filter(t =>
//       t.price <= action.max_price &&
//       t.durationDays <= action.max_days &&
//       (t.name.toLowerCase().includes(action.query.toLowerCase()) ||
//        t.destination.toLowerCase().includes(action.query.toLowerCase()))
//     );
// switch(action.type){
//   case actions.INITIALIZE:
//     return action.payload;
//   // case actions.MAX_PRICE:
//   //   return (trips || []).filter(t =>t.price <= action.payload );
//   // case actions.MAX_DAYS:
//   //   return (trips || []).filter(t =>t.price <= action.payload );
//   // case actions.QUERY:
//   //   return (trips || []).filter(t =>
//   //     t.name.toLowerCase().includes(action.payload.toLowerCase()) ||
//   //     t.destination.toLowerCase().includes(action.payload.toLowerCase())
//   //   );
//   case actions.CATEGORY:
//     if(action.payload && action.payload !=='All'){
//       return (list || []).filter(t => (t.category || 'General') === action.payload);
//     }
//     return list;
//   case actions.COUNTRY:
//     if(action.payload && action.payload !=='All'){
//       return (list || []).filter(t => {
//         const parts = (t.destination || '').split(',').map(s => s.trim());
//         const c = parts.length ? parts[parts.length - 1] : '';
//         return c.toLowerCase() === action.payload.toLowerCase();
//       });
//     }
//     return list;
//   case actions.MIN_RATING:
//     return (list || []).filter(t => t.rating >= action.payload );
//   case actions.SORT_BY:
//     if(action.payload ==='price-asc'){
//       return list.slice().sort((a,b)=>a.price-b.price);
//     }
//     if(action.payload ==='price-desc'){
//       return list.slice().sort((a,b)=>b.price-a.price);
//     }
//     if(action.payload ==='days-asc'){
//       return list.slice().sort((a,b)=>a.durationDays-b.durationDays);
//     }
//     if(action.payload ==='days-desc'){
//       return list.slice().sort((a,b)=>b.durationDays-a.durationDays);
//     }
//     return list;
//   default:
//     return list;
// }
// }


export default function App() {
  // const [filter_trip,dispatch]=useReducer(filteredTrip,[]);

  const [trips, setTrips] = useState([]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [maxDays, setMaxDays] = useState(15);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [minRating, setMinRating] = useState(0);

  // user state
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });

  // server-backed state
  const [favorites, setFavorites] = useState([]); // raw favorite records from API
  const [reviews, setReviews] = useState([]);     // all reviews from API
  const [loading, setLoading] = useState(true);

  // load trips from JSON server (fallback to in-file data)
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/tripsdata')
      .then(res => { 
        if (!mounted) return;
        setTrips(res.data);
        // dispatch({type:actions.INITIALIZE,payload:res.data});
        setLoading(false);
      })
      .catch(err => { 
        console.error('Failed to load trips from API, using fallback', err);
      
      });
    return () => { mounted = false; };
  }, []);

  // load reviews and favorites when app mounts or user changes
  useEffect(() => {
    const loadAll = async () => {
      try {
        const revRes = await api.get('/reviews');
        setReviews(Array.isArray(revRes.data) ? revRes.data : []);
      } catch (err) {
        console.error('Failed fetching reviews', err);
        setReviews([]);
      }

      if (user) {
        try {
          const favRes = await api.get('/favorites', { params: { userId: user.id } });
          setFavorites(Array.isArray(favRes.data) ? favRes.data : []);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (err) {
          console.error('Failed fetching favorites', err);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    };
    loadAll();
  }, [user]);

  // useEffect(() => { localStorage.setItem('user', JSON.stringify(user)); }, [user]);

  // helper: favorites as tripId array for components
  const favoritesIds = favorites.map(f => Number(f.tripId));

  // toggle favorite for current user — persists to backend
  const toggleFavorite = async (tripId) => {
    if (!user) { alert('Sign in to favorite trips'); return; }
    const existing = favorites.find(f => Number(f.tripId) === Number(tripId) && Number(f.userId) === Number(user.id));
    try {
      if (existing) {
        await api.delete(`/favorites/${existing.id}`);
        setFavorites(prev => prev.filter(f => f.id !== existing.id));
      } else {
        const res = await api.post('/favorites', { userId: user.id, tripId });
        setFavorites(prev => [...prev, res.data]);
      }
    } catch (err) {
      console.error('favorite update failed', err);
      alert('Could not update favorites — try again.');
    }
  };

  // refresh reviews (fetch all)
  const refreshReviews = async () => {
    try {
      const res = await api.get('/reviews');
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to refresh reviews', err);
    }
  };

  // called when a review is added (optimistic UI)
  const handleReviewAdded = (newReview) => {
    setReviews(prev => [newReview, ...prev]);
    setTimeout(refreshReviews, 500);
  };


  const filtered = useMemo(() => {
    let list = (trips || []).filter(t =>
      t.price <= maxPrice &&
      t.durationDays <= maxDays &&
      (t.name.toLowerCase().includes(query.toLowerCase()) ||
       t.destination.toLowerCase().includes(query.toLowerCase()))
    );

    if (category && category !== 'All') list = list.filter(t => (t.category || 'General') === category);

    if (country && country !== 'All') {
      list = list.filter(t => {
        const parts = (t.destination || '').split(',').map(s => s.trim());
        const c = parts.length ? parts[parts.length - 1] : '';
        return c.toLowerCase() === country.toLowerCase();
      });
    }

    if (minRating > 0) list = list.filter(t => t.rating >= minRating);

    if (sortBy === 'price-asc') list = list.slice().sort((a,b)=>a.price-b.price);
    if (sortBy === 'price-desc') list = list.slice().sort((a,b)=>b.price-a.price);
    if (sortBy === 'days-asc') list = list.slice().sort((a,b)=>a.durationDays-b.durationDays);
    if (sortBy === 'days-desc') list = list.slice().sort((a,b)=>b.durationDays-a.durationDays);

    return list;
  }, [trips, maxPrice, maxDays, query, sortBy, category, country, minRating, reviews]);

  const resetFilters = () => {
    setMaxPrice(3000); setMaxDays(15); setQuery(''); setSortBy('none'); setCategory('All'); setCountry('All'); setMinRating(0);
    dispatch({type:actions.INITIALIZE,payload:trips});
  };

  const logout = () => setUser(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col ">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-slate-900">GOBOOK</Link>
            <nav className="flex items-center gap-4">
              <Link to="/" className="text-sm text-slate-700 hover:text-slate-900">Explore</Link>
              {user ? (
                <>
                  <Link to="/profile" className="text-sm text-slate-700 hover:text-slate-900">Profile</Link>
                  <button onClick={logout} className="text-sm px-3 py-2 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-md">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="text-sm px-3 py-2 bg-slate-100 text-slate-700 hover:text-slate-900 rounded-md">Sign In</Link>
                  <Link to="/signup" className="text-sm px-3 py-2 bg-indigo-600 text-white rounded-md">Sign Up</Link>
                </>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                      Trip Recommendations
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                      Find curated trips — filter by budget, duration and more.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-700">
                      <strong className="text-indigo-600">{filtered.length}</strong> results
                    </div>
                  </div>
                </header>

                <FilterBar
                  trips={trips}
                  maxPrice={maxPrice}
                  setMaxPrice={setMaxPrice}
                  maxDays={maxDays}
                  setMaxDays={setMaxDays}
                  query={query}
                  setQuery={setQuery}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  category={category}
                  setCategory={setCategory}
                  country={country}
                  setCountry={setCountry}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  onReset={resetFilters}
                  // dispatch={dispatch}
                />

                <section className="mt-8">
                  <TripList
                    trips={filtered}
                    // trips={filter_trip}
                    loading={loading}
                    currentUser={user}
                    onBookingCreated={(booking) => console.log('booking created', booking)}
                    favorites={favoritesIds}
                    onToggleFavorite={toggleFavorite}
                   
                    onReviewAdded={handleReviewAdded}
                  />
                </section>
              </div>
            }/>

            <Route path="/signin" element={<SignIn onLogin={setUser} />} />
            <Route path="/signup" element={<SignUp onSignUp={setUser} />} />
            <Route path="/profile" element={user ? <Profile user={user} favorites={favoritesIds} onToggleFavorite={toggleFavorite} trips={trips} /> : <Navigate to="/signin" replace />} />

            <Route path="/about" element={<About />} />
            <Route path="/destinations" element={<Destinations currentUser={user} />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
           </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}