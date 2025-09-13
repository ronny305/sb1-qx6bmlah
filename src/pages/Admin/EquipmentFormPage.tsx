import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { addEquipment, updateEquipment, fetchEquipmentById, fetchAllEquipment } from '../../lib/equipment';
import { Equipment } from '../../types';

const EquipmentFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [formData, setFormData] = useState({
    name: '',
    mainCategory: 'production' as 'production' | 'home-ec-set',
    category: '',
    subcategory: '',
    description: '',
    image: '',
    specifications: '', // Will be converted to array
    price: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  console.log('EquipmentFormPage: Component rendered, isEditing:', isEditing, 'id:', id);

  useEffect(() => {
    if (isEditing && id) {
      console.log('EquipmentFormPage: Loading equipment for editing, id:', id);
      loadEquipment(parseInt(id));
    }
  }, [id, isEditing]);

  useEffect(() => {
    loadAvailableCategories();
  }, []);

  const loadAvailableCategories = async () => {
    try {
      setCategoriesLoading(true);
      const allEquipment = await fetchAllEquipment();
      const uniqueCategories = [...new Set(allEquipment.map(item => item.category))].sort();
      setAvailableCategories(uniqueCategories);
    } catch (err) {
      console.error('Error loading categories:', err);
      // Don't set error state for categories, just log it
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadEquipment = async (equipmentId: number) => {
    try {
      setLoading(true);
      const equipment = await fetchEquipmentById(equipmentId);
      console.log('loadEquipment: Received equipment data:', equipment);
      console.log('loadEquipment: Equipment price value:', equipment?.price);
      if (equipment) {
        setFormData({
          name: equipment.name,
          mainCategory: equipment.mainCategory,
          category: equipment.category,
          subcategory: equipment.subcategory,
          description: equipment.description,
          image: equipment.image,
          specifications: equipment.specifications?.join(', ') || '',
          price: equipment.price?.toString() || ''
        });
        console.log('loadEquipment: Price converted to string for form:', equipment.price?.toString() || '');
      }
    } catch (err) {
      setError('Failed to load equipment data.');
      console.error('Error loading equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('EquipmentFormPage: Form submitted, formData:', formData);
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const equipmentData = {
        name: formData.name.trim(),
        mainCategory: formData.mainCategory,
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        specifications: formData.specifications.trim() 
          ? formData.specifications.split(',').map(s => s.trim()).filter(s => s)
          : [],
        price: formData.price.trim() ? parseFloat(formData.price) : null
      };

      console.log('EquipmentFormPage: Prepared equipment data:', equipmentData);

      if (isEditing && id) {
        console.log('EquipmentFormPage: Updating equipment...');
        await updateEquipment({ ...equipmentData, id: parseInt(id) });
        console.log('EquipmentFormPage: Equipment updated successfully');
      } else {
        console.log('EquipmentFormPage: Adding new equipment...');
        await addEquipment(equipmentData);
        console.log('EquipmentFormPage: Equipment added successfully');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/equipment');
      }, 1500);
    } catch (err) {
      console.error('EquipmentFormPage: Error saving equipment:', err);
      setError(isEditing ? 'Failed to update equipment.' : 'Failed to add equipment.');
    } finally {
      console.log('EquipmentFormPage: Setting loading to false');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading && isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {isEditing ? 'Edit Equipment' : 'Add New Equipment'}
          </h2>
          <p className="text-gray-600 text-sm">
            {isEditing ? 'Update equipment information' : 'Add a new piece of equipment to your inventory'}
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
            <p className="text-green-800">
              Equipment {isEditing ? 'updated' : 'added'} successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Equipment Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., Sony FX6 Cinema Camera"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Main Category *
                  </label>
                  <select
                    name="mainCategory"
                    value={formData.mainCategory}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="production">Production Equipment</option>
                    <option value="home-ec-set">Home Ec Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    disabled={categoriesLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">
                      {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                    </option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {!categoriesLoading && availableCategories.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No existing categories found. You can still manually enter a new category above.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategory *
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="e.g., cameras, microphones, mixers"
                  />
                </div>
              </div>
            </div>

            {/* Description and Image */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Provide a detailed description of the equipment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specifications
                  </label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Enter specifications separated by commas (e.g., Full Frame Sensor, 4K Recording, Weather Sealed)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Separate multiple specifications with commas
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Per Unit (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        name="pricePerUnit"
                        value={formData.pricePerUnit}
                        onChange={handleChange}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Daily rental rate per individual unit
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Units Per Item *
                    </label>
                    <input
                      type="number"
                      name="unitsPerItem"
                      value={formData.unitsPerItem}
                      onChange={handleChange}
                      min="1"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Number of individual units in this rental item (e.g., 50 chairs)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </div>
                ) : (
                  <>
                    <Save className="mr-2" size={20} />
                    {isEditing ? 'Update Equipment' : 'Add Equipment'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EquipmentFormPage;