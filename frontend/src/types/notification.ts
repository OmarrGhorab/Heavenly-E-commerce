export interface Notification {
    id?: string;
    _id?: string;
    orderId: string;
    newStatus?: string;
    message: string;
    timestamp: string;
    read: boolean;
    totalAmount?: number;
    currency?: string;
    createdAt: string;
  }
  
