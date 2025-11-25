import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function TripCard({
  trip,
  currentUser,
  onBookingCreated,
  isFavorited = false,
  onToggleFavorite,
 
}) {
  if (!trip) return null;
  const { id, name, image, price, durationDays, description, destination } =
    trip;

  // State variables
  const [reviews, setReviews] = useState([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");

  // Booking form state
  const [numTravelers, setNumTravelers] = useState(1);
  const [customTravelers, setCustomTravelers] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const navigate = useNavigate();

  // Price calculation with 50% for additional travelers
  const calculateTotalPrice = (basePrice, travelers) => {
    if (travelers <= 0) return 0;
    // First person pays full price
    let total = basePrice;
    // Additional travelers pay 50% each
    if (travelers > 1) {
      total += basePrice * 0.5 * (travelers - 1);
    }
    return total;
  };

  const basePrice = price;
  const actualTravelers = showCustomInput
    ? Number(customTravelers) || 1
    : Number(numTravelers);
  const subtotal = calculateTotalPrice(basePrice, actualTravelers);
  const taxAmount = (subtotal * 0.02).toFixed(2);
  const totalPrice = (subtotal + Number(taxAmount)).toFixed(2);

  // Load reviews and set initial form values
  useEffect(() => {
    let mounted = true;
    api
      .get("/reviews", {
        params: { tripId: id, _sort: "date", _order: "desc" },
      })
      .then((res) => {
        if (!mounted) return;
        setReviews(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load reviews", err);
        setReviews([]);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.name || "");
      setEmail(currentUser.email || "");
    }
  }, [currentUser]);

  // Handle custom traveler input
  const handleTravelersChange = (e) => {
    const value = e.target.value;
    if (value === "custom") {
      setShowCustomInput(true);
      setCustomTravelers("");
    } else {
      setShowCustomInput(false);
      setNumTravelers(Number(value));
    }
  };

  const handleCustomTravelersChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomTravelers(value);
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    setSubmitting(true);
    const payload = {
      userId: currentUser.id,
      tripId: id,
      tripName: name,
      destination,
      numTravelers,
      startDate,
      totalPrice,
      date: new Date().toISOString(),
    };

    try {
      const res = await api.post("/bookings", payload);
      setSuccessData(res.data);
      onBookingCreated?.(res.data);
    } catch (err) {
      console.error(err);
      alert("Booking failed — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addReview = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/signin");
      return;
    }

    const newReviewPayload = {
      tripId: id,
      userId: currentUser.id,
      userName: currentUser.name || currentUser.email,
      rating: Number(myRating),
      comment: myComment,
      date: new Date().toISOString(),
    };

    try {
      // post review
      const res = await api.post("/reviews", newReviewPayload);
      const saved = res.data;
      setReviews((prev) => [saved, ...prev]);
      setMyComment("");
      setMyRating(5);
      // Now update trip rating on server:
      try {
     
        const oldRating = Number(trip.rating || 0);
    
        const computed =Math.floor((oldRating+myRating)/2);
        await api.patch(`/tripsdata/${id}`, { rating: computed });
        
      } catch (err) {
        console.error("Failed updating trip rating", err);
      }
    } catch (err) {
      console.error("Failed to post review", err);
      alert("Could not post review — try again.");
    }
  };

  const handleToggleFav = () => {
    if (!currentUser) {
      navigate("/signin");
      return;
    }
    onToggleFavorite?.(id);
  };

 
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Trip summary card */}
      <div
        className="cursor-pointer"
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
            <span className="text-amber-500">
              {"★".repeat(trip.rating || 0)}
            </span>
            <span className="text-xs text-slate-500">
              {Math.floor(trip.rating) || 0}
            </span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="px-3 py-1 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowBooking(true);
              }}
            >
              Book
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm ${
                isFavorited
                  ? "bg-rose-100 text-rose-600"
                  : "bg-slate-100 text-slate-600"
              } hover:bg-rose-200`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite?.(id);
              }}
            >
              {isFavorited ? "♥ Favorited" : "♡ Favorite"}
            </button>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <Modal isOpen={showDetails} onClose={() => setShowDetails(false)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 rounded-lg overflow-hidden">
            <img src={image} alt={name} className="w-full h-48 object-cover" />
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{name}</h2>
            <p className="text-slate-600 mb-4">{description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600">Duration</div>
                <div className="text-lg font-semibold text-slate-900">
                  {durationDays} days
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="text-sm text-slate-600">Price per day</div>
                <div className="text-lg font-semibold text-slate-900">
                  ${Math.round(price / Math.max(1, durationDays))}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-2">Reviews</h3>
              <div className="space-y-3 max-h-48 overflow-auto mb-4">
                {reviews.length === 0 ? (
                  <div className="text-sm text-slate-500">
                    No reviews yet — be the first to leave one.
                  </div>
                ) : (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="bg-white border-slate-100 p-3 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900">
                          {r.userName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {new Date(r.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-sm text-amber-500">
                        {"★".repeat(r.rating)}
                      </div>
                      <div className="text-sm text-slate-600 mt-2">
                        {r.comment}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {currentUser ? (
                <form
                  onSubmit={addReview}
                  className="bg-white border-slate-100 p-3 rounded-lg border"
                >
                  <label className="text-sm text-slate-700">Your rating</label>
                  <select
                    value={myRating}
                    onChange={(e) => setMyRating(e.target.value)}
                    className="w-20 px-2 py-1 border rounded-md mt-1 mb-2"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>

                  <label className="block text-sm text-slate-700">
                    Comment
                  </label>
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md mt-1 mb-2"
                    rows="3"
                    required
                  />

                  <div className="flex gap-2 justify-end">
                    <button
                      type="submit"
                      className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Post review
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMyComment("");
                        setMyRating(5);
                      }}
                      className="px-3 py-2 border rounded-md border-slate-200 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-slate-500">
                  Sign in to leave a review.
                </div>
              )}
            </div>

            {/* Key Locations Section */}
            <div className="mt-6">
              <h3 className="font-semibold text-slate-900 mb-2">
                Key Locations
              </h3>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                {trip.locations &&
                  trip.locations.map((location, index) => (
                    <li key={index}>{location}</li> // Remove the "1" that was accidentally added
                  ))}
              </ul>
              {!trip.locations && (
                <p className="text-sm text-slate-500">
                  No location details available.
                </p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={showBooking}
        onClose={() => {
          if (!submitting) {
            setShowBooking(false);
            setSuccessData(null);
          }
        }}
      >
        {successData ? (
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600 mb-4">
              ✓
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-900">
              Booking Confirmed
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Your booking for{" "}
              <strong className="text-slate-900">{name}</strong> is confirmed.
            </p>

            <div className="bg-slate-50 p-4 rounded-lg text-left mb-4">
              <div className="text-sm text-slate-500">Booking ID</div>
              <div className="font-medium text-slate-900">
                {successData.id ?? "—"}
              </div>
              <div className="mt-2 text-sm text-slate-500">Start</div>
              <div className="font-medium text-slate-900">
                {successData.startDate || startDate || "—"}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowBooking(false);
                  setSuccessData(null);
                  window.location.href = "/profile";
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                View Bookings
              </button>
              <button
                onClick={() => {
                  setShowBooking(false);
                  setSuccessData(null);
                }}
                className="px-4 py-2 border rounded-md border-slate-200 hover:bg-slate-50"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left side with image */}
            <div className="rounded-lg overflow-hidden">
              <img
                src={image}
                alt={name}
                className="w-full h-56 object-cover"
              />
              <div className="p-4 bg-white border-t border-slate-100">
                <div className="text-sm text-slate-500">Trip</div>
                <div className="font-semibold text-slate-900">{name}</div>
                <div className="mt-2 text-sm text-slate-400">
                  {destination} • {durationDays} days
                </div>
              </div>
            </div>

            {/* Right side booking form */}
            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Start Date
                  </label>
                  <input
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Number of Travelers
                  </label>
                  <div className="space-y-2">
                    <select
                      value={showCustomInput ? "custom" : numTravelers}
                      onChange={handleTravelersChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-md"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "person" : "people"}
                        </option>
                      ))}
                      <option value="custom">More than 10 people</option>
                    </select>

                    {showCustomInput && (
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={customTravelers}
                          onChange={handleCustomTravelersChange}
                          placeholder="Enter number of travelers"
                          className="w-full px-3 py-2 border border-slate-200 rounded-md"
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600">
                    Base price (first person)
                  </div>
                  <div className="text-sm text-slate-800">
                    ${basePrice.toFixed(2)}
                  </div>
                </div>

                {actualTravelers > 1 && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-600">
                      Additional travelers ({actualTravelers - 1} × $
                      {(basePrice * 0.5).toFixed(2)})
                    </div>
                    <div className="text-sm text-slate-800">
                      ${((actualTravelers - 1) * basePrice * 0.5).toFixed(2)}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-slate-600">Taxes (8%)</div>
                  <div className="text-sm text-slate-800">${taxAmount}</div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-slate-700">
                    Total
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    ${totalPrice}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-indigo-600 text-white rounded-md"
                >
                  {submitting ? "Processing…" : "Confirm booking"}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
