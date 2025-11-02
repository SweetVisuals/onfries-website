export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number; // in minutes
}

export const menuCategories = [
  'All',
  'Main Courses',
  'Add-ons'
];

export const menuItems: MenuItem[] = [
  // Main Courses
  {
    id: '1',
    name: 'Premium Steak & Fries',
    description: 'Premium steak served with crispy fries and signature seasoning',
    price: 12.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20
  },
  {
    id: '8',
    name: 'Fries',
    description: 'Crispy fries with signature seasoning',
    price: 5.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 10
  },

  // Add-ons
  {
    id: '2',
    name: 'Steak',
    description: 'Add an extra steak to your meal',
    price: 10.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '3',
    name: 'Short Ribs x2',
    description: 'Two tender short ribs - perfect with your steak and fries',
    price: 6.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '4',
    name: 'Lamb Chops x2',
    description: 'Two premium lamb chops - premium add-on for your steak and fries',
    price: 11.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '5',
    name: 'Green Sauce',
    description: 'Extra green sauce add-on',
    price: 2.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '6',
    name: 'Red Sauce',
    description: 'Extra red sauce add-on',
    price: 2.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '7',
    name: 'Can of Drink',
    description: 'Assorted soft drinks',
    price: 1.50,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  }
];