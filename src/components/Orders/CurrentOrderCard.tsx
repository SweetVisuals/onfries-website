import React, { useState } from 'react';
import { Receipt, Check, Loader2, Clock, Trash2 } from 'lucide-react';
import { Order } from '../../data/orderData';
import { useOrderTimer } from '../../hooks/useOrderTimer';

interface CurrentOrderCardProps {
  order: Order;
  onComplete?: (updatedOrder: Order) => void;
  onDelete?: (orderId: string) => void;
  isPastOrder?: boolean;
}

const CurrentOrderCard: React.FC<CurrentOrderCardProps> = ({ order, onComplete, onDelete, isPastOrder = false }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { formattedTime, totalTimeInMinutes } = useOrderTimer({
    startTime: order.orderDate,
    endTime: order.completedAt
  });

  const handleComplete = async () => {
    if (onComplete) {
      setIsCompleting(true);
      
      // Calculate total time taken in minutes
      const completedOrder = {
        ...order,
        completedAt: new Date().toISOString(),
        totalTimeTaken: totalTimeInMinutes,
        status: 'delivered' as const
      };
      
      // Simulate animation delay
      setTimeout(() => {
        onComplete(completedOrder);
        setIsCompleting(false);
      }, 1000);
    }
  };

  const handleDelete = async () => {
    if (onDelete && !isDeleting) {
      setIsDeleting(true);
      
      // Add a small delay to show the delete animation
      setTimeout(() => {
        onDelete(order.id);
        setIsDeleting(false);
      }, 500);
    }
  };

  // Group items: main courses and their associated add-ons
  const mainCourses = order.items.filter(item => item.item.category !== 'Add-ons');
  const addOns = order.items.filter(item => item.item.category === 'Add-ons');

  return (
    <div className={`rounded-lg shadow-md overflow-hidden h-full flex flex-col ${isPastOrder ? 'bg-gray-800 text-white border border-gray-900' : 'bg-card'}`}>
      <div className={`p-5 border-b ${isPastOrder ? 'border-gray-900' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>{order.customerName}</h2>
            <p className={`text-sm flex items-center mt-1 ${isPastOrder ? 'text-gray-200' : 'text-muted-foreground'}`}>
              <Receipt className="w-4 h-4 mr-1.5" />
              Order #{order.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isCompleting}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  isDeleting
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-400'
                }`}
                title="Delete Order"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            {/* Status Icon */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isPastOrder ? 'bg-gray-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
              {isPastOrder ? (
                <Check className="w-4 h-4 text-white" />
              ) : isCompleting ? (
                <Check className="w-4 h-4 text-green-800 dark:text-green-200 animate-pulse" />
              ) : (
                <Loader2 className="w-4 h-4 text-yellow-800 dark:text-yellow-200 animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className={`p-5 space-y-4 flex-grow ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>
        {/* Timer Display for current orders */}
        {!isPastOrder && (
          <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-800 dark:text-yellow-200" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200 truncate">
                Time Elapsed: {formattedTime}
              </span>
            </div>
          </div>
        )}

        {/* Display grouped items */}
        <div className="space-y-4">
          {mainCourses.map((mainCourse) => (
            <div key={mainCourse.item.id} className={`border-b pb-4 last:border-b-0 last:pb-0 ${isPastOrder ? 'border-gray-900' : 'border-border'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-lg ${isPastOrder ? 'text-white' : 'text-card-foreground'} overflow-hidden text-ellipsis whitespace-nowrap`}>{mainCourse.item.name}</p>
                    <span className={`text-sm ${isPastOrder ? 'text-gray-200' : 'text-muted-foreground'} shrink-0`}>x{mainCourse.quantity}</span>
                  </div>
                </div>
                <p className={`font-semibold text-lg ${isPastOrder ? 'text-white' : 'text-card-foreground'} shrink-0`}>£{(mainCourse.item.price * mainCourse.quantity).toFixed(2)}</p>
              </div>
              
              {/* Display associated add-ons for this main course */}
              {addOns.length > 0 && (
                <div className="mt-3 ml-4 border-l-2 border-gray-400 dark:border-gray-500 pl-4">
                  <p className={`text-sm ${isPastOrder ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'} font-semibold mb-2 uppercase tracking-wide`}>Add-ons</p>
                  <div className="space-y-1">
                    {addOns.map((addon) => (
                      <div key={addon.item.id} className="flex justify-between items-center text-sm">
                        <span className={`${isPastOrder ? 'text-gray-300' : 'text-gray-700 dark:text-gray-300'} flex-1 mr-2`}>
                          {addon.item.name} x{addon.quantity}
                        </span>
                        <span className={`font-medium ${isPastOrder ? 'text-white' : 'text-gray-800 dark:text-gray-200'}`}>
                          £{(addon.item.price * addon.quantity).toFixed(2)}
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
      <div className={`p-5 border-t ${isPastOrder ? 'bg-gray-900 border-gray-900' : 'bg-muted border-border'}`}>
        <div className="flex justify-between items-center">
          <p className={`text-lg font-bold ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>Total</p>
          <p className={`text-lg font-bold ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>£{order.total.toFixed(2)}</p>
        </div>
      </div>
      {isPastOrder ? (
        <div className="p-5 border-t border-border">
          <div className="w-full bg-gray-800 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            Completed
          </div>
        </div>
      ) : (
        <div className="p-5 border-t border-border">
          <button
            onClick={handleComplete}
            disabled={isCompleting || isDeleting}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-black font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isCompleting ? (
              <>
                <Check className="w-5 h-5 animate-pulse" />
                Completing...
              </>
            ) : isDeleting ? (
              <>
                <Trash2 className="w-5 h-5 animate-pulse" />
                Deleting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Mark as Complete
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CurrentOrderCard;
