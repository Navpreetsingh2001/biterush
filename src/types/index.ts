export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string; // e.g., 'Burger', 'Pizza', 'Salad'
  foodCourtId: string; // Add foodCourtId to know where the item is from
  foodCourtName: string; // Add foodCourtName for display in cart
}

// CartItem can extend MenuItem and add quantity
export interface CartItem extends MenuItem {
  quantity: number;
}
