import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getServiceById } from '../../services/serviceService';
import { getProviderReviews, getProviderAverageRating } from '../../services/reviewService';
import { createBooking } from '../../services/bookingService';
import {
  ArrowLeft, Clock, Star, BadgeCheck, Calendar, Shield,
  CheckCircle2, AlertCircle, X, User, ThumbsUp, Briefcase
} from 'lucide-react';

/* ─── PLACEHOLDER CONSTANTS (Easily swap with real image URLs) ──────────────── */
export const PROVIDER_PROFILE_PHOTO = "https://placehold.co/300x300/4F46E5/FFF?text=John+Electrician";
export const REVIEWER_AVATAR_1 = "https://placehold.co/100x100/E2E8F0/1E293B?text=Sarah";
export const REVIEWER_AVATAR_2 = "https://placehold.co/100x100/E2E8F0/1E293B?text=Michael";

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM',
  '03:00 PM', '04:00 PM', '05:00 PM',
];

const DAY_TABS = [
  { label: 'Today', date: '18 May' },
  { label: 'Tomorrow', date: '19 May' },
  { label: 'Tue', date: '20 May' },
  { label: 'Wed', date: '21 May' },
];

function StarRating({ rating = 0, total = 5, showNumber = false }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(total)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-transparent'}`}
        />
      ))}
      {showNumber && <span className="text-sm font-bold text-gray-900 ml-1">{rating}</span>}
    </div>
  );
}

