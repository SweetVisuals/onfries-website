import { MenuItem } from './menuData';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    item: MenuItem;
    quantity: number;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  estimatedDelivery?: string;
  notes?: string;
}

export const dummyOrders: Order[] = [
  {
    id: '001',
    customerId: '2',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      {
        item: {
          id: '7',
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, tomato sauce, and basil on thin crust',
          price: 16.99,
          image: 'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg',
          category: 'Pizza',
          isAvailable: true,
          preparationTime: 18
        },
        quantity: 2
      },
      {
        item: {
          id: '16',
          name: 'Fresh Lemonade',
          description: 'House-made lemonade with fresh lemons and mint',
          price: 3.99,
          image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
          category: 'Beverages',
          isAvailable: true,
          preparationTime: 3
        },
        quantity: 2
      }
    ],
    total: 41.96,
    status: 'preparing',
    orderDate: '2024-12-27T12:30:00Z',
    estimatedDelivery: '2024-12-27T13:00:00Z',
    notes: 'Extra basil please'
  },
  {
    id: '002',
    customerId: '3',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      {
        item: {
          id: '4',
          name: 'Grilled Salmon',
          description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
          price: 24.99,
          image: 'https://images.pexels.com/photos/3622643/pexels-photo-3622643.jpeg',
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 25
        },
        quantity: 1
      },
      {
        item: {
          id: '18',
          name: 'House Wine',
          description: 'Red or white wine selection by the glass',
          price: 7.99,
          image: 'https://images.pexels.com/photos/602750/pexels-photo-602750.jpeg',
          category: 'Beverages',
          isAvailable: true,
          preparationTime: 2
        },
        quantity: 1
      }
    ],
    total: 32.98,
    status: 'ready',
    orderDate: '2024-12-27T11:45:00Z',
    estimatedDelivery: '2024-12-27T12:15:00Z',
    notes: 'White wine please'
  },
  {
    id: '003',
    customerId: '2',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    items: [
      {
        item: {
          id: '10',
          name: 'Spaghetti Carbonara',
          description: 'Fresh pasta with pancetta, eggs, parmesan, and black pepper',
          price: 17.99,
          image: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
          category: 'Pasta',
          isAvailable: true,
          preparationTime: 16
        },
        quantity: 1
      },
      {
        item: {
          id: '13',
          name: 'Tiramisu',
          description: 'Classic Italian dessert with coffee-soaked ladyfingers',
          price: 7.99,
          image: 'https://images.pexels.com/photos/6044272/pexels-photo-6044272.jpeg',
          category: 'Desserts',
          isAvailable: true,
          preparationTime: 5
        },
        quantity: 1
      }
    ],
    total: 25.98,
    status: 'delivered',
    orderDate: '2024-12-26T19:30:00Z',
    estimatedDelivery: '2024-12-26T20:00:00Z'
  },
  {
    id: '004',
    customerId: '3',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      {
        item: {
          id: '1',
          name: 'Bruschetta',
          description: 'Toasted bread topped with fresh tomatoes, basil, and garlic',
          price: 8.99,
          image: 'https://images.pexels.com/photos/5710204/pexels-photo-5710204.jpeg',
          category: 'Appetizers',
          isAvailable: true,
          preparationTime: 10
        },
        quantity: 1
      },
      {
        item: {
          id: '8',
          name: 'Pepperoni Pizza',
          description: 'Classic pepperoni with mozzarella cheese and tomato sauce',
          price: 18.99,
          image: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg',
          category: 'Pizza',
          isAvailable: true,
          preparationTime: 18
        },
        quantity: 1
      }
    ],
    total: 27.98,
    status: 'pending',
    orderDate: '2024-12-27T13:15:00Z',
    estimatedDelivery: '2024-12-27T14:00:00Z'
  }
];

export const getOrdersByCustomer = (customerId: string): Order[] => {
  return dummyOrders.filter(order => order.customerId === customerId);
};

export const getTodaysOrders = (): Order[] => {
  const today = new Date().toDateString();
  return dummyOrders.filter(order => 
    new Date(order.orderDate).toDateString() === today
  );
};

export const getTodaySales = (): number => {
  return getTodaysOrders().reduce((total, order) => total + order.total, 0);
};

export const getOrderStats = () => {
  const todayOrders = getTodaysOrders();
  const pending = todayOrders.filter(o => o.status === 'pending').length;
  const preparing = todayOrders.filter(o => o.status === 'preparing').length;
  const ready = todayOrders.filter(o => o.status === 'ready').length;
  const delivered = todayOrders.filter(o => o.status === 'delivered').length;
  
  return {
    total: todayOrders.length,
    pending,
    preparing,
    ready,
    delivered,
    sales: getTodaySales()
  };
};