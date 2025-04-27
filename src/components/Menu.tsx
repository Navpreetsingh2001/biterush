"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext'; // Import useCart hook
import type { MenuItem } from '@/types'; // Use type import
import { ShoppingCart, Sandwich, Pizza, Salad, Utensils } from 'lucide-react'; // Replaced Burger with Sandwich

// Mock data - replace with actual data fetching
// Added foodCourtId and foodCourtName to menu items
const mockMenus = {
  "fc1a": [
    { id: "1a1", name: "Classic Burger", price: 5.99, description: "Beef patty, lettuce, tomato, cheese", category: "Burger", foodCourtId: "fc1a", foodCourtName: "The Hungry Ram" },
    { id: "1a2", name: "Fries", price: 2.49, description: "Crispy golden fries", category: "Side", foodCourtId: "fc1a", foodCourtName: "The Hungry Ram" },
  ],
  "fc2a": [
    { id: "2a1", name: "Caesar Salad", price: 6.99, description: "Romaine, croutons, parmesan, caesar dressing", category: "Salad", foodCourtId: "fc2a", foodCourtName: "Green Leaf Cafe" },
    { id: "2a2", name: "Greek Salad", price: 7.49, description: "Feta, olives, cucumber, tomato", category: "Salad", foodCourtId: "fc2a", foodCourtName: "Green Leaf Cafe" },
  ],
  "fc1b": [
    { id: "1b1", name: "Pepperoni Pizza", price: 8.99, description: "Classic pepperoni and cheese", category: "Pizza", foodCourtId: "fc1b", foodCourtName: "Pizza Point" },
    { id: "1b2", name: "Margherita Pizza", price: 7.99, description: "Tomato, mozzarella, basil", category: "Pizza", foodCourtId: "fc1b", foodCourtName: "Pizza Point" },
  ],
   "fc2b": [
    { id: "2b1", name: "Chicken Tikka Masala", price: 9.99, description: "Creamy tomato curry with chicken", category: "Indian", foodCourtId: "fc2b", foodCourtName: "Curry Corner" },
    { id: "2b2", name: "Vegetable Samosa", price: 3.99, description: "Fried pastry with savory filling", category: "Indian", foodCourtId: "fc2b", foodCourtName: "Curry Corner" },
  ],
  "fc1c": [
    { id: "1c1", name: "Cheeseburger", price: 6.49, description: "Juicy beef patty with cheddar", category: "Burger", foodCourtId: "fc1c", foodCourtName: "Burger Hub" },
    { id: "1c2", name: "Chicken Burger", price: 6.99, description: "Grilled chicken breast sandwich", category: "Burger", foodCourtId: "fc1c", foodCourtName: "Burger Hub" },
  ],
  "fc2c": [
    { id: "2c1", name: "Pad Thai", price: 8.49, description: "Stir-fried rice noodles", category: "Asian", foodCourtId: "fc2c", foodCourtName: "Noodle Bar" },
    { id: "2c2", name: "Ramen", price: 9.49, description: "Japanese noodle soup", category: "Asian", foodCourtId: "fc2c", foodCourtName: "Noodle Bar" },
  ],
  "fc1d": [
    { id: "1d1", name: "Turkey Club", price: 7.29, description: "Triple decker sandwich", category: "Sandwich", foodCourtId: "fc1d", foodCourtName: "Sub Station" },
    { id: "1d2", name: "Veggie Delight", price: 6.79, description: "Loaded with fresh vegetables", category: "Sandwich", foodCourtId: "fc1d", foodCourtName: "Sub Station" },
  ],
   "fc2d": [
    { id: "2d1", name: "Latte", price: 3.99, description: "Espresso with steamed milk", category: "Coffee", foodCourtId: "fc2d", foodCourtName: "Coffee Stop" },
    { id: "2d2", name: "Croissant", price: 2.99, description: "Buttery French pastry", category: "Pastry", foodCourtId: "fc2d", foodCourtName: "Coffee Stop" },
  ],
  "default": [
        { id: "def1", name: "Default Item 1", price: 5.00, description: "Description for item 1", category: "Misc", foodCourtId: "default", foodCourtName: "Unknown Court" },
        { id: "def2", name: "Default Item 2", price: 6.50, description: "Description for item 2", category: "Misc", foodCourtId: "default", foodCourtName: "Unknown Court" },
    ]
};

// Mock food court details lookup
const foodCourtDetails: { [key: string]: { name: string } } = { // Added type annotation
    "fc1a": { name: "The Hungry Ram" },
    "fc2a": { name: "Green Leaf Cafe" },
    "fc1b": { name: "Pizza Point" },
    "fc2b": { name: "Curry Corner" },
    "fc1c": { name: "Burger Hub" },
    "fc2c": { name: "Noodle Bar" },
    "fc1d": { name: "Sub Station" },
    "fc2d": { name: "Coffee Stop" },
    "default": { name: "Selected Food Court" } // Added default entry
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'burger':
      return <Sandwich className="h-6 w-6 text-amber-600" />;
    case 'pizza':
      return <Pizza className="h-6 w-6 text-red-600" />;
    case 'salad':
      return <Salad className="h-6 w-6 text-green-600" />;
    case 'sandwich':
       return <Sandwich className="h-6 w-6 text-yellow-700" />;
    default:
      return <Utensils className="h-6 w-6 text-muted-foreground" />;
  }
};

interface MenuProps {
  foodCourtId: string;
}

const Menu: React.FC<MenuProps> = ({ foodCourtId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [foodCourtName, setFoodCourtName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart(); // Get addToCart function from context

  useEffect(() => {
    setIsLoading(true);
    const fetchMenu = async () => {
      // Simulate fetching menu based on foodCourtId
      const fetchedMenuItems = mockMenus[foodCourtId] || mockMenus["default"];
      const fcDetails = foodCourtDetails[foodCourtId] || foodCourtDetails["default"];
      setMenuItems(fetchedMenuItems);
      setFoodCourtName(fcDetails.name);
      setIsLoading(false);
    };

    if (foodCourtId) {
       fetchMenu();
    } else {
        setIsLoading(false);
    }
  }, [foodCourtId]);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item); // Use context function to add item
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading menu...</div>;
  }

   if (!foodCourtId || menuItems.length === 0) {
        return <div className="text-center p-10 text-muted-foreground">Menu not available for this food court.</div>;
    }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">Menu for {foodCourtName}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                 </div>
                 {getCategoryIcon(item.category)}
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end">
              <p className="font-semibold text-lg mb-3">${item.price.toFixed(2)}</p>
              <Button className="w-full mt-auto" onClick={() => handleAddToCart(item)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart display is removed from here and will be handled globally/on a separate page */}
    </div>
  );
};

export default Menu;
