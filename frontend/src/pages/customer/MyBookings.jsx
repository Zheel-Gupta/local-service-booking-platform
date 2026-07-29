import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getMyBookings, updateBookingStatus } from '../../services/bookingService';
import { createReview } from '../../services/reviewService';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

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

  // Status color badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">My Bookings</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your service appointments and review completed bookings.
            </p>
          </div>
        </div>

        {actionSuccess && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button onClick={() => setActionSuccess('')} className="text-emerald-400 font-bold">✕</button>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl text-sm mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 font-bold">✕</button>
          </div>
        )}

        {loading ? (
          <div className="py-20">
            <Loader size="lg" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-12 text-center my-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No bookings found</h3>
            <p className="text-slate-400 text-sm">
              You haven't booked any services yet.
            </p>
          </div>
        ) : (
          <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Service</th>
                    <th className="py-4 px-6">Provider</th>
                    <th className="py-4 px-6">Date & Time</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/5 transition">
                      {/* Service name */}
                      <td className="py-4 px-6 font-semibold text-white">
                        {booking.service?.title || `Service #${booking.serviceId}`}
                        <div className="text-xs font-normal text-slate-400">
                          ${booking.service?.price}
                        </div>
                      </td>

                      {/* Provider name */}
                      <td className="py-4 px-6 text-slate-300">
                        {booking.provider?.name || 'N/A'}
                        <div className="text-xs text-slate-500">{booking.provider?.email}</div>
                      </td>

                      {/* Date & Time slot */}
                      <td className="py-4 px-6 text-slate-300">
                        <div className="font-medium text-white">{booking.bookingDate}</div>
                        <div className="text-xs text-slate-400">{booking.timeSlot}</div>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 px-6">
                        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border capitalize ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                          >
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
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                          >
                            ⭐ Leave a Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Review Modal */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setReviewModalBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Leave a Review</h3>
            <p className="text-slate-400 text-xs mb-6">
              For: <span className="text-white font-medium">{reviewModalBooking.service?.title}</span>
            </p>

            {reviewError && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg mb-4">
                {reviewError}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-5">
              {/* Rating selection (1 to 5 stars) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Rating (1 to 5 stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition ${
                        star <= rating
                          ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 scale-105'
                          : 'text-slate-600 bg-slate-800 border border-white/5'
                      }`}
                    >
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe your experience with this service provider..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium py-2.5 rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  id="submit-review-btn"
                  type="submit"
                  disabled={reviewLoading}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-lg shadow-amber-600/30"
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
