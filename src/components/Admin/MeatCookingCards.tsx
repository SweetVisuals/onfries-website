import React from 'react';
import { Beef, Fish, Drumstick, Cookie } from 'lucide-react';
import { Order } from '../../data/orderData';

interface MeatCookingCardsProps {
  orders: Order[];
}

// Define meat categories with their corresponding icons and keywords
const meatCategories = [
  {
    id: 'steak',
    name: 'Steak',
    icon: Beef,
    keywords: ['steak', 'deluxe steak', 'premium steak', 'quadzilla', 'centurion', 'custom item'],
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  },
  {
    id: 'lamb',
    name: 'Lamb',
    icon: Cookie,
    keywords: ['lamb chop'],
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  {
    id: 'ribs',
    name: 'Short Rib',
    icon: Drumstick,
    keywords: ['short rib'],
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  {
    id: 'other',
    name: 'Other',
    icon: Fish,
    keywords: ['fries', 'sauce', 'drink'],
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
];

const MeatCookingCards: React.FC<MeatCookingCardsProps> = ({ orders }) => {
  // Get current orders (pending and preparing)
  const currentOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'preparing'
  );

  // Calculate meat quantities for each category
  const meatQuantities = meatCategories.map(category => {
    let totalQuantity = 0;
    
    currentOrders.forEach(order => {
      order.items.forEach(orderItem => {
        const itemName = orderItem.item.name.toLowerCase();
        const hasMeat = category.keywords.some(keyword => 
          itemName.includes(keyword)
        );
        
        if (hasMeat) {
          totalQuantity += orderItem.quantity;
        }
      });
    });

    return {
      ...category,
      quantity: totalQuantity
    };
  });

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {meatQuantities.map((meat) => {
        const IconComponent = meat.icon;
        return (
          <div
            key={meat.id}
            className={`${meat.color} rounded-lg p-4 border-2 border-opacity-20 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <IconComponent className="w-6 h-6" />
              <span className="text-2xl font-bold">{meat.quantity}</span>
            </div>
            <h3 className="font-semibold text-sm">{meat.name}</h3>
            <p className="text-xs opacity-80">to cook</p>
          </div>
        );
      })}
    </div>
  );
};

export default MeatCookingCards;