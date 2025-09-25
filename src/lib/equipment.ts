import { supabase } from './supabase';
import { Equipment } from '../types';

// Transform database row to Equipment interface
const transformEquipmentRow = (row: any): Equipment => {
  console.log('transformEquipmentRow: Raw database values:', { 
    price_per_unit: row.price_per_unit, 
    units_per_item: row.units_per_item 
  });
  const equipment: Equipment = {
    id: row.id,
    name: row.name,
    mainCategory: row.main_category as 'production' | 'home-ec-set',
    category: row.category,
    subcategory: row.subcategory,
    description: row.description,
    image: row.image,
    specifications: row.specifications || [],
    pricePerUnit: row.price_per_unit || null,
    unitsPerItem: row.units_per_item || 1 // Always default to 1 if null/undefined
  };
  console.log('transformEquipmentRow: Transformed equipment:', { 
    pricePerUnit: equipment.pricePerUnit, 
    unitsPerItem: equipment.unitsPerItem 
  });
  return equipment;
};

// Fetch all equipment
export const fetchAllEquipment = async (): Promise<Equipment[]> => {
  console.log('fetchAllEquipment: Calling Supabase to fetch equipment...');
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name');

  if (error) {
    console.error('fetchAllEquipment: Supabase error:', error);
    throw new Error('Failed to fetch equipment');
  }

  console.log('fetchAllEquipment: Supabase data received:', data);
  return data.map(transformEquipmentRow);
};

// Fetch equipment by main category
export const fetchEquipmentByMainCategory = async (mainCategory: 'production' | 'home-ec-set'): Promise<Equipment[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('main_category', mainCategory)
    .order('name');

  if (error) {
    console.error('Error fetching equipment by main category:', error);
    throw new Error('Failed to fetch equipment');
  }

  return data.map(transformEquipmentRow);
};

// Fetch equipment by category (for filtering)
export const fetchEquipmentByCategory = async (mainCategory: 'production' | 'home-ec-set', category?: string): Promise<Equipment[]> => {
  let query = supabase
    .from('equipment')
    .select('*')
    .eq('main_category', mainCategory);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('name');

  if (error) {
    console.error('Error fetching equipment by category:', error);
    throw new Error('Failed to fetch equipment');
  }

  return data.map(transformEquipmentRow);
};

// Get unique categories for a main category
export const fetchCategories = async (mainCategory: 'production' | 'home-ec-set'): Promise<string[]> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('category')
    .eq('main_category', mainCategory);

  if (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }

  const uniqueCategories = [...new Set(data.map(item => item.category))];
  return uniqueCategories;
};

// Admin functions for equipment management
export const addEquipment = async (equipment: Omit<Equipment, 'id'>): Promise<Equipment> => {
  console.log('addEquipment: Starting with data:', equipment);
  
  try {
    const { data, error } = await supabase
      .from('equipment')
      .insert([{
        name: equipment.name,
        main_category: equipment.mainCategory,
        category: equipment.category,
        subcategory: equipment.subcategory,
        description: equipment.description,
        image: equipment.image,
        specifications: equipment.specifications || [],
        price_per_unit: equipment.pricePerUnit || null,
        units_per_item: equipment.unitsPerItem || 1
      }])
      .select()
      .single();

    console.log('addEquipment: Supabase response - data:', data, 'error:', error);

    if (error) {
      console.error('addEquipment: Supabase error:', error);
      throw new Error('Failed to add equipment');
    }

    console.log('addEquipment: Successfully added equipment:', data);
    return transformEquipmentRow(data);
  } catch (err) {
    console.error('addEquipment: Caught error:', err);
    throw err;
  }
};

export const updateEquipment = async (equipment: Equipment): Promise<Equipment> => {
  const { data, error } = await supabase
    .from('equipment')
    .update({
      name: equipment.name,
      main_category: equipment.mainCategory,
      category: equipment.category,
      subcategory: equipment.subcategory,
      description: equipment.description,
      image: equipment.image,
      specifications: equipment.specifications || [],
      price_per_unit: equipment.pricePerUnit || null,
      units_per_item: equipment.unitsPerItem || 1
    })
    .eq('id', equipment.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating equipment:', error);
    throw new Error('Failed to update equipment');
  }

  return transformEquipmentRow(data);
};

export const deleteEquipment = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('equipment')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting equipment:', error);
    throw new Error('Failed to delete equipment');
  }
};

export const fetchEquipmentById = async (id: number): Promise<Equipment | null> => {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows found
    }
    console.error('Error fetching equipment by ID:', error);
    throw new Error('Failed to fetch equipment');
  }

  return transformEquipmentRow(data);
};

// Fetch equipment count for admin dashboard
export const fetchEquipmentCount = async (): Promise<number> => {
  console.log('fetchEquipmentCount: Calling Supabase to count equipment...');
  const { count, error } = await supabase
    .from('equipment')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('fetchEquipmentCount: Supabase error:', error);
    throw new Error('Failed to fetch equipment count');
  }

  console.log('fetchEquipmentCount: Equipment count:', count);
  return count || 0;
};

// Fetch recent equipment for admin dashboard
export const fetchRecentEquipment = async (limit = 5): Promise<any[]> => {
  console.log(`fetchRecentEquipment: Calling Supabase to fetch ${limit} recent equipment...`);
  const { data, error } = await supabase
    .from('equipment')
    .select('id, name, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('fetchRecentEquipment: Supabase error:', error);
    throw new Error('Failed to fetch recent equipment');
  }

  console.log('fetchRecentEquipment: Recent equipment data received:', data);
  return data || [];
};

// Duplicate equipment
export const duplicateEquipment = async (id: number): Promise<Equipment> => {
  console.log('duplicateEquipment: Starting duplication for ID:', id);

  try {
    const originalEquipment = await fetchEquipmentById(id);

    if (!originalEquipment) {
      throw new Error(`Equipment with ID ${id} not found for duplication.`);
    }

    // Create a new object, omitting id, created_at, updated_at
    const { id: _, created_at: __, updated_at: ___, ...rest } = originalEquipment;
    const newEquipmentData = {
      ...rest,
      name: `${originalEquipment.name} (Copy)`, // Append (Copy) to the name
    };

    console.log('duplicateEquipment: New equipment data prepared:', newEquipmentData);
    const duplicatedItem = await addEquipment(newEquipmentData);
    console.log('duplicateEquipment: Successfully duplicated equipment:', duplicatedItem);
    return duplicatedItem;
  } catch (err) {
    console.error('duplicateEquipment: Error during duplication:', err);
    throw new Error(`Failed to duplicate equipment: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};