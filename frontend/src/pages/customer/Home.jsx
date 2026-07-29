import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getAllServices } from '../../services/serviceService';

const CATEGORIES = [
  'All',
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Appliance Repair',
  'Tutoring',
  'Carpentry',
  'Painting',
  'Gardening',
  'Other',
];

function Home() {
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  // Data state
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch services function
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = {
        page,
        limit: 6,
        sortBy,
      };

      if (search.trim()) queryParams.search = search.trim();
      if (category !== 'All') queryParams.category = category;
      if (minPrice !== '') queryParams.minPrice = minPrice;
      if (maxPrice !== '') queryParams.maxPrice = maxPrice;

      const data = await getAllServices(queryParams);
      setServices(data.services || []);
      setTotalPages(data.totalPages || 1);
      setTotalResults(data.totalResults || 0);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Find & Book Local Services
          </h1>
          <p className="text-slate-400 text-base sm:text-lg">
            Connect with trusted local professionals for home repair, cleaning, tutoring, and more.
          </p>
        </div>

        {/* Search Bar & Filters Section */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 mb-8 shadow-xl">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services by title or category..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center gap-2"
            >
              Search
            </button>
          </form>

          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price & Max Price */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Price Range ($)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-1/2 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setPage(1);
                  }}
                  className="w-1/2 bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Reset Filters button */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium py-2 px-4 rounded-xl border border-white/10 transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            Available Services
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Showing {services.length} of {totalResults} services
          </span>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="py-16">
            <Loader size="lg" />
          </div>
        ) : services.length === 0 ? (
          /* Empty state */
          <div className="bg-slate-800/40 border border-white/5 rounded-2xl p-12 text-center my-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No services found</h3>
            <p className="text-slate-400 text-sm mb-4">
              Try adjusting your search criteria or price filters.
            </p>
            <button
              onClick={handleResetFilters}
              className="bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* Service Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/customer/service/${service.id}`)}
                className="group bg-slate-800/60 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div>
                  {/* Category badge & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-indigo-500/10 text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-500/20">
                      {service.category}
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      ${service.price}
                      {service.duration && (
                        <span className="text-xs font-normal text-slate-400">/{service.duration}min</span>
                      )}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
                    {service.title}
                  </h3>

                  {/* Description preview */}
                  <p className="text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {service.description || 'No description provided.'}
                  </p>
                </div>

                {/* Card Footer: Provider & Rating */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
                      {service.provider?.name?.charAt(0) || 'P'}
                    </div>
                    <span className="text-xs font-medium text-slate-300">
                      {service.provider?.name || 'Provider'}
                    </span>
                  </div>

                  {/* Average rating placeholder/icon */}
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>Service Details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4 pb-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-3.5 py-2 rounded-xl border border-white/10 transition"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 text-xs font-bold rounded-xl transition ${
                  page === p
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-3.5 py-2 rounded-xl border border-white/10 transition"
            >
              Next
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Home;
