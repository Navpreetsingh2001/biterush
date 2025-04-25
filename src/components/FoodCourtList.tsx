"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FoodCourtListProps {
  block: string;
  onFoodCourtSelect: (foodCourt: string) => void;
}

const FoodCourtList: React.FC<FoodCourtListProps> = ({ block, onFoodCourtSelect }) => {
  const foodCourts = {
    "Block A": ["Food Court 1A", "Food Court 2A"],
    "Block B": ["Food Court 1B", "Food Court 2B"],
    "Block C": ["Food Court 1C", "Food Court 2C"],
    "Block D": ["Food Court 1D", "Food Court 2D"],
  };

  const foodCourtsInBlock = foodCourts[block] || [];

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Food Courts in {block}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {foodCourtsInBlock.map((foodCourt) => (
          <Card key={foodCourt}>
            <CardHeader>
              <CardTitle>{foodCourt}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => onFoodCourtSelect(foodCourt)}>View Menu</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FoodCourtList;
