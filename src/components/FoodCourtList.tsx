"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building } from "lucide-react"; // Using a generic icon for food courts
import { useRouter } from 'next/navigation'; // Import useRouter

interface FoodCourtListProps {
  block: string;
  // Removed onFoodCourtSelect as navigation is handled internally
}

const FoodCourtList: React.FC<FoodCourtListProps> = ({ block }) => {
  const router = useRouter(); // Initialize router

  // Mock data - replace with actual data fetching later
  const foodCourts = {
    "Block A": [
      { id: "fc1a", name: "The Hungry Ram", description: "Quick bites and snacks" },
      { id: "fc2a", name: "Green Leaf Cafe", description: "Salads and healthy options" }
    ],
    "Block B": [
      { id: "fc1b", name: "Pizza Point", description: "Classic pizzas and sides" },
      { id: "fc2b", name: "Curry Corner", description: "Authentic Indian cuisine" }
    ],
    "Block C": [
      { id: "fc1c", name: "Burger Hub", description: "Gourmet burgers and fries" },
      { id: "fc2c", name: "Noodle Bar", description: "Asian stir-fries and soups" }
    ],
    "Block D": [
      { id: "fc1d", name: "Sub Station", description: "Customizable sandwiches" },
      { id: "fc2d", name: "Coffee Stop", description: "Coffee, pastries, and light meals" }
    ],
  };

  const foodCourtsInBlock = foodCourts[block] || [];

  // Function to handle navigation
  const handleViewMenuClick = (foodCourtId: string) => {
    router.push(`/menu/${foodCourtId}`); // Navigate to the dynamic menu page
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-center md:text-left">Food Courts in {block}</h2>
      {foodCourtsInBlock.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {foodCourtsInBlock.map((foodCourt) => (
            <Card key={foodCourt.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                 <Building className="w-8 h-8 text-primary" />
                 <div>
                  <CardTitle>{foodCourt.name}</CardTitle>
                  <CardDescription>{foodCourt.description}</CardDescription>
                 </div>
              </CardHeader>
              <CardContent className="mt-auto pt-4">
                <Button className="w-full" onClick={() => handleViewMenuClick(foodCourt.id)}>
                  View Menu
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
         <p className="text-muted-foreground text-center">No food courts found in this block.</p>
      )}
    </div>
  );
};

export default FoodCourtList;
