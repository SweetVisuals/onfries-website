import { useState, useEffect, useCallback } from 'react';
import { getMenuItems, listenForMenuUpdates, updateMenuAvailability, getStockInventory } from '../lib/database';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
  hiddenFromCustomers?: boolean;
  stockRequirements?: Array<{ stockItem: string; quantity: number }>;
  hasStock?: boolean; // Client-side stock availability check
}

export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get menu items from database
      const items = await getMenuItems();

      // Get stock data for client-side availability checking
      let stockItems = [];
      try {
        stockItems = await getStockInventory();
        console.log('Fetched stock items for client-side checking:', stockItems.map(item => ({
          stock_item: item.stock_item,
          trailer_quantity: item.trailer_quantity,
          lockup_quantity: item.lockup_quantity,
          customer_visible: item.trailer_quantity
        })));
      } catch (stockError) {
        console.error('Error fetching stock items:', stockError);
        // Continue without stock checking if we can't fetch stock
      }

      // Create stock map for availability checking (only trailer stock for customer menu)
      const stockMap = new Map<string, number>();
      stockItems.forEach(item => {
        const trailerStock = item.trailer_quantity || 0;
        stockMap.set(item.stock_item, trailerStock);
      });

      // Debug: Log the items to check what's being fetched
      console.log('Fetched menu items from database:', items);
      console.log('Number of add-ons items:', items.filter(item => item.category === 'Add-ons').length);
      console.log('Add-ons items:', items.filter(item => item.category === 'Add-ons'));

      // Transform the data to match the expected interface
      const transformedItems: MenuItem[] = items.map(item => {
        console.log(`Processing item ${item.name}, stock_requirements:`, item.stock_requirements);

        // Check stock availability on client side
        let hasStock = true;
        let requirements = item.stock_requirements;

        // If no stock requirements in database, use hardcoded fallback
        if (!requirements || requirements.length === 0) {
          // Use hardcoded stock requirements as fallback
          const stockMapFallback: Record<string, Array<{ stockItem: string; quantity: number }>> = {
            // Main Courses
            '567b6a07-f08a-48dc-8401-350900404a5a': [ // Deluxe Steak & Fries
              { stockItem: 'Steaks', quantity: 1 },
              { stockItem: 'Fries', quantity: 1 }
            ],
            'bafb0ca1-7a7d-477c-95db-8340750d5073': [ // Steak & Fries
              { stockItem: 'Steaks', quantity: 1 },
              { stockItem: 'Fries', quantity: 1 }
            ],
            'dcdedc23-359a-4120-9c3c-488386410364': [ // Steak Only
              { stockItem: 'Steaks', quantity: 1 }
            ],
            '135dda9e-ce09-480a-b7cc-fa48a202fa0b': [ // Signature Fries
              { stockItem: 'Fries', quantity: 1 }
            ],

            // Add-ons
            'f119d64e-3340-4552-a207-58171cf328f0': [ // Green Sauce
              { stockItem: 'Green Sauce', quantity: 1 }
            ],
            'f9d7308a-399c-4abe-a125-237fc4722824': [ // Red Sauce
              { stockItem: 'Red Sauce', quantity: 1 }
            ],
            '4d26334c-0d1e-4c3e-8b87-1075c66b678b': [ // Steak (add-on)
              { stockItem: 'Steaks', quantity: 1 }
            ],
            'a1b2c3d4-e5f6-7890-abcd-ef1234567890': [ // Short Rib
              { stockItem: 'Short Rib', quantity: 1 }
            ],
            'b2c3d4e5-f6a7-8901-bcde-f23456789012': [ // Lamb Chop
              { stockItem: 'Lamb', quantity: 1 }
            ],

            // Kids Menu
            '2836bb5e-3d5e-4a8a-8b63-64b55786b5d4': [ // Kids Meal (includes steak and fries)
              { stockItem: 'Steaks', quantity: 1 },
              { stockItem: 'Fries', quantity: 1 }
            ],
            '40902b4c-4e1e-46b3-8d91-e44b0bb800cf': [ // Kids Fries
              { stockItem: 'Fries', quantity: 1 }
            ],
            '73919a44-13f5-4976-9cd5-9ab2ec6a9aef': [ // £1 Steak Cone
              { stockItem: 'Steaks', quantity: 1 }
            ],

            // Drinks
            '4495999f-0737-43c2-a961-9601a2677a66': [ // Coke
              { stockItem: 'Coke / Pepsi', quantity: 1 }
            ],
            '4664385c-0601-4496-94c9-57fbb007a34d': [ // Coke Zero
              { stockItem: 'Coke Zero', quantity: 1 }
            ],
            '992f34f6-6bda-475d-8273-4ba06e115fca': [ // Tango Mango
              { stockItem: 'Tango Mango', quantity: 1 }
            ]
          };

          requirements = stockMapFallback[item.id] || [];
          console.log(`Using fallback stock requirements for ${item.name}:`, requirements);
        }

        if (requirements && requirements.length > 0) {
          for (const req of requirements) {
            const availableStock = stockMap.get(req.stockItem) || 0;
            console.log(`Item ${item.name} requires ${req.quantity} ${req.stockItem}, available: ${availableStock}`);
            if (availableStock < req.quantity) {
              hasStock = false;
              console.log(`Item ${item.name} has insufficient stock for ${req.stockItem}`);
              break;
            }
          }
        } else {
          console.log(`Item ${item.name} has no stock requirements`);
        }

        const finalAvailability = item.is_available && hasStock;
        console.log(`Item ${item.name} final availability: ${finalAvailability} (db: ${item.is_available}, stock: ${hasStock})`);

        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image || '',
          category: item.category,
          isAvailable: finalAvailability, // Combine database availability with stock check
          preparationTime: item.preparation_time || 0,
          hiddenFromCustomers: item.hidden_from_customers,
          stockRequirements: item.stock_requirements,
          hasStock: hasStock
        };
      });

      console.log('Transformed menu items with stock checking:', transformedItems.map(item => ({
        name: item.name,
        isAvailable: item.isAvailable,
        hasStock: item.hasStock,
        category: item.category
      })));

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
    fetchMenuItems();
  }, [fetchMenuItems]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Listen for menu updates (when stock levels change)
  useEffect(() => {
    const unsubscribe = listenForMenuUpdates(() => {
      console.log('Menu refresh triggered by stock change');
      fetchMenuItems();
    });

    return unsubscribe;
  }, [fetchMenuItems]);

  return { menuItems, categories, loading, error, refreshMenu };
};