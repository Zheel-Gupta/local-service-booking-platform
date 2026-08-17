import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getProviderBookings } from '../../services/bookingService';
import { getMyServices } from '../../services/serviceService';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, DollarSign,
  TrendingUp, LogOut, BadgeCheck, ChevronRight, Wrench, ShoppingBag
} from 'lucide-react';


/* ─── PLACEHOLDER CONSTANTS (Exported for fallback compatibility) ────────────── */
export const PROVIDER_AVATAR_PLACEHOLDER = "https://placehold.co/100x100/4F46E5/FFF?text=Provider";
export const UPCOMING_PROVIDER_PHOTO = "https://placehold.co/100x100/E2E8F0/1E293B?text=Customer";

function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, servicesRes] = await Promise.all([
        getProviderBookings(),
        getMyServices(),
      ]);
      setBookings(bookingsRes.data || []);
      setServices(servicesRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load provider dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Statistics from real data
  const upcomingBookings = bookings.filter((b) => b.status === 'pending' || b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const totalEarned = completedBookings.reduce((sum, b) => {
    const price = Number(b.service?.price || 0);
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  const featuredUpcoming = upcomingBookings[0] || null;

  const avatarUrl =
    user?.profileImage ||
    `https://placehold.co/100x100/4F46E5/FFF?text=${encodeURIComponent(user?.name || 'Provider')}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Greeting Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={avatarUrl}
              alt={user?.name || 'Provider'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                  Hello, {user?.name || 'Provider'}! 👋
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Provider
                </span>
              </div>
              <p className="text-gray-500 text-xs mt-0.5 font-medium">
                Here's what's happening with your bookings today.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => navigate('/provider/services')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-indigo-600" />
              <span>Manage Services</span>
            </button>
            <button
              onClick={() => navigate('/provider/bookings')}
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Booking Requests</span>
            </button>
            <button
              id="provider-logout-btn"
              onClick={handleLogout}
              className="bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>

        </div>

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
        ) : (
          <>
            {/* 4 STAT CARDS ROW */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { title: 'Upcoming Bookings', val: upcomingBookings.length, color: 'indigo', icon: Calendar, change: `${upcomingBookings.length} active` },
                { title: 'Completed Services', val: completedBookings.length, color: 'blue', icon: CheckCircle2, change: `${completedBookings.length} total` },
                { title: 'Cancelled', val: cancelledBookings.length, color: 'rose', icon: AlertCircle, change: `${cancelledBookings.length} total` },
                { title: 'Total Spent / Earned', val: `$${totalEarned.toFixed(2)}`, color: 'emerald', icon: DollarSign, change: 'Lifetime earnings' },
              ].map((stat) => {
                const Icon = stat.icon;
                const colorClasses = {
                  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                  blue: 'bg-blue-50 text-blue-600 border-blue-100',
                  rose: 'bg-rose-50 text-rose-600 border-rose-100',
                  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                }[stat.color];

                return (
                  <div key={stat.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-gray-500">{stat.title}</span>
                      <div className={`w-9 h-9 rounded-xl ${colorClasses} border flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-gray-900 mb-1">{stat.val}</div>
                    <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Upcoming Booking & Recent Activity Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Upcoming Booking Featured Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-extrabold text-gray-900">Upcoming Booking</h3>
                    {featuredUpcoming && (
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                        featuredUpcoming.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {featuredUpcoming.status.charAt(0).toUpperCase() + featuredUpcoming.status.slice(1)}
                      </span>
                    )}
                  </div>

                  {featuredUpcoming ? (
                    <>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              featuredUpcoming.customer?.profileImage ||
                              `https://placehold.co/100x100/E2E8F0/1E293B?text=${encodeURIComponent(featuredUpcoming.customer?.name || 'Customer')}`
                            }
                            alt={featuredUpcoming.customer?.name || 'Customer'}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <h4 className="text-sm font-extrabold text-gray-900">{featuredUpcoming.customer?.name || 'Customer'}</h4>
                              <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                            </div>
                            <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                              {featuredUpcoming.service?.title || 'Service'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-extrabold text-gray-900">
                            ${Number(featuredUpcoming.service?.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 font-semibold pt-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          <span>{featuredUpcoming.bookingDate}</span>
                          <Clock className="w-4 h-4 text-indigo-600 ml-2" />
                          <span>{featuredUpcoming.timeSlot}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-extrabold text-gray-900 mb-1">No upcoming bookings yet</h4>
                      <p className="text-xs text-gray-500 font-medium">
                        When customers book your services, your next appointment will appear here.
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent Activity Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="text-base font-extrabold text-gray-900 mb-4">Recent Activity</h3>
                  {bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((act) => {
                        const getStatusIcon = (status) => {
                          switch (status) {
                            case 'completed':
                              return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' };
                            case 'confirmed':
                              return { icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' };
                            case 'cancelled':
                              return { icon: AlertCircle, color: 'text-rose-600 bg-rose-50' };
                            default:
                              return { icon: Clock, color: 'text-amber-600 bg-amber-50' };
                          }
                        };
                        const { icon: Icon, color } = getStatusIcon(act.status);

                        return (
                          <div key={act.id} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-extrabold text-gray-900 capitalize">
                                  Booking {act.status}
                                </p>
                                <p className="text-[11px] text-gray-500 font-medium">
                                  {act.customer?.name || 'Customer'} • {act.service?.title || 'Service'} (${Number(act.service?.price || 0).toFixed(2)})
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-gray-400">{act.bookingDate}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-xs text-gray-500 font-medium">No recent activity yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar Info Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-20">
                  <h3 className="text-base font-extrabold text-gray-900 mb-4">Account Overview</h3>
                  <div className="space-y-3 text-xs font-medium">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-bold block text-[10px] uppercase">User Email</span>
                      <span className="text-gray-900 font-bold">{user?.email || 'N/A'}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-bold block text-[10px] uppercase">Role Type</span>
                      <span className="text-indigo-600 font-bold capitalize">{user?.role || 'Provider'}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <span className="text-gray-400 font-bold block text-[10px] uppercase">Verification Status</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                        <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-50" /> Verified Account
                      </span>
                    </div>

                    <div className="pt-3 space-y-2 border-t border-gray-100">
                      <button
                        onClick={() => navigate('/provider/services')}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 cursor-pointer"
                      >
                        <Wrench className="w-4 h-4" />
                        <span>Manage Services</span>
                      </button>
                      <button
                        onClick={() => navigate('/provider/bookings')}
                        className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-extrabold px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-indigo-600" />
                        <span>Booking Requests</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default ProviderDashboard;
