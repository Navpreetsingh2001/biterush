"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { generateGPayQRCode } from '@/services/gpay';
import Image from 'next/image';
import { ShoppingCart, QrCode, Sandwich, Pizza, Salad, Utensils } from 'lucide-react'; // Replaced Burger with Sandwich

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string; // e.g., 'Burger', 'Pizza', 'Salad'
}

interface MenuProps {
  foodCourtId: string; // Renamed prop to foodCourtId
}

// Mock data - replace with actual data fetching
const mockMenus = {
  "fc1a": [
    { id: "1a1", name: "Classic Burger", price: 5.99, description: "Beef patty, lettuce, tomato, cheese", category: "Burger" },
    { id: "1a2", name: "Fries", price: 2.49, description: "Crispy golden fries", category: "Side" },
  ],
  "fc2a": [
    { id: "2a1", name: "Caesar Salad", price: 6.99, description: "Romaine, croutons, parmesan, caesar dressing", category: "Salad" },
    { id: "2a2", name: "Greek Salad", price: 7.49, description: "Feta, olives, cucumber, tomato", category: "Salad" },
  ],
  "fc1b": [
    { id: "1b1", name: "Pepperoni Pizza", price: 8.99, description: "Classic pepperoni and cheese", category: "Pizza" },
    { id: "1b2", name: "Margherita Pizza", price: 7.99, description: "Tomato, mozzarella, basil", category: "Pizza" },
  ],
   "fc2b": [
    { id: "2b1", name: "Chicken Tikka Masala", price: 9.99, description: "Creamy tomato curry with chicken", category: "Indian" },
    { id: "2b2", name: "Vegetable Samosa", price: 3.99, description: "Fried pastry with savory filling", category: "Indian" },
  ],
  "fc1c": [
    { id: "1c1", name: "Cheeseburger", price: 6.49, description: "Juicy beef patty with cheddar", category: "Burger" },
    { id: "1c2", name: "Chicken Burger", price: 6.99, description: "Grilled chicken breast sandwich", category: "Burger" },
  ],
  "fc2c": [
    { id: "2c1", name: "Pad Thai", price: 8.49, description: "Stir-fried rice noodles", category: "Asian" },
    { id: "2c2", name: "Ramen", price: 9.49, description: "Japanese noodle soup", category: "Asian" },
  ],
  "fc1d": [
    { id: "1d1", name: "Turkey Club", price: 7.29, description: "Triple decker sandwich", category: "Sandwich" },
    { id: "1d2", name: "Veggie Delight", price: 6.79, description: "Loaded with fresh vegetables", category: "Sandwich" },
  ],
   "fc2d": [
    { id: "2d1", name: "Latte", price: 3.99, description: "Espresso with steamed milk", category: "Coffee" },
    { id: "2d2", name: "Croissant", price: 2.99, description: "Buttery French pastry", category: "Pastry" },
  ],
  // Default/fallback menu
  "default": [
        { id: "def1", name: "Default Item 1", price: 5.00, description: "Description for item 1", category: "Misc" },
        { id: "def2", name: "Default Item 2", price: 6.50, description: "Description for item 2", category: "Misc" },
    ]
};

// Mock food court details lookup
const foodCourtDetails = {
    "fc1a": { name: "The Hungry Ram" },
    "fc2a": { name: "Green Leaf Cafe" },
    "fc1b": { name: "Pizza Point" },
    "fc2b": { name: "Curry Corner" },
    "fc1c": { name: "Burger Hub" },
    "fc2c": { name: "Noodle Bar" },
    "fc1d": { name: "Sub Station" },
    "fc2d": { name: "Coffee Stop" },
};


const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'burger': // Keep category name as 'burger' but use Sandwich icon
      return <Sandwich className="h-6 w-6 text-amber-600" />;
    case 'pizza':
      return <Pizza className="h-6 w-6 text-red-600" />;
    case 'salad':
      return <Salad className="h-6 w-6 text-green-600" />;
    case 'sandwich': // Add case for actual sandwiches
       return <Sandwich className="h-6 w-6 text-yellow-700" />;
    default:
      return <Utensils className="h-6 w-6 text-muted-foreground" />;
  }
};


const Menu: React.FC<MenuProps> = ({ foodCourtId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [gpayQRCode, setGPayQRCode] = useState<string | null>(null);
  const [foodCourtName, setFoodCourtName] = useState<string>(''); // To display the name
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    setIsLoading(true); // Start loading
    // Replace with actual data fetching logic
    const fetchMenu = async () => {
      // Simulate fetching menu based on foodCourtId
      // In a real app, replace mockMenus with an API call:
      // const response = await fetch(`/api/menu/${foodCourtId}`);
      // const data = await response.json();
      // setMenuItems(data.menuItems);
      // setFoodCourtName(data.foodCourtName);

      const fetchedMenuItems = mockMenus[foodCourtId] || mockMenus["default"];
      setMenuItems(fetchedMenuItems);

      // Simulate fetching food court details (like name)
      const fcDetails = foodCourtDetails[foodCourtId];
      setFoodCourtName(fcDetails ? fcDetails.name : 'Selected Food Court');


      // Reset cart when menu changes
      setCart([]);
      setTotalPrice(0);
      setGPayQRCode(null);
      setIsLoading(false); // Stop loading
    };

    if (foodCourtId) {
       fetchMenu();
    } else {
        setIsLoading(false); // Stop loading if no ID
    }

  }, [foodCourtId]); // Depend on foodCourtId

  useEffect(() => {
    const newTotalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(newTotalPrice);

    const generateQRCode = async () => {
      if (newTotalPrice > 0) {
        const gpayData = await generateGPayQRCode(newTotalPrice);
        // Use the actual QR code generation URL from the service
        // The service currently returns a dummy string, not a full URL.
        // For demo purposes, we continue using qrserver.com with the dummy data.
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(gpayData.qrCode)}`;
        setGPayQRCode(qrCodeUrl);
      } else {
        setGPayQRCode(null);
      }
    };

    generateQRCode();
  }, [cart]);

  const handleAddToCart = (item: MenuItem) => {
    setCart(prevCart => [...prevCart, item]);
  };

  if (isLoading) {
    return <div className="text-center p-10">Loading menu...</div>; // Basic loading indicator
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

      {cart.length > 0 && (
        <Card className="p-6 shadow-lg">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <ShoppingCart /> Your Order
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <ul className="space-y-2 mb-4">
                {cart.map((cartItem, index) => (
                    <li key={`${cartItem.id}-${index}`} className="flex justify-between items-center text-sm border-b pb-1">
                        <span>{cartItem.name}</span>
                        <span>${cartItem.price.toFixed(2)}</span>
                    </li>
                ))}
             </ul>

            <div className="flex justify-between items-center font-bold text-lg border-t pt-4">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {gpayQRCode && (
              <div className="mt-4 text-center border-t pt-4">
                 <p className="text-muted-foreground mb-2 flex items-center justify-center gap-1">
                    <QrCode className="h-4 w-4"/> Scan with GPay to Pay
                 </p>
                <div className="flex justify-center">
                     <Image src={gpayQRCode} alt="GPay QR Code" width={150} height={150} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Menu;
