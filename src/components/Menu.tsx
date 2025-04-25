"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { generateGPayQRCode } from '@/services/gpay';

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuProps {
  foodCourt: string;
}

const Menu: React.FC<MenuProps> = ({ foodCourt }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [gpayQRCode, setGPayQRCode] = useState<string | null>(null);

  useEffect(() => {
    // Replace with actual data fetching logic
    const fetchMenu = async () => {
      const mockMenuItems = [
        { id: "1", name: "Burger", price: 5.99 },
        { id: "2", name: "Pizza", price: 8.99 },
        { id: "3", name: "Salad", price: 4.99 },
      ];
      setMenuItems(mockMenuItems);
    };

    fetchMenu();
  }, [foodCourt]);

    useEffect(() => {
        const generateQRCode = async () => {
            if (totalPrice > 0) {
                const gpayData = await generateGPayQRCode(totalPrice);
                setGPayQRCode(gpayData.qrCode);
            } else {
                setGPayQRCode(null);
            }
        };

        generateQRCode();
    }, [totalPrice]);

    const handleAddToCart = (price: number) => {
        setTotalPrice(prevPrice => prevPrice + price);
    };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Menu for {foodCourt}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              Price: ${item.price.toFixed(2)}
              <Button className="mt-2" onClick={() => handleAddToCart(item.price)}>Add to Cart</Button>
            </CardContent>
          </Card>
        ))}
      </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</h3>
                {gpayQRCode && (
                    <div>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${gpayQRCode}`} alt="GPay QR Code" />
                        <p>Scan with GPay to pay!</p>
                    </div>
                )}
            </div>
    </div>
  );
};

export default Menu;
