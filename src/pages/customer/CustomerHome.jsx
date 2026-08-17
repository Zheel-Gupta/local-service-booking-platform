import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function CustomerHome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <span className="inline-block bg-emerald-500/20 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-emerald-500/30">
          Customer Dashboard
        </span>
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome, {user?.name ?? 'Customer'}! 👋
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your customer dashboard is coming soon. You'll be able to browse services,
          book appointments, and manage your bookings here.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left mb-6 text-sm">
          <p className="text-slate-400 font-mono">
            <span className="text-emerald-400">user.email</span> → {user?.email}
          </p>
          <p className="text-slate-400 font-mono mt-1">
            <span className="text-emerald-400">user.role</span> → {user?.role}
          </p>
        </div>
        <button
          id="customer-logout-btn"
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default CustomerHome;
