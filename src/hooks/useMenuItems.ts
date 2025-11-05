import { useState, useEffect, useCallback } from 'react';
import { getMenuItems } from '../lib/database';
import { menuItems as localMenuItems } from '../data/menuData';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
}

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Use local menu data instead of database for immediate changes
      let items = localMenuItems;

      // Debug: Log the items to check what's being fetched
      console.log('Using local menu items:', items);
      console.log('Number of add-ons items:', items.filter(item => item.category === 'Add-ons').length);
      console.log('Add-ons items:', items.filter(item => item.category === 'Add-ons'));

      // Transform the data to match the expected interface
      const transformedItems: MenuItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image || '',
        category: item.category,
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime || 0,
      }));

      setMenuItems(transformedItems);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(transformedItems.map(item => item.category)));
      setCategories(['All', ...uniqueCategories]);

      console.log('Final transformed menu items:', transformedItems);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMenu = useCallback(() => {
    fetchMenuItems(true);
  }, [fetchMenuItems]);

  useEffect(() => {
    fetchMenuItems(false);
  }, [fetchMenuItems]);

  return { menuItems, categories, loading, error, refreshMenu };
};