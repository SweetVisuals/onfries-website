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
    name: 'Steak and Fries',
    description: 'Juicy steak served with crispy fries',
    price: 15.99,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20
  },

  // Add-ons
  {
    id: '2',
    name: 'Green Sauce',
    description: 'Extra green sauce add-on',
    price: 1.50,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  },
  {
    id: '3',
    name: 'Red Sauce',
    description: 'Extra red sauce add-on',
    price: 1.50,
    image: '',
    category: 'Add-ons',
    isAvailable: true,
    preparationTime: 0
  }
];