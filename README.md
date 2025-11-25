# Trip Planner React App

A full-featured travel planning web application built with React, Vite, Tailwind CSS, and a mock REST API using JSON Server. Users can browse curated trips, filter and search, view trip details, book trips, manage favorites, and see their booking history.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Setup &amp; Installation](#setup--installation)
- [Running the App](#running-the-app)
- [Available Scripts](#available-scripts)
- [Code Overview](#code-overview)
  - [App.jsx](#appjsx)
  - [TripList.jsx](#triplistjsx)
  - [TripCard.jsx](#tripcardjsx)
  - [FilterBar.jsx](#filterbarjsx)
  - [Modal.jsx](#modaljsx)
  - [Footer.jsx](#footerjsx)
  - [Pages](#pages)
  - [API &amp; Data](#api--data)
  - [Styling](#styling)
- [How Booking Works](#how-booking-works)
- [How Favorites Work](#how-favorites-work)
- [Authentication](#authentication)
- [Extending the App](#extending-the-app)
- [License](#license)

---

## Features

- Browse curated trips with images, prices, and details
- Filter trips by price, duration, category, country, and rating
- Search trips by name or destination
- View trip details and reviews in a modal
- Book trips (with traveler count, date, and price calculation)
- User authentication (sign up, sign in, profile)
- Manage favorite trips
- View and cancel bookings in profile
- Responsive design with Tailwind CSS

---

## Project Structure

```
trip_app/
│
├── src/
│   ├── api.js                # Axios API instance
│   ├── App.jsx               # Main app component and routing
│   ├── main.jsx              # React entry point
│   ├── index.css             # Tailwind base styles
│   ├── output.css            # Compiled Tailwind CSS
│   ├── assets/
│   │   ├── data.js           # Fallback trip data (JS array)
│   │   └── db.json           # Main mock database for JSON Server
│   ├── Components/
│   │   ├── FilterBar.jsx     # Filtering and search UI
│   │   ├── Footer.jsx        # Footer with links and info
│   │   ├── Modal.jsx         # Reusable modal component
│   │   ├── TripCard.jsx      # Trip card with details, booking, favorite
│   │   └── TripList.jsx      # List/grid of TripCard components
│   └── Pages/
│       ├── About.jsx         # About page
│       ├── Contact.jsx       # Contact form
│       ├── Destinations.jsx  # All destinations/trips
│       ├── FAQs.jsx          # Frequently asked questions
│       ├── Guides.jsx        # Travel guides
│       ├── Privacy.jsx       # Privacy policy
│       ├── Profile.jsx       # User profile, bookings, favorites
│       ├── SignIn.jsx        # Sign in form
│       ├── SignUp.jsx        # Sign up form
│       └── Terms.jsx         # Terms of service
│
├── package.json              # Project scripts and dependencies
├── vite.config.js            # Vite configuration
├── db.json                   # (Legacy) Example JSON Server db
├── index.html                # HTML entry point
└── README.md                 # This file
```

---

## Setup & Installation

1. **Clone the repository:**

   ```sh
   git clone <your-repo-url>
   cd trip_app
   ```
2. **Install dependencies:**

   ```sh
   npm install
   ```
3. **Start the development servers:**

   - **Frontend (Vite):**
     ```sh
     npm run dev
     ```
   - **Mock API (JSON Server):**
     ```sh
     npm run serve:api
     ```
   - **Tailwind CSS watcher:**
     ```sh
     npm run tail
     ```
   - **All at once (recommended):**
     ```sh
     npm run dev:all
     ```

   The app will be available at [http://localhost:5173](http://localhost:5173) and the API at [http://localhost:4000](http://localhost:4000).

---

## Available Scripts

- `npm run dev` - Start Vite dev server
- `npm run serve:api` - Start JSON Server on port 4000
- `npm run tail` - Watch and build Tailwind CSS
- `npm run dev:all` - Run all above in parallel
- `npm run build` - Build for production
- `npm run lint` - Lint code with ESLint

---

## Code Overview

### App.jsx

The main entry point for the app. Handles routing, global state, and data fetching.

```jsx
// src/App.jsx
import React, { useMemo, useState, useEffect } from 'react';
import api from './api';
import { tripsData as fallbackTrips } from './assets/data.js';
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

export default function App() {
  const [trips, setTrips] = useState([]);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [maxDays, setMaxDays] = useState(15);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('All');
  const [minRating, setMinRating] = useState(0);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) || null; } catch { return null; }
  });
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trips from API or fallback
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.get('/tripsdata')
      .then(res => { 
        if (!mounted) return;
        setTrips(Array.isArray(res.data) ? res.data : fallbackTrips);
        setLoading(false);
      })
      .catch(err => { 
        console.error('Failed to load trips from API, using fallback', err);
        if (mounted) {
          setTrips(fallbackTrips);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  // ...more logic for reviews, favorites, filtering, etc.

  return (
    <BrowserRouter>
      {/* ...header, nav, FilterBar, TripList, routes, footer... */}
    </BrowserRouter>
  );
}
```

**Key logic:**

- Loads trips from API or fallback data.
- Manages filters and search.
- Handles authentication state and favorites.
- Renders routes for all pages.

---

### TripList.jsx

Displays a grid of trip cards.

```jsx
// src/Components/TripList.jsx
import TripCard from './TripCard';

export default function TripList({ trips, loading, currentUser, onBookingCreated, favorites, onToggleFavorite, getAvgRating, onReviewAdded }) {
  if (loading) return <div>Loading trips...</div>;
  if (!trips.length) return <div>No trips found.</div>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {trips.map(trip => (
        <TripCard
          key={trip.id}
          trip={trip}
          currentUser={currentUser}
          onBookingCreated={onBookingCreated}
          isFavorited={favorites.includes(trip.id)}
          onToggleFavorite={onToggleFavorite}
          getAvgRating={getAvgRating}
          onReviewAdded={onReviewAdded}
        />
      ))}
    </div>
  );
}
```

---

### TripCard.jsx

Displays a single trip as a card, with modals for details and booking.

```jsx
// src/Components/TripCard.jsx
import Modal from './Modal';
import { useState } from 'react';

export default function TripCard({ trip, currentUser, onBookingCreated, isFavorited = false, onToggleFavorite, getAvgRating }) {
  if (!trip) return null;
  const { id, name, image, price, durationDays, description, destination } = trip;
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <>
      {/* Trip summary card */}
      <div
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition cursor-pointer"
        onClick={() => setShowDetails(true)}
        title="View trip details"
      >
        <div className="h-48 overflow-hidden">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">{name}</div>
              <div className="text-sm text-slate-500">{destination}</div>
            </div>
            <div className="text-indigo-600 font-bold text-lg">${price}</div>
          </div>
          <div className="text-xs text-slate-400">{durationDays} days</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-amber-500">{"★".repeat(Math.round(getAvgRating?.(id) || trip.rating || 0))}</span>
            <span className="text-xs text-slate-500">{getAvgRating?.(id) || trip.rating || 0}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={e => { e.stopPropagation(); setShowBooking(true); }}
            >
              Book
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${isFavorited ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'} hover:bg-rose-200`}
              onClick={e => { e.stopPropagation(); onToggleFavorite?.(id); }}
            >
              {isFavorited ? '♥ Favorited' : '♡ Favorite'}
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)}>
        {/* ...trip details, reviews, booking button... */}
      </Modal>

      {/* Booking Modal */}
      <Modal isOpen={showBooking} onClose={() => setShowBooking(false)}>
        {/* ...booking form... */}
      </Modal>
    </>
  );
}
```

**Key logic:**

- Shows trip info as a card.
- "Book" button opens booking modal.
- "Favorite" button toggles favorite status.
- Clicking the card opens the details modal.

---

### FilterBar.jsx

Lets users filter and search trips.

```jsx
// src/Components/FilterBar.jsx
import React, { useMemo, useState } from 'react';

export default function FilterBar({
  trips,
  maxPrice, setMaxPrice,
  maxDays, setMaxDays,
  query, setQuery,
  sortBy, setSortBy,
  category, setCategory,
  country, setCountry,
  minRating, setMinRating,
  onReset
}) {
  // Extract unique categories and countries
  const categories = useMemo(() => {
    const set = new Set(['All']);
    (trips || []).forEach(t => { if (t.category) set.add(t.category); });
    return Array.from(set).sort();
  }, [trips]);

  const countries = useMemo(() => {
    const set = new Set(['All']);
    (trips || []).forEach(t => {
      const parts = (t.destination || '').split(',').map(s => s.trim());
      const c = parts.length ? parts[parts.length - 1] : 'Unknown';
      set.add(c || 'Unknown');
    });
    return Array.from(set).sort();
  }, [trips]);

  return (
    <div className="bg-white border-slate-100 shadow-sm rounded-2xl overflow-hidden">
      {/* ...inputs for search, price, days, category, country, rating... */}
    </div>
  );
}
```

---

### Modal.jsx

A reusable modal component for overlays.

```jsx
// src/Components/Modal.jsx
import React from 'react';

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-700" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
```

---

### Footer.jsx

Footer with links and newsletter.

```jsx
// src/Components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ...brand, quick links, newsletter... */}
      </div>
    </footer>
  );
}
```

---

### Pages

Each page is a simple React component.
Example: `About.jsx`

```jsx
// src/Pages/About.jsx
import React from 'react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-4">About Trip Planner</h1>
      <p className="text-slate-600 mb-4">
        Trip Planner helps travelers discover curated trips, compare options, and book with confidence.
      </p>
      <p className="text-slate-600">
        We focus on clear pricing, trusted partners, and excellent customer support. This is a demo app — replace content as needed.
      </p>
    </div>
  );
}
```

---

### API & Data

- **api.js**:Axios instance for API calls.

  ```js
  // src/api.js
  import axios from 'axios';
  export default axios.create({ baseURL: 'http://localhost:4000' });
  ```
- **db.json**:Mock database for users, trips, bookings, reviews, and favorites.
- **data.js**:
  Fallback trip data as a JS array.

---

### Styling

- **Tailwind CSS** is used for all styling.
  - `index.css` contains Tailwind directives.
  - `output.css` is the compiled CSS.

---

## How Booking Works

- Each [`TripCard`](src/Components/TripCard.jsx) has a "Book" button.
- Clicking "Book" opens a modal with a booking form (number of travelers, start date, name, email).
- Price is calculated as:
  - First traveler: full price
  - Additional travelers: 50% of base price each
  - Tax: 8%
- On submit, a booking is created in the API and shown in the user's profile.

**Booking price calculation snippet:**

```jsx
const calculateTotalPrice = (basePrice, travelers) => {
  if (travelers <= 0) return 0;
  let total = basePrice;
  if (travelers > 1) {
    total += (basePrice * 0.5) * (travelers - 1);
  }
  return total;
};
const subtotal = calculateTotalPrice(basePrice, actualTravelers);
const tax = +(subtotal * 0.08).toFixed(2);
const total = +(subtotal + tax).toFixed(2);
```

---

## How Favorites Work

- Each trip card has a "Favorite" button (heart icon).
- Clicking toggles favorite status for the logged-in user.
- Favorites are stored in the API and shown in the user's profile.

**Favorite toggle logic:**

```jsx
const toggleFavorite = async (tripId) => {
  if (!user) { alert('Sign in to favorite trips'); return; }
  const existing = favorites.find(f => Number(f.tripId) === Number(tripId) && Number(f.userId) === Number(user.id));
  try {
    if (existing) {
      await api.delete(`/favorites/${existing.id}`);
      setFavorites(favorites.filter(f => f.id !== existing.id));
    } else {
      const res = await api.post('/favorites', { userId: user.id, tripId });
      setFavorites([...favorites, res.data]);
    }
  } catch (err) {
    alert('Failed to update favorites');
  }
};
```

---

## Authentication

- Users can sign up and sign in with email and password.
- User info is stored in localStorage and app state.
- Only signed-in users can book trips or favorite trips.
- Profile page shows user info, favorites, and bookings.

**Sign in logic:**

```jsx
const submit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await api.get('/users', { params: { email } });
    const users = Array.isArray(res.data) ? res.data : [];
    const user = users.find(u => u.password === password);
    if (user) {
      onLogin(user);
      nav('/');
    } else {
      alert('Invalid email or password');
    }
  } catch (err) {
    alert('Sign in failed');
  } finally {
    setLoading(false);
  }
};
```

---

## Extending the App

- **Add new trips:**Edit [`src/assets/db.json`](src/assets/db.json) or [`src/assets/data.js`](src/assets/data.js).
- **Add new pages:**Create a new component in `src/Pages` and add a route in `App.jsx`.
- **Integrate real backend:**Replace JSON Server endpoints in `api.js` with your backend API.
- **Add payment integration:**
  Extend the booking flow to include payment processing.

---

## License

This project is for demo and educational purposes.
Replace demo data and policies before deploying to production.

---

**Enjoy planning your next adventure!**
