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
  'Appetizers',
  'Main Courses',
  'Pizza',
  'Pasta',
  'Desserts',
  'Beverages'
];

export const menuItems: MenuItem[] = [
  // Appetizers
  {
    id: '1',
    name: 'Bruschetta',
    description: 'Toasted bread topped with fresh tomatoes, basil, and garlic',
    price: 8.99,
    image: 'https://images.pexels.com/photos/5710204/pexels-photo-5710204.jpeg',
    category: 'Appetizers',
    isAvailable: true,
    preparationTime: 10
  },
  {
    id: '2',
    name: 'Buffalo Wings',
    description: 'Spicy chicken wings served with celery sticks and blue cheese',
    price: 12.99,
    image: 'https://images.pexels.com/photos/2271107/pexels-photo-2271107.jpeg',
    category: 'Appetizers',
    isAvailable: true,
    preparationTime: 15
  },
  {
    id: '3',
    name: 'Mozzarella Sticks',
    description: 'Crispy breaded mozzarella served with marinara sauce',
    price: 9.99,
    image: 'https://images.pexels.com/photos/4394612/pexels-photo-4394612.jpeg',
    category: 'Appetizers',
    isAvailable: true,
    preparationTime: 12
  },

  // Main Courses
  {
    id: '4',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
    price: 24.99,
    image: 'https://images.pexels.com/photos/3622643/pexels-photo-3622643.jpeg',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 25
  },
  {
    id: '5',
    name: 'Ribeye Steak',
    description: '12oz prime ribeye with garlic mashed potatoes and asparagus',
    price: 32.99,
    image: 'https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 30
  },
  {
    id: '6',
    name: 'Chicken Parmesan',
    description: 'Breaded chicken breast with marinara and melted mozzarella',
    price: 19.99,
    image: 'https://images.pexels.com/photos/5718238/pexels-photo-5718238.jpeg',
    category: 'Main Courses',
    isAvailable: true,
    preparationTime: 22
  },

  // Pizza
  {
    id: '7',
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil on thin crust',
    price: 16.99,
    image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 18
  },
  {
    id: '8',
    name: 'Pepperoni Pizza',
    description: 'Classic pepperoni with mozzarella cheese and tomato sauce',
    price: 18.99,
    image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 18
  },
  {
    id: '9',
    name: 'Supreme Pizza',
    description: 'Pepperoni, sausage, peppers, onions, and mushrooms',
    price: 22.99,
    image: 'https://images.pexels.com/photos/4109111/pexels-photo-4109111.jpeg',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 20
  },

  // Pasta
  {
    id: '10',
    name: 'Spaghetti Carbonara',
    description: 'Fresh pasta with pancetta, eggs, parmesan, and black pepper',
    price: 17.99,
    image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    category: 'Pasta',
    isAvailable: true,
    preparationTime: 16
  },
  {
    id: '11',
    name: 'Fettuccine Alfredo',
    description: 'Creamy parmesan sauce with fresh fettuccine pasta',
    price: 15.99,
    image: 'https://images.pexels.com/photos/4518669/pexels-photo-4518669.jpeg',
    category: 'Pasta',
    isAvailable: true,
    preparationTime: 14
  },
  {
    id: '12',
    name: 'Penne Arrabbiata',
    description: 'Spicy tomato sauce with garlic, chili, and fresh herbs',
    price: 14.99,
    image: 'https://images.pexels.com/photos/4518844/pexels-photo-4518844.jpeg',
    category: 'Pasta',
    isAvailable: true,
    preparationTime: 15
  },

  // Desserts
  {
    id: '13',
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers',
    price: 7.99,
    image: 'https://images.pexels.com/photos/6044272/pexels-photo-6044272.jpeg',
    category: 'Desserts',
    isAvailable: true,
    preparationTime: 5
  },
  {
    id: '14',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center and vanilla ice cream',
    price: 8.99,
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
    category: 'Desserts',
    isAvailable: true,
    preparationTime: 12
  },
  {
    id: '15',
    name: 'Cheesecake',
    description: 'New York style cheesecake with berry compote',
    price: 6.99,
    image: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg',
    category: 'Desserts',
    isAvailable: true,
    preparationTime: 5
  },

  // Beverages
  {
    id: '16',
    name: 'Fresh Lemonade',
    description: 'House-made lemonade with fresh lemons and mint',
    price: 3.99,
    image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    category: 'Beverages',
    isAvailable: true,
    preparationTime: 3
  },
  {
    id: '17',
    name: 'Italian Soda',
    description: 'Sparkling water with your choice of flavor syrup',
    price: 4.99,
    image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg',
    category: 'Beverages',
    isAvailable: true,
    preparationTime: 2
  },
  {
    id: '18',
    name: 'House Wine',
    description: 'Red or white wine selection by the glass',
    price: 7.99,
    image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg',
    category: 'Beverages',
    isAvailable: true,
    preparationTime: 2
  }
];