import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getMyBookings, updateBookingStatus } from '../../services/bookingService';
import { createReview } from '../../services/reviewService';
import {
  Calendar,
  Clock,
  Star,
  BadgeCheck,
  XCircle,
  AlertCircle,
  CheckCircle2,
  X,
  User,
  ShoppingBag
} from 'lucide-react';

/* ─── PLACEHOLDER CONSTANTS (Easily swap with real image URLs) ──────────────── */
export const BOOKING_PROVIDER_PLACEHOLDERS = [
  "https://placehold.co/150x150/E2E8F0/1E293B?text=John+Electrician",
  "https://placehold.co/150x150/E2E8F0/1E293B?text=Mike+Plumber",
  "https://placehold.co/150x150/E2E8F0/1E293B?text=Alex+Carpenter",
  "https://placehold.co/150x150/E2E8F0/1E293B?text=Sam+Painter",
];

const TABS = ['Upcoming', 'Completed', 'Cancelled'];

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('Upcoming');

  // Review Modal state
  const [reviewModalBooking, setReviewModalBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyBookings();
      setBookings(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Cancel pending booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setActionSuccess('');
    setError('');
    try {
      await updateBookingStatus(bookingId, 'cancelled');
      setActionSuccess('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalBooking) return;

    setReviewLoading(true);
    setReviewError('');
    try {
      await createReview({
        bookingId: reviewModalBooking.id,
        rating: Number(rating),
        comment: comment.trim(),
      });

      setActionSuccess('Review submitted successfully! Thank you.');
      setReviewModalBooking(null);
      setComment('');
      setRating(5);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setReviewError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Status color badges matching reference design
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getProviderAvatarUrl = (booking, index) => {
    if (booking?.provider?.profileImage) return booking.provider.profileImage;
    return BOOKING_PROVIDER_PLACEHOLDERS[index % BOOKING_PROVIDER_PLACEHOLDERS.length];
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'Upcoming') return b.status === 'pending' || b.status === 'confirmed';
    if (activeTab === 'Completed') return b.status === 'completed';
    if (activeTab === 'Cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">My Bookings</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Manage your service appointments and track status.
            </p>
          </div>

          {/* Pill Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm self-start sm:self-auto">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Banners */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-medium mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess('')} className="text-emerald-700 font-bold hover:text-emerald-900">✕</button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-700 font-bold hover:text-red-900">✕</button>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center my-6 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-sm font-medium">
              No {activeTab.toLowerCase()} bookings available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking, index) => {
              const providerAvatarUrl = getProviderAvatarUrl(booking, index);

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                >
                  <div className="flex items-start gap-4">
                    {/* Provider Photo Placeholder */}
                    <img
                      src={providerAvatarUrl}
                      alt={booking.provider?.name || 'John Electrician'}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
                    />

                    {/* Booking Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-extrabold text-gray-900">
                          {booking.provider?.name || 'John Electrician'}
                        </h3>
                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-indigo-600 mb-2">
                        {booking.service?.title || `Electrical Wiring`}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {booking.bookingDate || '18 May 2024'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {booking.timeSlot || '10:00 AM'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Price & Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 gap-3">
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-gray-900">${booking.service?.price || '32.50'}</span>
                    </div>

                    <div>
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4 text-rose-600" />
                          Cancel
                        </button>
                      )}

                      {booking.status === 'completed' && (
                        <button
                          onClick={() => {
                            setReviewModalBooking(booking);
                            setReviewError('');
                            setRating(5);
                            setComment('');
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-extrabold px-3.5 py-2 rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setReviewModalBooking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">Leave a Review</h3>
            <p className="text-gray-500 text-xs mb-5 font-medium">
              For: <span className="text-gray-900 font-bold">{reviewModalBooking.service?.title}</span>
            </p>

            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{reviewError}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">
                  Rating (1 to 5 stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        star <= rating
                          ? 'text-amber-500 bg-amber-50 border border-amber-200 scale-105 shadow-sm'
                          : 'text-gray-300 bg-gray-50 border border-gray-100'
                      }`}
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : 'fill-transparent'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">
                  Comment (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your experience with this service provider..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-xl border border-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-review-btn"
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm py-2.5 rounded-xl transition shadow-md shadow-amber-200 flex items-center justify-center"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MyBookings;
