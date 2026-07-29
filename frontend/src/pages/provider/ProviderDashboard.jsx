import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-violet-500/20 rounded-full mb-6">
          <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="inline-block bg-violet-500/20 text-violet-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-violet-500/30">
          Provider Dashboard
        </span>
        <h1 className="text-3xl font-bold text-white mb-3">
          Welcome, {user?.name ?? 'Provider'}! 🚀
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your provider dashboard is coming soon. You'll be able to manage your
          services, view bookings, and track your reviews here.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left mb-6 text-sm">
          <p className="text-slate-400 font-mono">
            <span className="text-violet-400">user.email</span> → {user?.email}
          </p>
          <p className="text-slate-400 font-mono mt-1">
            <span className="text-violet-400">user.role</span> → {user?.role}
          </p>
        </div>
        <button
          id="provider-logout-btn"
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default ProviderDashboard;
