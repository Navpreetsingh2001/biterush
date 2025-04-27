"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, QrCode, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { generateGPayQRCode } from '@/services/gpay'; // Ensure this path is correct

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [gpayQRCode, setGPayQRCode] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Component has mounted on the client

    const generateQRCode = async () => {
      if (totalPrice > 0) {
        try {
          const gpayData = await generateGPayQRCode(totalPrice);
          // Use a real QR code generation API or library if available
          // For demonstration, using qrserver.com with the generated GPay data
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gpayData.qrCode)}`;
          setGPayQRCode(qrCodeUrl);
        } catch (error) {
          console.error("Failed to generate QR code:", error);
          setGPayQRCode(null); // Handle error case
        }
      } else {
        setGPayQRCode(null);
      }
    };

    generateQRCode();
  }, [totalPrice]); // Depend on totalPrice to regenerate QR code

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const quantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0
    updateQuantity(itemId, quantity);
  };

  // Group items by food court
  const groupedCartItems = cartItems.reduce((acc, item) => {
    const courtId = item.foodCourtId;
    if (!acc[courtId]) {
      acc[courtId] = { name: item.foodCourtName, items: [] };
    }
    acc[courtId].items.push(item);
    return acc;
  }, {} as Record<string, { name: string; items: typeof cartItems }>);

  if (!isClient) {
     // Render loading state or null during SSR/initial render
     return <div className="text-center p-10">Loading Cart...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
       <Link href="/" passHref>
         <Button variant="outline" className="mb-6">
           <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
         </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
         <ShoppingBag /> Your Cart ({totalItems} items)
      </h1>

      {cartItems.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Your cart is empty.</p>
             <Link href="/" passHref>
                <Button className="mt-4">Start Ordering</Button>
             </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedCartItems).map(([foodCourtId, group]) => (
              <Card key={foodCourtId}>
                <CardHeader>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4">
                      <div className="flex-1 mr-4">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                          className="h-8 w-12 text-center px-1"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                         <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="w-20 text-right font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" onClick={clearCart} className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4"/> Clear Cart
            </Button>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg"> {/* Make summary sticky */}
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {/* Add more details like taxes or fees if needed */}
                <div className="flex justify-between font-bold text-lg border-t pt-4">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {gpayQRCode && (
                  <div className="mt-6 text-center border-t pt-6">
                    <p className="text-muted-foreground mb-3 flex items-center justify-center gap-1">
                      <QrCode className="h-5 w-5"/> Scan with GPay to Complete Payment
                    </p>
                    <div className="flex justify-center bg-white p-2 rounded-md">
                      <Image src={gpayQRCode} alt="GPay QR Code" width={200} height={200} priority />
                    </div>
                  </div>
                )}
                {!gpayQRCode && totalPrice > 0 && (
                     <div className="text-center text-muted-foreground pt-4">Generating QR Code...</div>
                 )}
              </CardContent>
              <CardFooter>
                <Button className="w-full" disabled={!gpayQRCode || cartItems.length === 0}>
                  Proceed to Payment (Scan QR)
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
