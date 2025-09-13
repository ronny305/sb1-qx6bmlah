import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Copy, Search, Filter, AlertCircle, ArrowLeft } from 'lucide-react';
import { fetchAllEquipment, deleteEquipment, duplicateEquipment } from '../../lib/equipment';
import { Equipment } from '../../types';

const EquipmentManagementPage: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [duplicating, setDuplicating] = useState<number | null>(null);

  useEffect(() => {
    console.log('EquipmentManagementPage: useEffect triggered, calling loadEquipment');
    loadEquipment();
  }, []);

  useEffect(() => {
    console.log('EquipmentManagementPage: Filtering equipment...');
    filterEquipment();
  }, [equipment, searchTerm, selectedMainCategory]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('EquipmentManagementPage: Starting fetchAllEquipment...');
      const data = await fetchAllEquipment();
      console.log('EquipmentManagementPage: fetchAllEquipment returned data:', data);
      setEquipment(data);
    } catch (err) {
      console.error('EquipmentManagementPage: Error in loadEquipment:', err);
      setError('Failed to load equipment. Please try again.');
    } finally {
      console.log('EquipmentManagementPage: Setting loading to false.');
      setLoading(false);
    }
  };

  const filterEquipment = () => {
    let filtered = equipment;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMainCategory) {
      filtered = filtered.filter(item => item.mainCategory === selectedMainCategory);
    }

    setFilteredEquipment(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!deleteConfirm || deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setDeleting(id);
      await deleteEquipment(id);
      await loadEquipment(); // Reload the list
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting equipment:', err);
      setError('Failed to delete equipment. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      setDuplicating(id);
      await duplicateEquipment(id);
      await loadEquipment(); // Reload the list to show the duplicated item
    } catch (err) {
      console.error('Error duplicating equipment:', err);
      setError('Failed to duplicate equipment. Please try again.');
    } finally {
      setDuplicating(null);
    }
  };

  const mainCategories = ['production', 'home-ec-set'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading equipment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Equipment Inventory</h2>
          <p className="text-gray-600 text-sm">Manage your rental equipment catalog</p>
        </div>
        <Link
          to="/admin/equipment/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Equipment
        </Link>
      </div>

          {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedMainCategory}
                  onChange={(e) => setSelectedMainCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white min-w-[200px]"
                >
                  <option value="">All Categories</option>
                  {mainCategories.map(category => (
                    <option key={category} value={category}>
                      {category === 'production' ? 'Production' : 'Home Economics Set'}
                    </option>
                  ))}
                </select>
              </div>
          </div>
      </div>

        {/* Equipment List - Desktop Table */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredEquipment.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No equipment found</p>
              <p className="text-gray-400 mt-2">Try adjusting your search criteria or add new equipment</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Main Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEquipment.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={item.image}
                            alt={item.name}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.mainCategory === 'production' ? 'Production' : 'Home Economics Set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.subcategory}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/equipment/${item.id}/edit`}
                            className="inline-flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDuplicate(item.id)}
                            disabled={duplicating === item.id}
                            className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                              duplicating === item.id
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                            }`}
                          >
                            {duplicating === item.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></div>
                            ) : (
                              <Copy className="w-4 h-4 mr-1" />
                            )}
                            {duplicating === item.id ? 'Duplicating...' : 'Duplicate'}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className={`inline-flex items-center px-3 py-1 rounded-md transition-colors ${
                              deleteConfirm === item.id
                                ? 'text-white bg-red-600 hover:bg-red-700'
                                : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                            } ${deleting === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            {deleting === item.id ? 'Deleting...' : (deleteConfirm === item.id ? 'Confirm' : 'Delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Equipment List - Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filteredEquipment.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search criteria or add new equipment</p>
            </div>
          ) : (
            filteredEquipment.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex gap-4">
                  {/* Equipment Image */}
                  <div className="w-16 h-16 flex-shrink-0">
                    <img
                      className="w-full h-full rounded-lg object-cover"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>

                  {/* Equipment Details */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{item.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {item.mainCategory === 'production' ? 'Production' : 'Home Ec'}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {item.category}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {item.subcategory}
                      </span>
                      {item.pricePerUnit && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          ${item.pricePerUnit.toFixed(2)}/unit
                        </span>
                      )}
                      {item.unitsPerItem > 1 && (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {item.unitsPerItem} units/item
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Link
                        to={`/admin/equipment/${item.id}/edit`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDuplicate(item.id)}
                        disabled={duplicating === item.id}
                        className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                          duplicating === item.id
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'text-green-600 bg-green-50 hover:bg-green-100'
                        }`}
                      >
                        {duplicating === item.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        {duplicating === item.id ? 'Duplicating...' : 'Duplicate'}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className={`flex-1 inline-flex items-center justify-center px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                          deleteConfirm === item.id
                            ? 'text-white bg-red-600 hover:bg-red-700'
                            : 'text-red-600 bg-red-50 hover:bg-red-100'
                        } ${deleting === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        {deleting === item.id ? 'Deleting...' : (deleteConfirm === item.id ? 'Confirm' : 'Delete')}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Delete Confirmation Message */}
                {deleteConfirm === item.id && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-xs text-red-800 text-center">
                      Tap "Confirm" again to permanently delete this equipment
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Results Summary */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm text-gray-600 gap-2">
            <span>
              Showing {filteredEquipment.length} of {equipment.length} equipment items
            </span>
            {searchTerm || selectedMainCategory ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedMainCategory('');
                }}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear filters
              </button>
            ) : null}
          </div>
        </div>
    </div>
  );
};

export default EquipmentManagementPage;