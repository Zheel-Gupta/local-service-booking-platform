import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getServiceById } from '../../services/serviceService';
import { getProviderReviews, getProviderAverageRating } from '../../services/reviewService';
import { createBooking } from '../../services/bookingService';

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Service & Provider data
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [providerRating, setProviderRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking Modal & Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Fetch Service and Reviews
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Service Details
      const serviceRes = await getServiceById(id);
      const svc = serviceRes.data;
      setService(svc);

      // 2. Fetch Provider Reviews if provider exists
      if (svc?.providerId) {
        const [reviewsRes, ratingRes] = await Promise.all([
          getProviderReviews(svc.providerId),
          getProviderAverageRating(svc.providerId),
        ]);
        setReviews(reviewsRes.data || []);
        setProviderRating({
          averageRating: ratingRes.averageRating || 0,
          totalReviews: ratingRes.totalReviews || 0,
        });
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Service not found.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Booking Submit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingDate || !timeSlot) {
      setBookingError('Please select both a date and a time slot.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      await createBooking({
        serviceId: service.id,
        bookingDate,
        timeSlot,
      });

      setBookingSuccess('Booking submitted successfully! Redirecting to your bookings...');
      setTimeout(() => {
        setIsModalOpen(false);
        navigate('/customer/my-bookings');
      }, 1800);
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || 'Failed to create booking.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Service</h2>
            <p className="text-slate-400 text-sm mb-6">{error || 'Service not found.'}</p>
            <Link
              to="/customer/home"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition"
            >
              Back to Services
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Back navigation */}
        <Link
          to="/customer/home"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all services
        </Link>

        {/* Main Service Card */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <span className="inline-block bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/20 mb-3">
                {service.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {service.title}
              </h1>
              {service.duration && (
                <span className="text-slate-400 text-sm flex items-center gap-1">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Estimated duration: {service.duration} mins
                </span>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              <div className="text-3xl font-extrabold text-white">
                ${service.price}
              </div>
              <button
                id="open-booking-modal-btn"
                onClick={() => {
                  setBookingError('');
                  setBookingSuccess('');
                  setIsModalOpen(true);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book Now
              </button>
            </div>
          </div>

          {/* Service Description */}
          <div className="py-6 border-b border-white/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Service Description
            </h3>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
              {service.description || 'No detailed description provided for this service.'}
            </p>
          </div>

          {/* Provider Details Info */}
          {service.provider && (
            <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center font-bold text-white text-lg shadow-md">
                  {service.provider.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {service.provider.name}
                  </h4>
                  <p className="text-xs text-slate-400">{service.provider.email}</p>
                </div>
              </div>

              {/* Provider Rating */}
              <div className="flex items-center gap-2 bg-slate-900/60 border border-white/10 px-4 py-2 rounded-xl text-sm">
                <div className="flex items-center text-amber-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <span className="font-bold text-white">{providerRating.averageRating}</span>
                <span className="text-slate-400 text-xs">({providerRating.totalReviews} reviews)</span>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span>Customer Reviews</span>
            <span className="text-xs bg-white/10 text-slate-300 font-semibold px-2.5 py-0.5 rounded-full">
              {reviews.length}
            </span>
          </h3>

          {reviews.length === 0 ? (
            <p className="text-slate-400 text-sm italic">
              No reviews yet for this provider. Be the first to review after booking!
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-900/60 border border-white/5 rounded-xl p-4 transition hover:border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-200 text-sm">
                      {rev.customer?.name || 'Anonymous Customer'}
                    </span>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-slate-600 fill-current'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {rev.comment && (
                    <p className="text-slate-300 text-sm leading-relaxed">{rev.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-white/20 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Book Service</h3>
            <p className="text-slate-400 text-xs mb-6">
              {service.title} — <span className="text-indigo-400 font-semibold">${service.price}</span>
            </p>

            {bookingError && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs p-3 rounded-lg mb-4">
                {bookingError}
              </div>
            )}

            {bookingSuccess && (
              <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-lg mb-4">
                {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Time Slot
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium py-2.5 rounded-xl border border-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  id="confirm-booking-btn"
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center"
                >
                  {bookingLoading ? 'Submitting...' : 'Confirm Booking'}
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

export default ServiceDetails;
