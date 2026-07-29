import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link 
          to={user?.role === 'provider' ? '/provider/dashboard' : '/customer/home'} 
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 bg-indigo-600 group-hover:bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/30 transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0v-4m0 4h4" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            BookLocal
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    to="/customer/home"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/customer/home')
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Services
                  </Link>
                  <Link
                    to="/customer/my-bookings"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive('/customer/my-bookings')
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    My Bookings
                  </Link>
                </div>
              )}

              {user?.role === 'provider' && (
                <Link
                  to="/provider/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive('/provider/dashboard')
                      ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Provider Dashboard
                </Link>
              )}

              <div className="h-4 w-[1px] bg-slate-700 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-white">{user?.name}</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                    {user?.role}
                  </span>
                </div>
                <button
                  id="navbar-logout-btn"
                  onClick={handleLogout}
                  className="bg-white/5 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 border border-white/10 text-slate-300 text-sm px-3.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-slate-300 hover:text-white text-sm font-medium px-3 py-1.5 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition shadow-md shadow-indigo-600/30"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
