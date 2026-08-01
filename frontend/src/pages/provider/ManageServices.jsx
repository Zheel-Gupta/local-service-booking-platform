import { useState, useEffect, useCallback } from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import {
  getMyServices,
  createService,
  updateService,
  deleteService,
} from '../../services/serviceService';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  Tag,
  Clock,
  DollarSign,
  Wrench,
} from 'lucide-react';

const CATEGORIES = [
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Painting',
  'Carpentry',
  'Appliance Repair',
  'Salon',
  'Tutoring',
  'Gardening',
  'Other',
];

function ManageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null); // null if adding
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electrical',
    description: '',
    price: '',
    duration: '',
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyServices();
      setServices(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'Electrical',
      description: '',
      price: '',
      duration: '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title || '',
      category: service.category || 'Electrical',
      description: service.description || '',
      price: service.price !== undefined && service.price !== null ? String(service.price) : '',
      duration: service.duration || '',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setModalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!formData.title.trim() || !formData.category || formData.price === '') {
      setModalError('Please fill in title, category, and price.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setModalError('Please enter a valid price.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: priceNum,
        duration: formData.duration.trim() || null,
      };

      if (editingService) {
        await updateService(editingService.id, payload);
        setSuccess('Service updated successfully!');
      } else {
        await createService(payload);
        setSuccess('Service created successfully!');
      }

      handleCloseModal();
      fetchServices();
    } catch (err) {
      console.error(err);
      setModalError(err?.response?.data?.message || 'Failed to save service.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setError('');
    setSuccess('');
    try {
      await deleteService(id);
      setSuccess('Service deleted successfully.');
      fetchServices();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to delete service.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Manage Services</h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-100">
                {services.length} Listed
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-0.5 font-medium">
              Create, edit, and manage the services you provide to customers.
            </p>
          </div>

          <button
            id="add-new-service-btn"
            onClick={handleOpenAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-xl transition shadow-md shadow-indigo-100 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>

        {/* Feedback Banners */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-medium mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
            <button onClick={() => setSuccess('')} className="text-emerald-700 font-bold hover:text-emerald-900">✕</button>
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

        {/* Loading / Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader size="lg" />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center my-4 shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 mb-1">No services listed yet</h3>
            <p className="text-gray-500 text-sm font-medium max-w-md mx-auto mb-6">
              You haven't added any services yet. Create your first service listing so customers can book you!
            </p>
            <button
              onClick={handleOpenAddModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-100 inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Service</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {service.category}
                    </span>
                    <span className="text-lg font-extrabold text-gray-900">
                      ${Number(service.price).toFixed(2)}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 mb-2">
                    {service.title}
                  </h3>

                  <p className="text-xs text-gray-500 font-medium line-clamp-3 mb-4 min-h-[3rem]">
                    {service.description || 'No description provided.'}
                  </p>

                  {service.duration && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold mb-4">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="flex-1 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 hover:border-indigo-200 text-gray-700 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(service.id, service.title)}
                    className="bg-gray-50 hover:bg-rose-50 hover:text-rose-600 border border-gray-200 hover:border-rose-200 text-gray-500 text-xs font-bold p-2 rounded-xl transition flex items-center justify-center cursor-pointer"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative animate-fadeIn">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-gray-900 mb-1">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <p className="text-gray-500 text-xs mb-6 font-medium">
              {editingService
                ? 'Update your existing service listing details.'
                : 'Fill in the service details to list it for customers.'}
            </p>

            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3.5 rounded-xl mb-4 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Professional Electrical Wiring Repair"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 49.99"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g. 1 hour, 45 mins"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what is included in this service..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-2.5 rounded-xl border border-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  id="save-service-btn"
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition shadow-md shadow-indigo-100 flex items-center justify-center gap-1 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
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

export default ManageServices;
