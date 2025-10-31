import React from 'react';
import { Receipt, Check, Clock } from 'lucide-react';
import { Order } from '../../data/orderData';
import { useOrderTimer } from '../../hooks/useOrderTimer';

interface PastOrderCardProps {
  order: Order;
}

const PastOrderCard: React.FC<PastOrderCardProps> = ({ order }) => {
  const { formattedTime, totalTimeInMinutes } = useOrderTimer({
    startTime: order.orderDate,
    endTime: order.completedAt
  });

  return (
    <div className="rounded-lg shadow-md overflow-hidden h-full flex flex-col bg-card text-card-foreground border border-border">
      <div className="p-5 border-b border-border bg-green-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{order.customerName}</h2>
            <p className="text-sm text-green-100 flex items-center mt-1">
              <Receipt className="w-4 h-4 mr-1.5" />
              Order #{order.id}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-700">
              <Check className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 space-y-4 text-card-foreground flex-grow">
{/* Display completion time */}
        {order.completedAt && order.totalTimeTaken && (
          <div className="bg-green-100 dark:bg-green-900 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-800 dark:text-green-200" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                Total Time: {formattedTime} ({totalTimeInMinutes} min)
              </span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {order.items.map((orderItem, index) => (
            <div key={index} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
<div className="flex justify-between items-start mb-2">
  <div className="flex-1 min-w-0 pr-4">
    <div className="flex items-center gap-2">
      <p className="font-bold text-lg text-card-foreground overflow-hidden text-ellipsis whitespace-nowrap">{orderItem.item.name}</p>
      <span className="text-sm text-muted-foreground shrink-0">x{orderItem.quantity}</span>
    </div>
    {orderItem.item.description && (
      <p className="text-sm text-muted-foreground mt-1 overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{orderItem.item.description}</p>
    )}
  </div>
  <p className="font-semibold text-lg text-card-foreground shrink-0">£{(orderItem.item.price * orderItem.quantity).toFixed(2)}</p>
</div>
              {/* Hardcoded extras for now as per image, since orderData.ts doesn't support them */}
              <div className="mt-2">
                <p className="text-sm text-muted-foreground italic">Add-ons: Green Sauce</p>
              </div>
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
        <div className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2">
          <Check className="w-5 h-5" />
          Completed
        </div>
      </div>
    </div>
  );
};

export default PastOrderCard;