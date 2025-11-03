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
  'Kids',
  'Drinks'
];

export const menuItems: MenuItem[] = [
  // Main Menu
  {
    id: '1',
    name: 'Steak & Fries',
    description: 'Premium steak served with crispy fries and signature seasoning',
    price: 12.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 20
  },
  {
    id: '2',
    name: 'Deluxe Steak & Fries',
    description: 'Premium quality steak with our signature fries and special seasoning',
    price: 20.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: '3',
    name: 'Fries Only',
    description: 'Crispy fries with our signature seasoning',
    price: 4.00,
    image: '',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 10
  },

  // Kids Menu
  {
    id: '4',
    name: 'Kids Meal',
    description: 'Specially curated meal for kids',
    price: 10.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: '5',
    name: 'Kids Fries',
    description: 'Perfect portion of crispy fries made just for kids',
    price: 2.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 8
  },
  {
    id: '6',
    name: '£1 Steak Cone',
    description: 'Small portion of steak in a convenient cone',
    price: 1.00,
    image: '',
    category: 'Kids',
    isAvailable: true,
    preparationTime: 12
  },

  // Drinks
  {
    id: '7',
    name: 'Can Of Drink',
    description: 'Assorted soft drinks',
    price: 1.50,
    image: '',
    category: 'Drinks',
    isAvailable: true,
    preparationTime: 0
  }
];