import { useState, useEffect, useCallback } from 'react';
import { getMenuItems } from '../lib/database';

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
      
      // Add cache busting parameter if force refresh
      if (forceRefresh) {
        // Force refresh by adding cache buster
        console.log('Forcing menu refresh');
      }
      const items = await getMenuItems();
      
      // Debug: Log the items to check what's being fetched
      console.log('Fetched menu items:', items);
      console.log('Number of add-ons items:', items.filter(item => item.category === 'Add-ons').length);
      console.log('Add-ons items:', items.filter(item => item.category === 'Add-ons'));
      
      // Filter out any old steak variations that shouldn't be there
      const filteredItems = items.filter(item => {
        const isOldItem = item.name.includes('Centurion') ||
                         item.name === 'Premium Steak & Fries' ||
                         item.name.includes('Quadzilla');
        return !isOldItem;
      });
      
      console.log('Filtered menu items (removed old steak variants):', filteredItems);
      
      // Transform the data to match the expected interface
      const transformedItems: MenuItem[] = filteredItems.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: parseFloat(item.price.toString()),
        image: item.image || '',
        category: item.category,
        isAvailable: item.is_available,
        preparationTime: item.preparation_time || 0,
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