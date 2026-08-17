import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { getAllServices } from '../../services/serviceService';
import { useAuth } from '../../context/AuthContext';
import {
  Search, MapPin, Zap, Droplet, Paintbrush, Sparkles, Scissors,
  Wind, Hammer, BookOpen, Sprout, Star, BadgeCheck,
  SlidersHorizontal, RotateCcw, ArrowRight, ChevronLeft, ChevronRight,
  Clock, Shield, ThumbsUp, Heart, CheckCircle2, DollarSign, Headphones,
  Smile, ChevronDown, Check, Locate, Loader2, Tag, X
} from 'lucide-react';

/* ─── PLACEHOLDER CONSTANTS (Easily swap with real image URLs) ──────────────── */
export const HERO_IMAGE_PLACEHOLDER = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80";
export const PROMO_BANNER_PLACEHOLDER = "https://placehold.co/500x300/6366F1/FFF?text=50%25+OFF";
export const CUSTOMER_TESTIMONIAL_AVATAR = "https://placehold.co/100x100/4F46E5/FFF?text=Sarah";

export const AVATAR_STACK_PLACEHOLDERS = [
  "https://placehold.co/100x100/6366F1/FFF?text=U1",
  "https://placehold.co/100x100/818CF8/FFF?text=U2",
  "https://placehold.co/100x100/A5B4FC/FFF?text=U3",
];

export const PROVIDER_CARD_PLACEHOLDERS = [
  "https://placehold.co/400x300/4F46E5/FFF?text=Electrician+Work",
  "https://placehold.co/400x300/0EA5E9/FFF?text=Plumbing+Work",
  "https://placehold.co/400x300/F97316/FFF?text=Carpentry+Work",
  "https://placehold.co/400x300/EC4899/FFF?text=Painting+Work",
];

/* ─── CATEGORY → REAL PHOTO MAPPING (populated after image imports below) ─── */
// Defined as a regular object here; the actual values reference local images
// imported further down (imports are hoisted by the bundler, so this works fine).


export const PROVIDER_AVATAR_PLACEHOLDERS = [
  "https://placehold.co/100x100/4F46E5/FFF?text=J",
  "https://placehold.co/100x100/3B82F6/FFF?text=M",
  "https://placehold.co/100x100/10B981/FFF?text=A",
  "https://placehold.co/100x100/8B5CF6/FFF?text=S",
];

/* ─── GALLERY IMAGES (High-quality real project/work photos) ──────────────── */
import electricianImg from '../../images/electrician.jpeg';
import paintingImg from '../../images/painting.jpeg';
import plumberImg from '../../images/plumber.jpeg';
import carpentaryImg from '../../images/carpentary.jpeg';
import homeImg from '../../images/home cleaning.jpeg';
import salonImg from '../../images/spa & salon.jpeg';
import interiorImg from '../../images/interior.jpeg';

/* Slideshow images for hero section (subset of gallery) */
const HERO_SLIDESHOW_IMAGES = [
  electricianImg,
  plumberImg,
  paintingImg,
  homeImg,
];

/* ─── CATEGORY → LOCAL IMAGE MAPPING ────────────────────────────────────── */
export const CATEGORY_IMAGES = {
  Electrician: electricianImg,
  Electrical:  electricianImg,
  Plumbing:    plumberImg,
  Cleaning:    homeImg,
  Painting:    paintingImg,
  Carpentry:   carpentaryImg,
  Salon:       salonImg,
  Interior:    interiorImg,
};
const DEFAULT_CATEGORY_IMAGE = electricianImg;

export const GALLERY_IMAGES = [
  { src: electricianImg, label: "Electrician", category: "Electrical", span: "" },
  { src: plumberImg, label: "Plumbing", category: "Plumbing",   span: "" },
  { src: homeImg, label: "Home Cleaning", category: "Cleaning",   span: "" },
  { src: paintingImg, label: "Painting", category: "Painting",   span: "" },
  { src: carpentaryImg, label: "Carpentry Work", category: "Carpentry",  span: "" },
  { src: salonImg, label: "Salon & Spa",  category: "Salon",      span: "" },
  { src: interiorImg, label: "Interior Designer",  category: "Interior",      span: "" },
];

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

const CATEGORIES = ['All','Plumbing','Electrical','Cleaning','Appliance Repair','Tutoring','Carpentry','Painting','Salon','Gardening','Other'];

