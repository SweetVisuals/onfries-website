import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const items = await getMenuItems();
        
        // Transform the data to match the expected interface
        const transformedItems: MenuItem[] = items.map(item => ({
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
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  return { menuItems, categories, loading, error };
};