import React, { useState } from 'react';
import { Receipt, Check, Loader2, Clock } from 'lucide-react';
import { Order } from '../../data/orderData';
import { useOrderTimer } from '../../hooks/useOrderTimer';

interface CurrentOrderCardProps {
  order: Order;
  onComplete?: (updatedOrder: Order) => void;
  isPastOrder?: boolean;
}

const CurrentOrderCard: React.FC<CurrentOrderCardProps> = ({ order, onComplete, isPastOrder = false }) => {
  const [isCompleting, setIsCompleting] = useState(false);
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

  return (
    <div className={`rounded-lg shadow-md overflow-hidden h-full flex flex-col ${isPastOrder ? 'bg-green-600 text-white border border-green-700' : 'bg-card'}`}>
      <div className={`p-5 border-b ${isPastOrder ? 'border-green-700' : 'border-border'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-lg font-bold ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>{order.customerName}</h2>
            <p className={`text-sm flex items-center mt-1 ${isPastOrder ? 'text-green-100' : 'text-muted-foreground'}`}>
              <Receipt className="w-4 h-4 mr-1.5" />
              Order #{order.id}
            </p>
          </div>
          <div className="text-right">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isPastOrder ? 'bg-green-700' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
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

        <div className="space-y-4">
          {order.items.map((orderItem) => (
            <div className={`border-b pb-4 last:border-b-0 last:pb-0 ${isPastOrder ? 'border-green-700' : 'border-border'}`}>
<div className="flex justify-between items-start mb-2">
  <div className="flex-1 min-w-0 pr-4">
    <div className="flex items-center gap-2">
      <p className={`font-bold text-lg ${isPastOrder ? 'text-white' : 'text-card-foreground'} overflow-hidden text-ellipsis whitespace-nowrap`}>{orderItem.item.name}</p>
      <span className={`text-sm ${isPastOrder ? 'text-green-100' : 'text-muted-foreground'} shrink-0`}>x{orderItem.quantity}</span>
    </div>
    {orderItem.item.description && (
      <p className={`text-sm mt-1 ${isPastOrder ? 'text-green-100' : 'text-muted-foreground'} overflow-hidden text-ellipsis`} style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{orderItem.item.description}</p>
    )}
  </div>
  <p className={`font-semibold text-lg ${isPastOrder ? 'text-white' : 'text-card-foreground'} shrink-0`}>£{(orderItem.item.price * orderItem.quantity).toFixed(2)}</p>
</div>
              {/* Hardcoded extras for now as per image, since orderData.ts doesn't support them */}
              <div className="mt-2">
                <p className={`text-sm italic ${isPastOrder ? 'text-green-100' : 'text-muted-foreground'}`}>Add-ons: Green Sauce</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`p-5 border-t ${isPastOrder ? 'bg-green-700 border-green-700' : 'bg-muted border-border'}`}>
        <div className="flex justify-between items-center">
          <p className={`text-lg font-bold ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>Total</p>
          <p className={`text-lg font-bold ${isPastOrder ? 'text-white' : 'text-card-foreground'}`}>£{order.total.toFixed(2)}</p>
        </div>
      </div>
     {isPastOrder ? (
       <div className="p-5 border-t border-border">
         <div className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
           <Check className="w-5 h-5" />
           Completed
         </div>
       </div>
     ) : (
       <div className="p-5 border-t border-border">
         <button
           onClick={handleComplete}
           disabled={isCompleting}
           className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-black font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-background transition-colors duration-200 flex items-center justify-center gap-2"
         >
           {isCompleting ? (
             <>
               <Check className="w-5 h-5 animate-pulse" />
               Completing...
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
