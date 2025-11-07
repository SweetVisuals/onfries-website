import React from 'react';
import { Receipt, Check, Clock, Trash2 } from 'lucide-react';
import { Order } from '../../data/orderData';
import { useOrderTimer } from '../../hooks/useOrderTimer';

interface PastOrderCardProps {
  order: Order;
  onDelete?: (orderId: string) => void;
}

const PastOrderCard: React.FC<PastOrderCardProps> = ({ order, onDelete }) => {
  const { formattedTime, totalTimeInMinutes } = useOrderTimer({
    startTime: order.orderDate,
    endTime: order.completedAt
  });

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(order.id);
    }
  };

  // Main courses are now the top-level items, add-ons and drinks are nested within each item
  const mainCourses = order.items;

  return (
    <div className="rounded-lg shadow-md overflow-hidden h-full flex flex-col bg-card text-card-foreground border border-border">
      <div className="p-5 border-b border-border bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{order.customerName}</h2>
            <p className="text-sm text-gray-200 flex items-center mt-1">
              <Receipt className="w-4 h-4 mr-1.5" />
              Order #{order.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg transition-colors duration-200 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400"
                title="Delete Order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Status Icon */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4 text-card-foreground flex-grow">
        {/* Display completion time */}
        {order.completedAt && order.totalTimeTaken && (
          <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-900 dark:text-gray-100" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                Total Time: {formattedTime} ({totalTimeInMinutes} min)
              </span>
            </div>
          </div>
        )}

        {/* Display grouped items */}
        <div className="space-y-4">
          {mainCourses.map((mainCourse) => (
            <div key={mainCourse.item.id} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg text-card-foreground overflow-hidden text-ellipsis whitespace-nowrap">{mainCourse.item.name}</p>
                    <span className="text-sm text-muted-foreground shrink-0">x{mainCourse.quantity}</span>
                  </div>
                </div>
                <p className="font-semibold text-lg text-card-foreground shrink-0">£{(mainCourse.item.price * mainCourse.quantity).toFixed(2)}</p>
              </div>
              
              {/* Display associated add-ons for this main course */}
              {mainCourse.addOns && mainCourse.addOns.length > 0 && (
                <div className="mt-3 ml-4 border-l-2 border-gray-400 dark:border-gray-500 pl-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Add-ons</p>
                  <div className="space-y-1">
                    {mainCourse.addOns.map((addon) => (
                      <div key={addon.item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300 flex-1 mr-2">
                          {addon.item.name === 'Steak Only' ? 'Steak' : addon.item.name} x{addon.quantity}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          £{(addon.item.price * addon.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display associated drinks for this main course */}
              {mainCourse.drinks && mainCourse.drinks.length > 0 && (
                <div className="mt-3 ml-4 border-l-2 border-gray-400 dark:border-gray-500 pl-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold mb-2 uppercase tracking-wide">Drink</p>
                  <div className="space-y-1">
                    {mainCourse.drinks.map((drink) => (
                      <div key={drink.item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 dark:text-gray-300 flex-1 mr-2">
                          {drink.item.name} x{drink.quantity}
                        </span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">
                          £{(drink.item.price * drink.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="p-5 bg-muted border-t border-border">
        <div className="flex justify-between items-center">
          <p className="text-lg font-bold text-card-foreground">Total</p>
          <p className="text-lg font-bold text-card-foreground">£{order.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="p-5 border-t border-border">
        <div className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
          <Check className="w-5 h-5" />
          Completed
        </div>
      </div>
    </div>
  );
};

export default PastOrderCard;