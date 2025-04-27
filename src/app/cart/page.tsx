
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Minus, Plus, Trash2, QrCode, ShoppingBag, ArrowLeft, Clock, Ban, Info, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { generateGPayQRCode } from '@/services/gpay'; // Ensure this path is correct
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

// Helper function to estimate delivery time
const estimateDeliveryTime = (itemCount: number): number => {
  // Simple estimation: 15 minutes base + 2 minutes per item
  if (itemCount === 0) return 0;
  return 15 + itemCount * 2;
};

const CANCELLATION_WINDOW_MINUTES = 2;

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [gpayQRCode, setGPayQRCode] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [paymentCompletedAt, setPaymentCompletedAt] = useState<Date | null>(null);
  const [canCancel, setCanCancel] = useState<boolean>(false);
  const [cancellationExpired, setCancellationExpired] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(CANCELLATION_WINDOW_MINUTES * 60); // Time left in seconds

  const estimatedTime = useMemo(() => estimateDeliveryTime(totalItems), [totalItems]);

  // Ensure component is mounted on client before proceeding
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate QR Code Effect
  useEffect(() => {
    if (!isClient || paymentCompletedAt) return; // Don't run if not client or payment already "completed"

    const generateQRCode = async () => {
      if (totalPrice > 0) {
        try {
          console.log("Generating QR Code for total:", totalPrice);
          const gpayData = await generateGPayQRCode(totalPrice);
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gpayData.qrCode)}`;
          setGPayQRCode(qrCodeUrl);
          // Simulate payment completion when QR code is ready
          setPaymentCompletedAt(new Date());
          setCanCancel(true);
          setCancellationExpired(false);
          setTimeLeft(CANCELLATION_WINDOW_MINUTES * 60); // Reset timer
          console.log("QR Code generated, payment considered completed at:", new Date());
           toast({
                title: "Payment Ready",
                description: "Scan the QR code with GPay to complete your payment.",
                variant: "default",
            });

        } catch (error) {
          console.error("Failed to generate QR code:", error);
          setGPayQRCode(null);
           toast({
              title: "Error",
              description: "Failed to generate payment QR code. Please try again.",
              variant: "destructive",
           });
        }
      } else {
        setGPayQRCode(null);
        setPaymentCompletedAt(null); // Reset payment state if price becomes 0
        setCanCancel(false);
        setCancellationExpired(false);
      }
    };

    // Only generate QR if cart is not empty and QR not already generated
    if (cartItems.length > 0 && !gpayQRCode) {
       generateQRCode();
    } else if (cartItems.length === 0) {
        // Reset everything if cart becomes empty before payment
        setGPayQRCode(null);
        setPaymentCompletedAt(null);
        setCanCancel(false);
        setCancellationExpired(false);
    }

  }, [totalPrice, isClient, cartItems.length, gpayQRCode, paymentCompletedAt, toast]); // Added dependencies


  // Cancellation Timer Effect
  useEffect(() => {
     if (!isClient || !paymentCompletedAt || !canCancel) {
      return; // Don't run timer if not client, payment not done, or already cancelled/expired
    }

    const deadline = paymentCompletedAt.getTime() + CANCELLATION_WINDOW_MINUTES * 60 * 1000;
    console.log("Cancellation deadline:", new Date(deadline));


    const timerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((deadline - now) / 1000));
      setTimeLeft(remaining);
      // console.log("Time left:", remaining);


      if (now > deadline) {
        console.log("Cancellation window expired.");
        setCanCancel(false);
        setCancellationExpired(true);
        clearInterval(timerInterval);
        toast({
             title: "Cancellation Window Closed",
             description: `The ${CANCELLATION_WINDOW_MINUTES}-minute window to cancel has expired.`,
             variant: "destructive"
         });
      }
    }, 1000);

    // Cleanup interval on component unmount or when dependencies change
    return () => {
      console.log("Clearing cancellation timer interval.");
      clearInterval(timerInterval);
    };
  }, [isClient, paymentCompletedAt, canCancel, toast]);


  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (paymentCompletedAt) {
        toast({ title: "Order Finalized", description: "Cannot modify quantity after payment.", variant: "destructive"});
        return;
    }
    const quantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0
    updateQuantity(itemId, quantity);
  };

   const handleRemoveItem = (itemId: string) => {
     if (paymentCompletedAt) {
       toast({ title: "Order Finalized", description: "Cannot remove items after payment.", variant: "destructive"});
       return;
     }
     removeFromCart(itemId);
   };

   const handleClearCart = () => {
     if (paymentCompletedAt) {
        toast({ title: "Order Finalized", description: "Cannot clear cart after payment.", variant: "destructive"});
        return;
     }
     clearCart();
     setGPayQRCode(null);
     setPaymentCompletedAt(null);
     setCanCancel(false);
     setCancellationExpired(false);
   }

  // Handle Order Cancellation
   const handleCancelOrder = useCallback(() => {
     if (canCancel) {
       console.log("Cancelling order...");
       clearCart(); // Clear items from cart context
       setGPayQRCode(null); // Remove QR code
       setPaymentCompletedAt(null); // Reset payment timestamp
       setCanCancel(false); // Disable further cancellation attempts
       setCancellationExpired(false); // Reset expiry flag
       toast({
         title: "Order Cancelled",
         description: "Your order has been successfully cancelled.",
         variant: "default", // Use default or a success variant
         className: "bg-green-100 border-green-300 text-green-800", // Example success styling
       });
       // Optionally redirect user
       // router.push('/');
     } else {
       console.log("Attempted to cancel when not allowed.");
        toast({
          title: "Cancellation Not Allowed",
          description: cancellationExpired ? "The cancellation window has expired." : "Cancellation is not currently possible.",
          variant: "destructive",
        });
     }
   }, [canCancel, cancellationExpired, clearCart, toast, router]);


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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  return (
    <div className="container mx-auto px-4 py-8">
       {!paymentCompletedAt && (
            <Link href="/" passHref>
                <Button variant="outline" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                </Button>
            </Link>
       )}

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
         <ShoppingBag /> {paymentCompletedAt ? "Order Details" : `Your Order (${totalItems} items)`}
      </h1>

      {cartItems.length === 0 && !paymentCompletedAt ? ( // Show empty cart only if cart is empty AND payment wasn't just completed/cancelled
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Your cart is empty.</p>
             <Link href="/" passHref>
                <Button className="mt-4">Start Ordering</Button>
             </Link>
          </CardContent>
        </Card>
      ) : cartItems.length === 0 && paymentCompletedAt ? ( // Show order placed/cancelled message
         <Card className="text-center py-10">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle /> {cancellationExpired ? "Order Placed" : "Order Cancelled"}
                </CardTitle>
            </CardHeader>
           <CardContent>
             <p className="text-muted-foreground mb-4">
                 {cancellationExpired
                    ? "Your order payment was successful and is being prepared."
                    : "Your order was successfully cancelled."
                 }
             </p>
              <Link href="/" passHref>
                 <Button className="mt-4">Go to Home</Button>
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
                    <div key={item.id} className="flex items-center justify-between py-4 flex-wrap">
                      <div className="flex-1 min-w-[150px] mr-4 mb-2 sm:mb-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || !!paymentCompletedAt} // Disable after payment
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                           onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value, 10) || 1)}
                           className="h-8 w-12 text-center px-1"
                           aria-label={`Quantity for ${item.name}`}
                           readOnly={!!paymentCompletedAt} // Make read-only after payment
                           disabled={!!paymentCompletedAt}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                           onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                           disabled={!!paymentCompletedAt} // Disable after payment
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-destructive hover:text-destructive"
                           onClick={() => handleRemoveItem(item.id)} // Use specific handler
                           aria-label={`Remove ${item.name}`}
                           disabled={!!paymentCompletedAt} // Disable after payment
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                      <div className="w-full sm:w-20 text-right font-semibold mt-2 sm:mt-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            {!paymentCompletedAt && (
                <Button variant="outline" onClick={handleClearCart} className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear Cart
                </Button>
            )}
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
                 {/* Estimated Delivery Time */}
                 <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Est. Delivery Time</span>
                    <span>~ {estimatedTime} minutes</span>
                 </div>
                {/* Add more details like taxes or fees if needed */}
                <div className="flex justify-between font-bold text-lg border-t pt-4">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {/* Payment / QR Code Section */}
                {!paymentCompletedAt && gpayQRCode && (
                  <div className="mt-6 text-center border-t pt-6">
                    <p className="text-muted-foreground mb-3 flex items-center justify-center gap-1">
                      <QrCode className="h-5 w-5"/> Scan with GPay to Complete Payment
                    </p>
                    <div className="flex justify-center bg-white p-2 rounded-md">
                      <Image src={gpayQRCode} alt="GPay QR Code" width={200} height={200} priority />
                    </div>
                     {/* Simulate payment completion button (for dev/testing) */}
                     {/* <Button className="mt-4" onClick={() => {
                        setPaymentCompletedAt(new Date());
                        setCanCancel(true);
                        setCancellationExpired(false);
                        setTimeLeft(CANCELLATION_WINDOW_MINUTES * 60);
                        toast({ title: "Payment Simulated", description: "Order is now considered paid."});
                     }}>
                        Simulate Payment
                    </Button> */}
                  </div>
                )}
                {!gpayQRCode && totalPrice > 0 && !paymentCompletedAt && (
                     <div className="text-center text-muted-foreground pt-4">Generating QR Code...</div>
                 )}


                 {/* Order Confirmation & Cancellation Section */}
                {paymentCompletedAt && (
                  <div className="mt-6 border-t pt-6 space-y-4">
                     <Alert variant="default" className="bg-green-50 border-green-300">
                         <CheckCircle className="h-5 w-5 text-green-600" />
                       <AlertTitle className="text-green-700">Payment Received!</AlertTitle>
                       <AlertDescription className="text-green-600">
                         Your order is being prepared. Estimated delivery in ~{estimatedTime} minutes.
                       </AlertDescription>
                     </Alert>

                     {/* Cancellation Window */}
                     {canCancel && (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Need to cancel? You have <strong className="text-foreground">{formatTime(timeLeft)}</strong> left.
                            </p>
                           <Button variant="destructive" onClick={handleCancelOrder} className="w-full">
                             <Ban className="mr-2 h-4 w-4" /> Cancel Order (No Refund)
                           </Button>
                        </div>
                     )}

                     {/* Cancellation Expired Message */}
                      {cancellationExpired && (
                        <Alert variant="destructive">
                           <Ban className="h-5 w-5" />
                           <AlertTitle>Cancellation Window Closed</AlertTitle>
                           <AlertDescription>
                                You can no longer cancel this order.
                           </AlertDescription>
                         </Alert>
                      )}

                     {/* Refund Policy Info */}
                      <Alert variant="default" className="bg-blue-50 border-blue-300">
                        <Info className="h-5 w-5 text-blue-600" />
                        <AlertTitle className="text-blue-700">Refund Policy</AlertTitle>
                        <AlertDescription className="text-blue-600">
                          Orders can be cancelled within {CANCELLATION_WINDOW_MINUTES} minutes of payment for convenience only. <strong>No refund will be issued for cancelled orders.</strong>
                        </AlertDescription>
                      </Alert>
                  </div>
                )}

              </CardContent>
               {/* Footer actions if needed (e.g., confirm order button if payment isn't automatic) */}
               {/* <CardFooter>
                 { // Show confirm button only if needed and payment not done }
               </CardFooter> */}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}


    