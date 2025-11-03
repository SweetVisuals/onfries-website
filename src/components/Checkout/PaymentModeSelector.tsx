import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PAYMENT_MODE } from '../../config/square';

interface PaymentModeSelectorProps {
  onModeChange: (mode: 'test' | 'live') => void;
  currentMode: 'test' | 'live';
}

const PaymentModeSelector: React.FC<PaymentModeSelectorProps> = ({
  onModeChange,
  currentMode
}) => {
  return (
    <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center gap-4 mb-3">
        <h4 className="text-sm font-semibold">Payment Mode</h4>
        <Badge variant={currentMode === 'test' ? 'secondary' : 'default'}>
          Current: {currentMode.toUpperCase()}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button
          variant={currentMode === 'test' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('test')}
        >
          Test Mode (Demo)
        </Button>
        <Button
          variant={currentMode === 'live' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('live')}
          disabled
          title="Requires backend setup"
        >
          Live Mode (Real)
        </Button>
      </div>
      {currentMode === 'test' && (
        <p className="text-xs text-muted-foreground mt-2">
          Test mode simulates payments for demonstration purposes.
        </p>
      )}
      {currentMode === 'live' && (
        <p className="text-xs text-muted-foreground mt-2">
          Live mode processes real payments. Backend server required.
        </p>
      )}
    </div>
  );
};

export default PaymentModeSelector;