interface OrderedProduct {
    product: string;
    title: string;
    image: string;
    price: number;
    discountedPrice: number;
    quantity: number;
    color?: string;
    size?: string;
}


export interface Pagination {
    total: number;
    page: number;
    pages: number;
  }
  
  export interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
  }
  

interface ShippingDetails { 
    name: string;
    phone: string;
    address: string;
}

interface RefundDetails { 
    refunded: boolean;
    refundAmount: number;
    adminRefundApproval: AdminRefundApproval;
}

export enum ShippingStatus {
    Pending = "Pending",
    Shipped = "Shipped",
    Delivered = "Delivered",
    Cancelled = "Cancelled",
    Refunded = "Refunded"
}

enum PaymentStatus {
    Pending = "pending",
    Paid = "paid", 
    Failed = "failed"
}

export enum AdminRefundApproval {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected"
}
interface User { 
    _id: string;
    username: string;
    email: string;
}
interface Order {
    _id: string;
    user: User;
    products: OrderedProduct[];
    couponCode?: string;
    shippingDetails: ShippingDetails;
    shippingStatus: ShippingStatus;
    paymentStatus: PaymentStatus;
    currency: "USD"; 
    refundDetails?: RefundDetails;
    receiptUrl: string;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderStore {
    orders: Order[];
    loading: boolean;
    error: string | null;
    pagination: Pagination;
    
    // accept pagination parameters
    getUserOrders: (params?: PaginationParams) => Promise<void>;
    getAllOrders: (params?: PaginationParams) => Promise<void>;
    
    cancelOrder: (orderId: string) => Promise<void>;
    refundOrder: (orderId: string) => Promise<void>;
    approveRefund: (orderId: string, decision: AdminRefundApproval) => Promise<void>;
    processRefund: (orderId: string) => Promise<void>;
    updateStatus: (orderId: string, newStatus: ShippingStatus) => Promise<void>;
  }
  