function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [providerRating, setProviderRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDay, setSelectedDay] = useState('Today');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const serviceRes = await getServiceById(id);
      const svc = serviceRes.data;
      setService(svc);
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

  useEffect(() => { fetchData(); }, [fetchData]);

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
      await createBooking({ serviceId: service.id, bookingDate, timeSlot });
      setBookingSuccess('Booking submitted! Redirecting...');
      setTimeout(() => { setIsModalOpen(false); navigate('/customer/my-bookings'); }, 1800);
    } catch (err) {
      console.error(err);
      setBookingError(err?.response?.data?.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><Loader size="lg" /></div>
      <Footer />
    </div>
  );

  if (error || !service) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-500 text-sm mb-6">{error || 'Service not found.'}</p>
        <Link to="/customer/home" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Services
        </Link>
      </div>
      <Footer />
    </div>
  );

  const providerPhoto = service.provider?.profileImage || PROVIDER_PROFILE_PHOTO;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Link to="/customer/home" className="hover:text-indigo-600 transition">Home</Link>
            <span>›</span>
            <span className="text-indigo-600">{service.category}</span>
            <span>›</span>
            <span className="text-gray-700 truncate">{service.provider?.name || service.title}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/customer/home" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-indigo-600 transition mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to all services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ─── LEFT COLUMN: PROVIDER PROFILE & DETAILS ───────────── */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Provider Profile Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                
                {/* Provider Photo Placeholder */}
                <div className="relative shrink-0">
                  <img
                    src={providerPhoto}
                    alt={service.provider?.name || 'John Electrician'}
                    className="w-28 h-28 rounded-2xl object-cover border-2 border-indigo-100 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow">
                    <BadgeCheck className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                {/* Profile Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h1 className="text-2xl font-extrabold text-gray-900">
                      {service.provider?.name || 'John Electrician'}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-600 font-extrabold px-2.5 py-0.5 rounded-full border border-blue-100">
                      <BadgeCheck className="w-3.5 h-3.5" /> Verified Professional
                    </span>
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                    <StarRating rating={providerRating.averageRating || 4.9} showNumber />
                    <span className="text-gray-500 text-xs font-medium">({providerRating.totalReviews || 128} Reviews)</span>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-center">
                    <div>
                      <div className="text-xl font-extrabold text-gray-900">6</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Years Experience</div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-gray-900">1,248</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Jobs Completed</div>
                    </div>
                    <div>
                      <div className="text-xl font-extrabold text-gray-900">98%</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Satisfaction Rate</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* About & Services List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-2">About</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {service.description || 'I am a certified electrician with over 6 years of experience in residential and commercial electrical services. I ensure quality work and customer satisfaction.'}
                </p>
              </div>

              {/* Services Tags */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {['Electrical Wiring', 'Lighting Installation', 'Circuit Repair', 'Switch & Socket Repair', 'Fan Installation', 'Electrical Inspection'].map((s) => (
                    <span key={s} className="bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing Cards Row */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-3">Pricing</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-indigo-600">Service Call</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">$25</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500">Per Hour</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">$25 - $40</p>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                    <p className="text-xs font-bold text-gray-500">Emergency Call</p>
                    <p className="text-xl font-extrabold text-gray-900 mt-1">$50</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-extrabold text-gray-900">
                  Customer Reviews ({reviews.length || 128})
                </h3>
                <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-100 px-3 py-1 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-extrabold text-gray-900">4.9</span>
                </div>
              </div>

              {/* Rating Breakdown Bars */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                <div className="flex items-center gap-6">
                  <div className="text-center shrink-0">
                    <div className="text-4xl font-extrabold text-gray-900">4.9</div>
                    <StarRating rating={4.9} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[
                      { stars: 5, pct: '92%' },
                      { stars: 4, pct: '6%' },
                      { stars: 3, pct: '1%' },
                      { stars: 2, pct: '1%' },
                      { stars: 1, pct: '0%' },
                    ].map((row) => (
                      <div key={row.stars} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span className="w-3 text-right">{row.stars}</span>
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: row.pct }} />
                        </div>
                        <span className="w-8 text-right text-[11px]">{row.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Cards List */}
              <div className="space-y-4">
                {[
                  { name: 'Sarah Johnson', avatar: REVIEWER_AVATAR_1, text: 'Very quick and professional service. The electrician fixed the issue quickly.', rating: 5, time: '2 days ago' },
                  { name: 'Michael Brown', avatar: REVIEWER_AVATAR_2, text: 'Great service and very polite.', rating: 4, time: '1 week ago' },
                ].map((rev, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.avatar}
                          alt={rev.name}
                          className="w-8 h-8 rounded-full object-cover border border-white shadow-sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900">{rev.name}</p>
                          <p className="text-[10px] text-gray-400">{rev.time}</p>
                        </div>
                      </div>
                      <StarRating rating={rev.rating} />
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed pl-10">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ─── RIGHT COLUMN: AVAILABLE SLOTS & BOOKING ───────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-indigo-100 shadow-lg p-6 sticky top-20">
              
              <h3 className="text-base font-extrabold text-gray-900 mb-4">Available Slots</h3>

              {/* Day Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mb-5 p-1 bg-gray-50 rounded-2xl border border-gray-200">
                {DAY_TABS.map((tab) => {
                  const isSelected = selectedDay === tab.label;
                  return (
                    <button
                      key={tab.label}
                      onClick={() => setSelectedDay(tab.label)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl transition text-center cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-extrabold shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 font-bold'
                      }`}
                    >
                      <span className="text-[10px] leading-none">{tab.label}</span>
                      <span className="text-[11px] font-extrabold mt-0.5">{tab.date}</span>
                    </button>
                  );
                })}
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2.5 px-1 rounded-xl text-xs font-extrabold text-center transition cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                          : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              {/* Date Input fallback */}
              <div className="mb-5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" /> Select Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* CTA Button */}
              <button
                id="open-booking-modal-btn"
                onClick={() => { setBookingError(''); setBookingSuccess(''); setIsModalOpen(true); }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-xl transition shadow-lg shadow-indigo-200 text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calendar className="w-4 h-4" /> Book Appointment
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                100% Secure & Guaranteed Service
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ─── BOOKING MODAL ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-900 mb-0.5">Confirm Booking</h3>
            <p className="text-gray-500 text-xs mb-5 font-medium">
              {service.title} — <span className="text-indigo-600 font-extrabold">${service.price}</span>
            </p>

            {bookingError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {bookingError}
              </div>
            )}
            {bookingSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-3.5 rounded-xl mb-4 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {bookingSuccess}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-2">Time Slot</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center transition border cursor-pointer ${
                        timeSlot === slot
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-indigo-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold py-2.5 rounded-xl border border-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  id="confirm-booking-btn"
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm py-2.5 rounded-xl transition shadow-md shadow-indigo-200 flex items-center justify-center"
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
