
// This is now primarily a Server Component responsible for data fetching

import type { FC } from 'react';
import Menu from '@/components/Menu';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { MenuItem } from '@/context/CartContext'; // Import MenuItem type

// Mock data fetching function (simulates server-side fetching)
// In a real app, this would fetch from an API or database based on foodCourtId
const fetchMenuData = async (foodCourtId: string): Promise<{ menuItems: MenuItem[]; foodCourtName: string } | null> => {
  // Mock data - same as in Menu.tsx
  const mockMenus: Record<string, MenuItem[]> = {
    "fc1a": [
      { id: "1a1", name: "Classic Burger", price: 150.00, description: "Beef patty, lettuce, tomato, cheese", category: "Burger", foodCourtId: "fc1a", foodCourtName: "The Hungry Ram", imageUrl: "https://picsum.photos/seed/burger/300/200" },
      { id: "1a2", name: "Fries", price: 70.00, description: "Crispy golden fries", category: "Side", foodCourtId: "fc1a", foodCourtName: "The Hungry Ram", imageUrl: "https://picsum.photos/seed/fries/300/200" },
    ],
    "fc2a": [
      { id: "2a1", name: "Caesar Salad", price: 180.00, description: "Romaine, croutons, parmesan, caesar dressing", category: "Salad", foodCourtId: "fc2a", foodCourtName: "Green Leaf Cafe", imageUrl: "https://picsum.photos/seed/caesar/300/200" },
      { id: "2a2", name: "Greek Salad", price: 190.00, description: "Feta, olives, cucumber, tomato", category: "Salad", foodCourtId: "fc2a", foodCourtName: "Green Leaf Cafe", imageUrl: "https://picsum.photos/seed/greek/300/200" },
    ],
    "fc1b": [
      { id: "1b1", name: "Pepperoni Pizza", price: 250.00, description: "Classic pepperoni and cheese", category: "Pizza", foodCourtId: "fc1b", foodCourtName: "Pizza Point", imageUrl: "https://picsum.photos/seed/pepperoni/300/200" },
      { id: "1b2", name: "Margherita Pizza", price: 220.00, description: "Tomato, mozzarella, basil", category: "Pizza", foodCourtId: "fc1b", foodCourtName: "Pizza Point", imageUrl: "https://picsum.photos/seed/margherita/300/200" },
    ],
    "fc2b": [
      { id: "2b1", name: "Chicken Tikka Masala", price: 280.00, description: "Creamy tomato curry with chicken", category: "Indian", foodCourtId: "fc2b", foodCourtName: "Curry Corner", imageUrl: "https://picsum.photos/seed/tikka/300/200" },
      { id: "2b2", name: "Vegetable Samosa (2pcs)", price: 60.00, description: "Fried pastry with savory filling", category: "Indian", foodCourtId: "fc2b", foodCourtName: "Curry Corner", imageUrl: "https://picsum.photos/seed/samosa/300/200" },
    ],
    "fc1c": [
      { id: "1c1", name: "Cheeseburger", price: 160.00, description: "Juicy beef patty with cheddar", category: "Burger", foodCourtId: "fc1c", foodCourtName: "Burger Hub", imageUrl: "https://picsum.photos/seed/cheeseburger/300/200" },
      { id: "1c2", name: "Chicken Burger", price: 170.00, description: "Grilled chicken breast sandwich", category: "Burger", foodCourtId: "fc1c", foodCourtName: "Burger Hub", imageUrl: "https://picsum.photos/seed/chickenburger/300/200" },
    ],
    "fc2c": [
      { id: "2c1", name: "Pad Thai", price: 200.00, description: "Stir-fried rice noodles", category: "Asian", foodCourtId: "fc2c", foodCourtName: "Noodle Bar", imageUrl: "https://picsum.photos/seed/padthai/300/200" },
      { id: "2c2", name: "Ramen", price: 230.00, description: "Japanese noodle soup", category: "Asian", foodCourtId: "fc2c", foodCourtName: "Noodle Bar", imageUrl: "https://picsum.photos/seed/ramen/300/200" },
    ],
    "fc1d": [
      { id: "1d1", name: "Turkey Club", price: 190.00, description: "Triple decker sandwich", category: "Sandwich", foodCourtId: "fc1d", foodCourtName: "Sub Station", imageUrl: "https://picsum.photos/seed/club/300/200" },
      { id: "1d2", name: "Veggie Delight", price: 170.00, description: "Loaded with fresh vegetables", category: "Sandwich", foodCourtId: "fc1d", foodCourtName: "Sub Station", imageUrl: "https://picsum.photos/seed/veggie/300/200" },
    ],
    "fc2d": [
      { id: "2d1", name: "Latte", price: 120.00, description: "Espresso with steamed milk", category: "Coffee", foodCourtId: "fc2d", foodCourtName: "Coffee Stop", imageUrl: "https://picsum.photos/seed/latte/300/200" },
      { id: "2d2", name: "Croissant", price: 80.00, description: "Buttery French pastry", category: "Pastry", foodCourtId: "fc2d", foodCourtName: "Coffee Stop", imageUrl: "https://picsum.photos/seed/croissant/300/200" },
    ],
    "default": [
      { id: "def1", name: "Default Item 1", price: 100.00, description: "Description for item 1", category: "Misc", foodCourtId: "default", foodCourtName: "Unknown Court", imageUrl: "https://picsum.photos/seed/def1/300/200" },
      { id: "def2", name: "Default Item 2", price: 120.00, description: "Description for item 2", category: "Misc", foodCourtId: "default", foodCourtName: "Unknown Court", imageUrl: "https://picsum.photos/seed/def2/300/200" },
    ]
  };

  const foodCourtDetails: Record<string, { name: string }> = {
      "fc1a": { name: "The Hungry Ram" }, "fc2a": { name: "Green Leaf Cafe" }, "fc1b": { name: "Pizza Point" }, "fc2b": { name: "Curry Corner" }, "fc1c": { name: "Burger Hub" }, "fc2c": { name: "Noodle Bar" }, "fc1d": { name: "Sub Station" }, "fc2d": { name: "Coffee Stop" }, "default": { name: "Selected Food Court" }
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate 150ms delay

  const menuItems = mockMenus[foodCourtId];
  const fcDetails = foodCourtDetails[foodCourtId];

  if (!menuItems || !fcDetails) {
    console.warn(`Menu or details not found for foodCourtId: ${foodCourtId}`);
    return null; // Indicate data couldn't be fetched
  }

  // Ensure imageUrl is included
  const menuItemsWithImages = menuItems.map(item => ({
    ...item,
    imageUrl: item.imageUrl || `https://picsum.photos/seed/${item.id}/300/200` // Fallback image
  }));

  return { menuItems: menuItemsWithImages, foodCourtName: fcDetails.name };
};


// Define the props for the page component
interface MenuPageProps {
    params: {
        foodCourtId: string;
    };
}

// Make the page component async to fetch data
const MenuPage: FC<MenuPageProps> = async ({ params }) => {
  const foodCourtId = params.foodCourtId;
  const menuData = foodCourtId ? await fetchMenuData(foodCourtId) : null;

  return (
    <> {/* Use Fragment instead of div */}
      {/* Update href to scroll to the block selection section */}
      <Link href="/#block-selection" passHref>
         <Button variant="outline" className="mb-4">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blocks
         </Button>
      </Link>
      {/* Render the Client Menu component, passing the fetched data */}
      {menuData ? (
          <Menu
              foodCourtId={foodCourtId}
              initialMenuItems={menuData.menuItems}
              initialFoodCourtName={menuData.foodCourtName}
          />
      ) : (
           <div className="text-center p-10 text-destructive flex flex-col items-center gap-4">
                <AlertTriangle className="h-10 w-10" />
                <p className="font-semibold">Error: Menu Not Found</p>
                <p className="text-muted-foreground">Could not load menu data for the selected food court.</p>
                <Link href="/" passHref>
                    <Button variant="outline">Go Back Home</Button>
                </Link>
           </div>
      )}
    </>
  );
}

export default MenuPage;
