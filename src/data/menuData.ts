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
  // Main Courses - Reorganized by ascending price
  {
    id: '1',
    name: 'Steak & Fries',
    description: 'Classic steak served with crispy fries and signature seasoning',
    price: 12.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20
  },
  {
    id: '2',
    name: 'Deluxe Steak & Fries',
    description: 'Premium steak with crispy fries',
    price: 20.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: '3',
    name: 'Premium Steak & Fries',
    description: 'Top-quality steak with premium fries',
    price: 30.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 30
  },
  {
    id: '4',
    name: 'Quadzilla & Fries',
    description: 'Massive portion for the ultimate appetite',
    price: 40.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 35
  },
  {
    id: '5',
    name: 'Centurion',
    description: 'The king of all steaks',
    price: 50.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 40
  },

  // Add-ons
  {
    id: '7',
    name: 'Lamb Chops x2',
    description: 'Two premium lamb chops',
    price: 11.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '8',
    name: 'Short Ribs x2',
    description: 'Two tender short ribs',
    price: 6.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '9',
    name: 'Green Sauce',
    description: 'Extra green sauce add-on',
    price: 2.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '10',
    name: 'Red Sauce',
    description: 'Extra red sauce add-on',
    price: 2.00,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '11',
    name: 'Can of Drink',
    description: 'Assorted soft drinks',
    price: 1.50,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '12',
    name: '£1 Steak Special',
    description: 'Special steak offer at £1',
    price: 1.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 15
  }
];