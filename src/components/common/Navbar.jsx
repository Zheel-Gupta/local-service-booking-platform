import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Zap, MapPin, Bell, LogOut, User, Search, ChevronDown, Check, Locate, Loader2 } from 'lucide-react';

/* ─── Major Indian Cities ─────────────────────────────────────────────────── */
const LOCATIONS = [
  'Delhi',
  'Mumbai',
  'Bangalore',
  'Ajmer',
  'Jaipur',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
];

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedLocation, setSelectedLocation] = useState('Delhi');
  const [locationOpen, setLocationOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const locationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setLocationOpen(false);
    setLocationError('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Could not detect location');
      return;
    }
    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) {
            throw new Error('Reverse geocoding request failed');
          }
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.municipality ||
            data.address?.state_district ||
            data.address?.county ||
            data.address?.state ||
            'Detected Location';

          setSelectedLocation(city);
          setLocationOpen(false);
          setLocationError('');
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setLocationError('Could not detect location');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setLocationError('Could not detect location');
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo with Amber Bolt */}
        <Link
          to={user?.role === 'provider' ? '/provider/dashboard' : '/customer/home'}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-200">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Service<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        {/* Categories Dropdown & Quick Search (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-xl mx-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search services or professionals..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          {/* ─── Location Selector Dropdown ───────────────────────── */}
          <div ref={locationRef} className="relative shrink-0">
            <button
              id="navbar-location-btn"
              onClick={() => setLocationOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="max-w-[120px] truncate">{selectedLocation}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                  locationOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown panel */}
            {locationOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                    Select Location
                  </p>

                  <button
                    id="navbar-use-current-location-btn"
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors text-left disabled:opacity-50 mb-1"
                  >
                    {isLocating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                    ) : (
                      <Locate className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    )}
                    <span>{isLocating ? 'Detecting location...' : 'Use my current location'}</span>
                  </button>

                  {locationError && (
                    <div className="px-3 py-1.5 mb-1 bg-red-50 text-red-600 text-[11px] font-medium rounded-lg">
                      {locationError}
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-1">
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        id={`location-option-${loc.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                        onClick={() => handleSelectLocation(loc)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left ${
                          selectedLocation === loc
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {loc}
                        </span>
                        {selectedLocation === loc && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Nav Links */}
        {isAuthenticated && user?.role === 'customer' && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/customer/home"
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                isActive('/customer/home')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Services
            </Link>
            <Link
              to="/customer/my-bookings"
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                isActive('/customer/my-bookings')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              My Bookings
            </Link>
          </div>
        )}

        {isAuthenticated && user?.role === 'provider' && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/provider/dashboard"
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                isActive('/provider/dashboard')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/provider/services"
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                isActive('/provider/services')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Manage Services
            </Link>
            <Link
              to="/provider/bookings"
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-colors ${
                isActive('/provider/bookings')
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Booking Requests
            </Link>
          </div>
        )}


        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-extrabold text-gray-800 leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">{user?.role}</p>
                </div>
                <button
                  id="navbar-logout-btn"
                  onClick={handleLogout}
                  className="ml-1 flex items-center gap-1 text-gray-400 hover:text-red-500 transition text-xs font-bold"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-bold text-gray-700 hover:text-indigo-600 px-3 py-2 transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-md shadow-indigo-100 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
