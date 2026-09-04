import { OrderResponse } from './order.types';

export interface ApiResponse {
    success: boolean;
    order?: OrderResponse;
    error?: string;
  }