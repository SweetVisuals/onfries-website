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
  completedAt?: string;
  totalTimeTaken?: number; // in minutes
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
          id: '1',
          name: 'Steak & Fries',
          description: 'Classic steak served with crispy fries',
          price: 12.00,
          image: '',
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 20
        },
        quantity: 2
      },
      {
        item: {
          id: '9',
          name: 'Green Sauce',
          description: 'Extra green sauce add-on',
          price: 2.00,
          image: '',
          category: 'Add-ons',
          isAvailable: true,
          preparationTime: 0
        },
        quantity: 1
      }
    ],
    total: 26.00,
    status: 'preparing',
    orderDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    estimatedDelivery: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
    notes: 'Medium-rare please'
  },
  {
    id: '002',
    customerId: '3',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    items: [
      {
        item: {
          id: '3',
          name: 'Premium Steak & Fries',
          description: 'Top-quality steak with premium fries',
          price: 30.00,
          image: '',
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 30
        },
        quantity: 1
      },
      {
        item: {
          id: '7',
          name: 'Lamb Chops x2',
          description: 'Two premium lamb chops',
          price: 11.00,
          image: '',
          category: 'Add-ons',
          isAvailable: true,
          preparationTime: 0
        },
        quantity: 1
      },
      {
        item: {
          id: '11',
          name: 'Can of Drink',
          description: 'Assorted soft drinks',
          price: 1.50,
          image: '',
          category: 'Add-ons',
          isAvailable: true,
          preparationTime: 0
        },
        quantity: 2
      }
    ],
    total: 53.50,
    status: 'pending',
    orderDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    estimatedDelivery: new Date(Date.now() + 25 * 60 * 1000).toISOString(), // 25 minutes from now
    notes: 'Extra lamb chops'
  },
  {
    id: '003',
    customerId: '2',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    items: [
      {
        item: {
          id: '4',
          name: 'Quadzilla & Fries',
          description: 'Massive portion for the ultimate appetite',
          price: 40.00,
          image: '',
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 35
        },
        quantity: 1
      },
      {
        item: {
          id: '8',
          name: 'Short Ribs x2',
          description: 'Two tender short ribs',
          price: 6.00,
          image: '',
          category: 'Add-ons',
          isAvailable: true,
          preparationTime: 0
        },
        quantity: 2
      }
    ],
    total: 52.00,
    status: 'preparing',
    orderDate: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
    estimatedDelivery: new Date(Date.now() + 22 * 60 * 1000).toISOString(), // 22 minutes from now
    notes: 'Well done'
  },
  {
    id: '004',
    customerId: '3',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah@example.com',
    items: [
      {
        item: {
          id: '2',
          name: 'Deluxe Steak & Fries',
          description: 'Premium steak with crispy fries',
          price: 20.00,
          image: '',
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 25
        },
        quantity: 1
      },
      {
        item: {
          id: '10',
          name: 'Red Sauce',
          description: 'Extra red sauce add-on',
          price: 2.00,
          image: '',
          category: 'Add-ons',
          isAvailable: true,
          preparationTime: 0
        },
        quantity: 1
      }
    ],
    total: 22.00,
    status: 'ready',
    orderDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    estimatedDelivery: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    notes: 'Medium'
  },
  {
    id: '005',
    customerId: '4',
    customerName: 'Alex Brown',
    customerEmail: 'alex@example.com',
    items: [
      {
        item: {
          id: '5',
          name: 'Centurion',
          description: 'The king of all steaks',
          price: 50.00,
          image: '',
          category: 'Main Courses',
          isAvailable: true,
          preparationTime: 40
        },
        quantity: 1
      }
    ],
    total: 50.00,
    status: 'delivered',
    orderDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    completedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // completed 45 minutes ago
    totalTimeTaken: 75, // 75 minutes
    estimatedDelivery: new Date(Date.now() - 45 * 60 * 1000).toISOString()
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

export const addOrder = (order: Order) => {
  dummyOrders.push(order);
};