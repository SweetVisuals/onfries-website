import { getCurrentSquareConfig } from '../config/square';

export interface PaymentRequest {
  amount: number; // in cents
  currency: string;
  sourceId: string;
  idempotencyKey: string;
  orderId?: string;
  customerId?: string;
  referenceId?: string;
  note?: string;
  tipAmount?: number; // in cents
}

export interface PaymentResponse {
  payment: {
    id: string;
    status: string;
    receiptUrl: string;
    amountMoney: {
      amount: number;
      currency: string;
    };
    createdAt: string;
  };
  errors?: Array<{
    category: string;
    code: string;
    detail: string;
  }>;
}

export interface PaymentError {
  category: string;
  code: string;
  detail: string;
}

export class SquarePaymentService {
  private config = getCurrentSquareConfig();
  private baseUrl = this.config.environment === 'sandbox' 
    ? 'https://connect.squareupsandbox.com' 
    : 'https://connect.squareup.com';

  private async makeApiCall(endpoint: string, method: string = 'POST', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2025-10-16',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Square API Error:', response.status, errorText);
      throw new Error(`Square API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    const body = {
      idempotency_key: paymentRequest.idempotencyKey,
      amount_money: {
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
      },
      source_id: paymentRequest.sourceId,
      autocomplete: true,
      location_id: this.config.locationId,
      ...(paymentRequest.orderId && { order_id: paymentRequest.orderId }),
      ...(paymentRequest.customerId && { customer_id: paymentRequest.customerId }),
      ...(paymentRequest.referenceId && { reference_id: paymentRequest.referenceId }),
      ...(paymentRequest.note && { note: paymentRequest.note }),
      ...(paymentRequest.tipAmount && { 
        tip_money: {
          amount: paymentRequest.tipAmount,
          currency: paymentRequest.currency,
        }
      }),
    };

    try {
      const response = await this.makeApiCall('/v2/payments', 'POST', body);
      return response;
    } catch (error) {
      console.error('Payment creation failed:', error);
      throw error;
    }
  }

  async getPayment(paymentId: string) {
    try {
      const response = await this.makeApiCall(`/v2/payments/${paymentId}`, 'GET');
      return response;
    } catch (error) {
      console.error('Failed to get payment:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId: string) {
    try {
      const response = await this.makeApiCall(`/v2/payments/${paymentId}/cancel`, 'POST');
      return response;
    } catch (error) {
      console.error('Failed to cancel payment:', error);
      throw error;
    }
  }

  async completePayment(paymentId: string) {
    try {
      const response = await this.makeApiCall(`/v2/payments/${paymentId}/complete`, 'POST');
      return response;
    } catch (error) {
      console.error('Failed to complete payment:', error);
      throw error;
    }
  }

  generateIdempotencyKey(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  formatAmountForDisplay(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }

  formatAmountForApi(amountInPounds: number): number {
    return Math.round(amountInPounds * 100);
  }
}

// Create singleton instance
export const squarePaymentService = new SquarePaymentService();

// Utility functions for common operations
export const createPaymentFromCart = async (
  cartTotal: number,
  sourceId: string,
  customerId?: string,
  referenceId?: string
) => {
  const idempotencyKey = squarePaymentService.generateIdempotencyKey();
  const amountInCents = squarePaymentService.formatAmountForApi(cartTotal);
  
  return squarePaymentService.createPayment({
    amount: amountInCents,
    currency: 'GBP',
    sourceId,
    idempotencyKey,
    customerId,
    referenceId,
    note: `OnFries Order - ${referenceId || 'No reference'}`
  });
};

export const validatePaymentError = (error: any): PaymentError | null => {
  if (error?.errors && error.errors.length > 0) {
    return error.errors[0];
  }
  return null;
};

export const getPaymentErrorMessage = (error: PaymentError): string => {
  const errorMessages: { [key: string]: string } = {
    'CARD_DECLINED': 'Your card was declined. Please try a different payment method.',
    'INSUFFICIENT_FUNDS': 'Insufficient funds. Please try a different payment method.',
    'CARD_EXPIRED': 'Your card has expired. Please try a different payment method.',
    'INVALID_CARD': 'Invalid card details. Please check and try again.',
    'GENERIC_DECLINE': 'Payment was declined. Please try again or use a different payment method.',
    'PAYMENT_AMOUNT_MISMATCH': 'Payment amount mismatch. Please try again.',
    'TEMPORARY_ERROR': 'Temporary processing error. Please try again.',
  };

  return errorMessages[error.code] || error.detail || 'Payment failed. Please try again.';
};