const CATEGORY_CONFIG = {
  'All':           { icon: Sparkles,   bg: 'bg-violet-100', text: 'text-violet-600', label: 'All' },
  'Electrical':    { icon: Zap,        bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Electrician' },
  'Plumbing':      { icon: Droplet,    bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'Plumber' },
  'Painting':      { icon: Paintbrush, bg: 'bg-pink-100',   text: 'text-pink-600',   label: 'Painter' },
  'Cleaning':      { icon: Sparkles,   bg: 'bg-green-100',  text: 'text-green-600',  label: 'Cleaning' },
  'Salon':         { icon: Scissors,   bg: 'bg-rose-100',   text: 'text-rose-600',   label: 'Salon & Spa' },
  'Appliance Repair':{ icon: Wind,     bg: 'bg-sky-100',    text: 'text-sky-600',    label: 'AC Repair' },
  'Carpentry':     { icon: Hammer,     bg: 'bg-orange-100', text: 'text-orange-600', label: 'Carpenter' },
  'Tutoring':      { icon: BookOpen,   bg: 'bg-purple-100', text: 'text-purple-600', label: 'Tutoring' },
  'Gardening':     { icon: Sprout,     bg: 'bg-lime-100',   text: 'text-lime-600',   label: 'Gardening' },
  'Other':         { icon: Hammer,     bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Other' },
};

function StarRating({ rating = 4.8, size = 'sm' }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  const cls = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => <Star key={`f${i}`} className={`${cls} text-yellow-400 fill-yellow-400`} />)}
      {half && <Star className={`${cls} text-yellow-400 fill-yellow-200`} />}
      {[...Array(empty)].map((_, i) => <Star key={`e${i}`} className={`${cls} text-gray-300 fill-transparent`} />)}
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // ─── Coupon toast state ────────────────────────────────────────────────────
  const [couponToast, setCouponToast] = useState(null); // null | 'success' | 'already'
  const couponTimerRef = useRef(null);

  const handleClaimOffer = () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    const existing = localStorage.getItem('appliedCoupon');
    if (existing === 'FIRST50') {
      setCouponToast('already');
    } else {
      localStorage.setItem('appliedCoupon', 'FIRST50');
      setCouponToast('success');
    }
    if (couponTimerRef.current) clearTimeout(couponTimerRef.current);
    couponTimerRef.current = setTimeout(() => setCouponToast(null), 4000);
  };

  // Cleanup timer on unmount
  useEffect(() => () => { if (couponTimerRef.current) clearTimeout(couponTimerRef.current); }, []);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [services, setServices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ─── Hero slideshow state ────────────────────────────────────────────────
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideFading, setSlideFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideFading(true);
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % HERO_SLIDESHOW_IMAGES.length);
        setSlideFading(false);
      }, 500); // fade-out duration
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ─── Location selector state (hero search bar) ─────────────────────────
  const [selectedLocation, setSelectedLocation] = useState('Delhi');
  const [heroLocationOpen, setHeroLocationOpen] = useState(false);
  const [isHeroLocating, setIsHeroLocating] = useState(false);
  const [heroLocationError, setHeroLocationError] = useState('');
  const heroLocationRef = useRef(null);

  const handleHeroUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setHeroLocationError('Could not detect location');
      return;
    }
    setIsHeroLocating(true);
    setHeroLocationError('');

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
          setHeroLocationOpen(false);
          setHeroLocationError('');
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          setHeroLocationError('Could not detect location');
        } finally {
          setIsHeroLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setHeroLocationError('Could not detect location');
        setIsHeroLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Close hero location dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (heroLocationRef.current && !heroLocationRef.current.contains(e.target)) {
        setHeroLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Fetch services ────────────────────────────────────────────────────
  const fetchServices = useCallback(async (overridePage) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = { page: overridePage ?? page, limit: 6, sortBy };
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

  useEffect(() => { fetchServices(); }, [fetchServices]);

  // On form submit: if page is already 1, call fetchServices directly;
  // otherwise setPage(1) which triggers useEffect → fetchServices.
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (page === 1) {
      fetchServices(1);
    } else {
      setPage(1);
    }
  };

  const handleResetFilters = () => {
    setSearch(''); setCategory('All'); setMinPrice(''); setMaxPrice(''); setSortBy('newest'); setPage(1);
  };

  const getCat = (cat) => CATEGORY_CONFIG[cat] || CATEGORY_CONFIG['Other'];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* ─── HERO SECTION ─────────────────────────────────────────── */}
      <section className="bg-[#111638] text-white pt-10 pb-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 border border-white/10">
                <div className="flex -space-x-1.5">
                  {AVATAR_STACK_PLACEHOLDERS.map((url, i) => (
                    <img key={i} src={url} alt="Customer Avatar Placeholder" className="w-5 h-5 rounded-full object-cover border border-white" />
                  ))}
                </div>
                <span className="text-gray-300 text-xs ml-1">Trusted by 30,000+ customers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4">
                Book Trusted<br />
                <span className="text-indigo-400">Local Services</span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg mb-8 max-w-lg leading-relaxed font-normal">
                Find verified professionals for your home and business needs. Quality work, guaranteed satisfaction.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full border-0 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
                {/* ─── Hero Location Selector ───────────────────────── */}
                <div ref={heroLocationRef} className="relative shrink-0">
                  <button
                    id="hero-location-btn"
                    type="button"
                    onClick={() => setHeroLocationOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-all w-full"
                  >
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="max-w-[120px] truncate">{selectedLocation}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ml-auto ${
                        heroLocationOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {heroLocationOpen && (
                    <div className="absolute left-0 bottom-full mb-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="p-1.5">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                          Select Location
                        </p>

                        <button
                          id="hero-use-current-location-btn"
                          type="button"
                          onClick={handleHeroUseCurrentLocation}
                          disabled={isHeroLocating}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors text-left disabled:opacity-50 mb-1"
                        >
                          {isHeroLocating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600 shrink-0" />
                          ) : (
                            <Locate className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          )}
                          <span>{isHeroLocating ? 'Detecting location...' : 'Use my current location'}</span>
                        </button>

                        {heroLocationError && (
                          <div className="px-3 py-1.5 mb-1 bg-red-50 text-red-600 text-[11px] font-medium rounded-lg">
                            {heroLocationError}
                          </div>
                        )}

                        <div className="border-t border-gray-100 pt-1">
                          {LOCATIONS.map((loc) => (
                            <button
                              key={loc}
                              id={`hero-location-${loc.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`}
                              type="button"
                              onClick={() => { setSelectedLocation(loc); setHeroLocationOpen(false); setHeroLocationError(''); }}
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

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-md text-sm shrink-0"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Right Hero Image — Auto-Rotating Slideshow */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">

                {/* Slideshow container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 bg-indigo-900">
                  <img
                    key={slideIndex}
                    src={HERO_SLIDESHOW_IMAGES[slideIndex]}
                    alt="Service showcase"
                    className="w-full h-[420px] object-cover"
                    style={{
                      opacity: slideFading ? 0 : 1,
                      transition: 'opacity 0.5s ease-in-out',
                    }}
                  />
                  {/* Subtle bottom gradient for polish */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111638]/50 via-transparent to-transparent pointer-events-none" />

                  {/* Slide indicator dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {HERO_SLIDESHOW_IMAGES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setSlideFading(false); setSlideIndex(i); }}
                        className={`rounded-full transition-all duration-300 ${
                          i === slideIndex
                            ? 'w-5 h-2 bg-white'
                            : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4 TRUST BADGES ROW ─────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: CheckCircle2, title: 'Verified Professionals', desc: 'Background checked', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { icon: DollarSign,     title: 'Upfront Pricing',       desc: 'No hidden charges',   color: 'text-indigo-600',  bg: 'bg-indigo-50' },
              { icon: ThumbsUp,       title: 'Satisfaction Guarantee',desc: '100% guaranteed',    color: 'text-rose-600',    bg: 'bg-rose-50' },
              { icon: Clock,          title: '24/7 Support',          desc: "We're here to help",  color: 'text-purple-600',  bg: 'bg-purple-50' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition">
                <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900">{title}</h4>
                  <p className="text-[11px] text-gray-500 font-medium">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── POPULAR CATEGORIES ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Popular Categories</h2>
          <button
            onClick={() => { setCategory('All'); setPage(1); }}
            className="text-xs text-indigo-600 font-extrabold hover:text-indigo-700"
          >
            View all
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-11 gap-3">
          {CATEGORIES.map((cat) => {
            const { icon: Icon, bg, text, label } = getCat(cat);
            const isSelected = category === cat;
            return (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setPage(1); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all cursor-pointer text-center ${
                  isSelected
                    ? 'bg-indigo-600 shadow-md shadow-indigo-200 scale-105'
                    : 'bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : bg}`}>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : text}`} />
                </div>
                <span className={`text-[11px] font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── TOP RATED PROFESSIONALS GRID ─────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filter Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" /> Filters
                </h3>
                <button onClick={handleResetFilters} className="text-xs text-indigo-600 font-bold hover:text-indigo-700">Clear all</button>
              </div>

              {/* Category Filter */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3">Category</h4>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3">Price Range ($)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number" placeholder="Min" value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-gray-400 font-bold text-sm">–</span>
                  <input
                    type="number" placeholder="Max" value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    className="w-1/2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-3">Sort By</h4>
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Professionals Card Grid */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900">
                Top Rated Professionals
              </h2>
              <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full font-semibold">
                {totalResults} found
              </span>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 text-sm font-medium">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-20 flex justify-center"><Loader size="lg" /></div>
            ) : services.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                <Search className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">No services found</h3>
                <p className="text-gray-500 text-sm mb-5">Try adjusting your filters.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  {services.map((service, index) => {
                    const { text, bg } = getCat(service.category);
                    const photoPlaceholder = service.imageUrl ||
                      CATEGORY_IMAGES[service.category] ||
                      DEFAULT_CATEGORY_IMAGE;
                    const avatarPlaceholder = service.provider?.profileImage || PROVIDER_AVATAR_PLACEHOLDERS[index % PROVIDER_AVATAR_PLACEHOLDERS.length];

                    return (
                      <div
                        key={service.id}
                        onClick={() => navigate(`/customer/service/${service.id}`)}
                        className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          {/* Photo Placeholder Container */}
                          <div className="relative h-40 w-full bg-gray-100 overflow-hidden">
                            <img
                              src={photoPlaceholder}
                              alt={service.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-600 hover:text-rose-500 transition">
                              <Heart className="w-3.5 h-3.5" />
                            </div>
                            <span className={`absolute top-2.5 left-2.5 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${bg} ${text} border border-white/50 shadow-sm`}>
                              {service.category}
                            </span>
                          </div>

                          {/* Card Content Body */}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <img
                                src={avatarPlaceholder}
                                alt={service.provider?.name || 'Provider'}
                                className="w-7 h-7 rounded-full object-cover border border-white shadow-sm shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <h4 className="text-xs font-extrabold text-gray-900 truncate">
                                    {service.provider?.name || 'John Professional'}
                                  </h4>
                                  <BadgeCheck className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
                                </div>
                              </div>
                            </div>

                            <h3 className="font-extrabold text-gray-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
                              {service.title}
                            </h3>

                            <div className="flex items-center gap-1 mb-3">
                              <StarRating rating={4.8} />
                              <span className="text-xs font-bold text-gray-800 ml-0.5">4.8</span>
                              <span className="text-[10px] text-gray-400">(128)</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-4 pt-0">
                          <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                            <div>
                              <span className="text-[10px] text-gray-400 font-medium block leading-none">From</span>
                              <span className="text-sm font-extrabold text-gray-900">${service.price}<span className="text-[10px] font-normal text-gray-500">/hr</span></span>
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl transition shadow-md shadow-indigo-100">
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 text-xs font-extrabold rounded-xl transition ${
                          page === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40"
                    >
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── IMAGE GALLERY SECTION ─────────────────────────────────── */}
        <section className="mt-14 mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Our Work in Action</h2>
              <p className="text-gray-500 text-sm mt-1">Real photos from our verified professionals</p>
            </div>
            <button className="text-xs text-indigo-600 font-extrabold hover:text-indigo-700 flex items-center gap-1">
              View all photos <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Masonry-style photo grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`relative group rounded-2xl overflow-hidden cursor-pointer bg-gray-900 shadow-md ${
                  img.span === 'row-span-2' ? 'row-span-2' : ''
                }`}
              >
                <img
                  src={img.src}
                  alt={img.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                {/* Gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

                {/* Text container with p-4 sm:p-6, break-words, overflow-hidden, and contained font size */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 overflow-hidden flex flex-col justify-end pointer-events-none">
                  <h3 className="text-white text-sm sm:text-base font-bold leading-tight break-words overflow-hidden max-w-full">
                    {img.label}
                  </h3>
                  <span className="text-indigo-200 text-xs font-semibold mt-1 block break-words overflow-hidden max-w-full">
                    {img.category}
                  </span>
                </div>

                {/* Corner badge */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="bg-white/95 backdrop-blur text-gray-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm max-w-[calc(100%-24px)] truncate block">
                    {img.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── PROMO BANNER ─────────────────────────────────────────── */}
        <section className="mt-0 mb-14">
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-lg">
              <span className="inline-block bg-yellow-400/20 text-yellow-300 text-xs font-extrabold px-3 py-1 rounded-full mb-3 border border-yellow-400/30">
                ⚡ Limited Time Offer
              </span>
              <h3 className="text-3xl font-extrabold text-white mb-2">50% OFF on Your First Booking</h3>
              <p className="text-indigo-200 text-sm mb-6">Use code: <span className="font-extrabold text-yellow-300 text-base">FIRST50</span></p>
              <button
                id="claim-offer-btn"
                onClick={handleClaimOffer}
                className="bg-white hover:bg-yellow-50 text-indigo-600 font-extrabold text-sm px-6 py-3 rounded-xl transition shadow-lg hover:shadow-yellow-200/50 active:scale-95"
              >
                Claim Offer
              </button>
            </div>
            
            {/* ── Right-side visual: Unsplash image + overlay badge ── */}
            <div className="relative z-10 shrink-0 w-64 h-44 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              {/* Background image */}
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80"
                alt="Home service discount"
                className="w-full h-full object-cover"
              />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-black/70" />

              {/* Discount tag icon + text overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="bg-yellow-400/20 border-2 border-yellow-400/60 rounded-full p-3 backdrop-blur-sm">
                  <Tag className="w-8 h-8 text-yellow-300" strokeWidth={2.5} />
                </div>
                <p className="text-white text-5xl font-black tracking-tight leading-none drop-shadow-lg">50%</p>
                <p className="text-yellow-300 text-sm font-extrabold uppercase tracking-widest drop-shadow">OFF</p>
                <span className="mt-1 text-white/70 text-[11px] font-semibold bg-white/10 px-3 py-0.5 rounded-full">
                  First Booking
                </span>
              </div>

              {/* Decorative glow rings */}
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-yellow-400/20 blur-xl" />
              <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-indigo-400/20 blur-xl" />
            </div>
          </div>
        </section>

        {/* ─── COUPON TOAST ──────────────────────────────────────────── */}
        {couponToast && (
          <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold"
            style={{
              background: couponToast === 'success'
                ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
                : 'linear-gradient(135deg,#d97706,#b45309)',
              color: '#fff',
              minWidth: '320px',
              animation: 'slideUpFadeIn 0.35s ease-out',
            }}
          >
            {couponToast === 'success' ? (
              <>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-white">Coupon Applied! 🎉</p>
                  <p className="text-white/80 text-xs font-medium">
                    <span className="text-yellow-300 font-black">FIRST50</span> will be used at checkout.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-white">Already Applied</p>
                  <p className="text-white/80 text-xs font-medium">
                    Coupon <span className="text-yellow-300 font-black">FIRST50</span> is already saved for checkout.
                  </p>
                </div>
              </>
            )}
            <button
              onClick={() => setCouponToast(null)}
              className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition shrink-0"
              aria-label="Dismiss coupon toast"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        )}

        {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
        <section className="mb-14">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-500 text-sm">Get your service done in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { step: '1', icon: Search,     title: 'Search', desc: 'Find the service you need' },
              { step: '2', icon: BadgeCheck, title: 'Choose', desc: 'Select a verified pro' },
              { step: '3', icon: Clock,      title: 'Book',   desc: 'Pick date and time' },
              { step: '4', icon: Smile,      title: 'Relax',  desc: "We'll handle the rest" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm text-center">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-sm mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── TESTIMONIAL / WHAT OUR CUSTOMERS SAY ─────────────────── */}
        <section className="bg-[#111638] text-white rounded-3xl p-8 sm:p-10">
          <h2 className="text-2xl font-extrabold mb-6">What Our Customers Say</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={CUSTOMER_TESTIMONIAL_AVATAR}
                alt="Sarah Johnson Avatar Placeholder"
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-400"
              />
              <div>
                <p className="text-gray-300 text-sm italic max-w-lg leading-relaxed mb-2">
                  "Very quick and professional service. The electrician fixed my issue in no time."
                </p>
                <p className="font-extrabold text-white text-sm">Sarah Johnson</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-2 rounded-2xl shrink-0">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-extrabold text-lg text-white">4.9</span>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default Home;
