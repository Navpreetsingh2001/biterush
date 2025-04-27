"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext'; // Import useCart hook
import type { MenuItem } from '@/types'; // Use type import
import { ShoppingCart, Sandwich, Pizza, Salad, Utensils } from 'lucide-react'; // Replaced Burger with Sandwich
import Image from 'next/image'; // Import Image component

// Mock data - replace with actual data fetching
// Added foodCourtId, foodCourtName, and imageUrl to menu items
const mockMenus: Record<string, MenuItem[]> = { // Added type annotation for mockMenus
  "fc1a": [
    { id: "1a1", name: "Classic Burger", price: 5.99, description: "Beef patty, lettuce, tomato, cheese", category: "Burger", foodCourtId: "fc1a", foodCourtName: "The Hungry Ram", imageUrl: "https://picsum.photos/seed/burger/300/200" },
    { id: "1a2", name: "Fries", price: 2.49, description: "Crispy golden fries", category: "Side", foodCourtId: "fc1a", foodCourtName: "The Hungry Ram", imageUrl: "https://picsum.photos/seed/fries/300/200" },
  ],
  "fc2a": [
    { id: "2a1", name: "Caesar Salad", price: 6.99, description: "Romaine, croutons, parmesan, caesar dressing", category: "Salad", foodCourtId: "fc2a", foodCourtName: "Green Leaf Cafe", imageUrl: "https://picsum.photos/seed/caesar/300/200" },
    { id: "2a2", name: "Greek Salad", price: 7.49, description: "Feta, olives, cucumber, tomato", category: "Salad", foodCourtId: "fc2a", foodCourtName: "Green Leaf Cafe", imageUrl: "https://picsum.photos/seed/greek/300/200" },
  ],
  "fc1b": [
    { id: "1b1", name: "Pepperoni Pizza", price: 8.99, description: "Classic pepperoni and cheese", category: "Pizza", foodCourtId: "fc1b", foodCourtName: "Pizza Point", imageUrl: "https://picsum.photos/seed/pepperoni/300/200" },
    { id: "1b2", name: "Margherita Pizza", price: 7.99, description: "Tomato, mozzarella, basil", category: "Pizza", foodCourtId: "fc1b", foodCourtName: "Pizza Point", imageUrl: "https://picsum.photos/seed/margherita/300/200" },
  ],
   "fc2b": [
    { id: "2b1", name: "Chicken Tikka Masala", price: 9.99, description: "Creamy tomato curry with chicken", category: "Indian", foodCourtId: "fc2b", foodCourtName: "Curry Corner", imageUrl: "https://picsum.photos/seed/tikka/300/200" },
    { id: "2b2", name: "Vegetable Samosa", price: 3.99, description: "Fried pastry with savory filling", category: "Indian", foodCourtId: "fc2b", foodCourtName: "Curry Corner", imageUrl: "https://picsum.photos/seed/samosa/300/200" },
  ],
  "fc1c": [
    { id: "1c1", name: "Cheeseburger", price: 6.49, description: "Juicy beef patty with cheddar", category: "Burger", foodCourtId: "fc1c", foodCourtName: "Burger Hub", imageUrl: "https://picsum.photos/seed/cheeseburger/300/200" },
    { id: "1c2", name: "Chicken Burger", price: 6.99, description: "Grilled chicken breast sandwich", category: "Burger", foodCourtId: "fc1c", foodCourtName: "Burger Hub", imageUrl: "https://picsum.photos/seed/chickenburger/300/200" },
  ],
  "fc2c": [
    { id: "2c1", name: "Pad Thai", price: 8.49, description: "Stir-fried rice noodles", category: "Asian", foodCourtId: "fc2c", foodCourtName: "Noodle Bar", imageUrl: "https://picsum.photos/seed/padthai/300/200" },
    { id: "2c2", name: "Ramen", price: 9.49, description: "Japanese noodle soup", category: "Asian", foodCourtId: "fc2c", foodCourtName: "Noodle Bar", imageUrl: "https://picsum.photos/seed/ramen/300/200" },
  ],
  "fc1d": [
    { id: "1d1", name: "Turkey Club", price: 7.29, description: "Triple decker sandwich", category: "Sandwich", foodCourtId: "fc1d", foodCourtName: "Sub Station", imageUrl: "https://picsum.photos/seed/club/300/200" },
    { id: "1d2", name: "Veggie Delight", price: 6.79, description: "Loaded with fresh vegetables", category: "Sandwich", foodCourtId: "fc1d", foodCourtName: "Sub Station", imageUrl: "https://picsum.photos/seed/veggie/300/200" },
  ],
   "fc2d": [
    { id: "2d1", name: "Latte", price: 3.99, description: "Espresso with steamed milk", category: "Coffee", foodCourtId: "fc2d", foodCourtName: "Coffee Stop", imageUrl: "https://picsum.photos/seed/latte/300/200" },
    { id: "2d2", name: "Croissant", price: 2.99, description: "Buttery French pastry", category: "Pastry", foodCourtId: "fc2d", foodCourtName: "Coffee Stop", imageUrl: "https://picsum.photos/seed/croissant/300/200" },
  ],
  "default": [
        { id: "def1", name: "Default Item 1", price: 5.00, description: "Description for item 1", category: "Misc", foodCourtId: "default", foodCourtName: "Unknown Court", imageUrl: "https://picsum.photos/seed/def1/300/200" },
        { id: "def2", name: "Default Item 2", price: 6.50, description: "Description for item 2", category: "Misc", foodCourtId: "default", foodCourtName: "Unknown Court", imageUrl: "https://picsum.photos/seed/def2/300/200" },
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
      // Ensure imageUrl is included in the fetched data
      const fetchedMenuItems = (mockMenus[foodCourtId] || mockMenus["default"]).map(item => ({
          ...item,
          imageUrl: item.imageUrl || `https://picsum.photos/seed/${item.id}/300/200` // Fallback image
      }));
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
    addToCart(item); // Use context function to add item (imageUrl is already part of item)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"> {/* Increased gap */}
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            {/* Add Image component here */}
            {item.imageUrl && (
              <div className="relative w-full h-40"> {/* Fixed height for image container */}
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority={true} // Prioritize loading images on the menu
                />
              </div>
            )}
            <CardHeader className="pt-4"> {/* Adjusted padding */}
              <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                 </div>
                 {getCategoryIcon(item.category)}
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end pt-2 pb-4 px-4"> {/* Adjusted padding */}
              <p className="font-semibold text-lg mb-3">${item.price.toFixed(2)}</p>
              <Button className="w-full mt-auto" onClick={() => handleAddToCart(item)}>
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Menu;
