import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getProviderBookings, updateBookingStatus } from '../../services/bookingService';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShoppingBag,
  User,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];

function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProviderBookings();
      setBookings(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load booking requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionSuccess('');
    setError('');
    setUpdatingId(bookingId);
    try {
      await updateBookingStatus(bookingId, newStatus);
      setActionSuccess(`Booking status updated to ${newStatus}.`);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to update booking status.');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Booking Requests
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">
              Manage incoming customer service appointments and update booking status.
            </p>
          </div>

          {/* Pill Tabs */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-sm self-start sm:self-auto overflow-x-auto max-w-full">
            {TABS.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap cursor-pointer ${
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
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">No booking requests</h3>
            <p className="text-gray-500 text-sm font-medium">
              No {activeTab === 'All' ? '' : activeTab.toLowerCase()} bookings found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const customerName = booking.customer?.name || 'Customer';
              const customerEmail = booking.customer?.email || '';
              const customerPhone = booking.customer?.phone || '';
              const customerAddress = booking.customer?.address || '';

              const avatarUrl =
                booking.customer?.profileImage ||
                `https://placehold.co/100x100/E2E8F0/1E293B?text=${encodeURIComponent(customerName)}`;

              return (
                <div
                  key={booking.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={avatarUrl}
                      alt={customerName}
                      className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shadow-sm shrink-0"
                    />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-gray-900">{customerName}</h3>
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-indigo-600">
                        {booking.service?.title || 'Service'}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                          {booking.bookingDate}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {booking.timeSlot}
                        </span>
                      </div>

                      {/* Customer Info Pills */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 font-semibold pt-1">
                        {customerEmail && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {customerEmail}
                          </span>
                        )}
                        {customerPhone && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {customerPhone}
                          </span>
                        )}
                        {customerAddress && (
                          <span className="flex items-center gap-1 text-gray-600">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {customerAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-0 border-gray-100 gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xl font-extrabold text-gray-900">
                        ${Number(booking.service?.price || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                            disabled={updatingId === booking.id}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={updatingId === booking.id}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {booking.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'completed')}
                            disabled={updatingId === booking.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition shadow-md shadow-blue-100 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Mark Completed</span>
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                            disabled={updatingId === booking.id}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold px-3 py-2 rounded-xl transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default ProviderBookings;
