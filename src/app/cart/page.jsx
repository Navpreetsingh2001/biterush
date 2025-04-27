
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label"; // Import Label
import { Minus, Plus, Trash2, QrCode, ShoppingBag, ArrowLeft, Clock, Ban, Info, CheckCircle, MapPin, LocateFixed, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import Image from 'next/image';
import Link from 'next/link';
import { generateGPayQRCode } from '@/services/gpay'; // Ensure this path is correct
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';

// Helper function to estimate delivery time (removed type annotation)
const estimateDeliveryTime = (itemCount) => {
  // Simple estimation: 15 minutes base + 2 minutes per item
  if (itemCount === 0) return 0;
  return 15 + itemCount * 2;
};

const CANCELLATION_WINDOW_MINUTES = 2;

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, deliveryLocation, setDeliveryLocation } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  // Removed type annotations for state variables
  const [gpayQRCode, setGPayQRCode] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [paymentCompletedAt, setPaymentCompletedAt] = useState(null);
  const [canCancel, setCanCancel] = useState(false);
  const [cancellationExpired, setCancellationExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CANCELLATION_WINDOW_MINUTES * 60); // Time left in seconds
  const [locationInput, setLocationInput] = useState(''); // State for location input
  const [isLocating, setIsLocating] = useState(false); // State for geolocation loading
  const [isGeneratingQR, setIsGeneratingQR] = useState(false); // State for QR generation loading

  const estimatedTime = useMemo(() => estimateDeliveryTime(totalItems), [totalItems]);

  // Ensure component is mounted on client before proceeding
  useEffect(() => {
    setIsClient(true);
    // Initialize location input with context value if available
    if (deliveryLocation) {
        setLocationInput(deliveryLocation);
    }
  }, [deliveryLocation]); // Add deliveryLocation dependency

  // Generate QR Code Effect - Triggered when location is set and cart is not empty
  useEffect(() => {
    if (!isClient || paymentCompletedAt || isGeneratingQR || !deliveryLocation || cartItems.length === 0 || gpayQRCode) return; // Guard conditions

    const generateQRCode = async () => {
      setIsGeneratingQR(true); // Indicate QR generation start
      if (totalPrice > 0) {
        try {
          console.log("Generating QR Code for total:", totalPrice);
          const gpayData = await generateGPayQRCode(totalPrice);
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gpayData.qrCode)}`;
          setGPayQRCode(qrCodeUrl);

          // *** Simulate payment completion AFTER QR Code is visible ***
          // We set a short delay to allow the QR code to render before showing confirmation/cancel
          setTimeout(() => {
             setPaymentCompletedAt(new Date());
             setCanCancel(true); // Enable cancellation window
             setCancellationExpired(false);
             setTimeLeft(CANCELLATION_WINDOW_MINUTES * 60); // Reset timer
             console.log("QR Code displayed, payment considered completed at:", new Date());
              toast({
                  title: "Payment Ready",
                  description: "Scan the QR code with GPay to complete your payment.",
                  variant: "default",
              });
              setIsGeneratingQR(false); // QR Generation finished
          }, 500); // Delay in ms, adjust if needed


        } catch (error) {
          console.error("Failed to generate QR code:", error);
          setGPayQRCode(null);
          setIsGeneratingQR(false); // Reset loading state on error
           toast({
              title: "Error",
              description: "Failed to generate payment QR code. Please try again.",
              variant: "destructive",
           });
        }
      } else {
        setGPayQRCode(null);
        setIsGeneratingQR(false); // Reset loading state if price is 0
      }
    };

    generateQRCode();

  }, [totalPrice, isClient, cartItems.length, deliveryLocation, paymentCompletedAt, isGeneratingQR, gpayQRCode, toast]); // Dependencies


  // Cancellation Timer Effect
  useEffect(() => {
     // Run only if payment is marked complete and cancellation is currently allowed
     if (!isClient || !paymentCompletedAt || !canCancel) {
      return;
    }

    const deadline = paymentCompletedAt.getTime() + CANCELLATION_WINDOW_MINUTES * 60 * 1000;
    console.log("Cancellation deadline:", new Date(deadline));


    const timerInterval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((deadline - now) / 1000));
      setTimeLeft(remaining);


      if (now > deadline) {
        console.log("Cancellation window expired.");
        setCanCancel(false); // Disable cancellation
        setCancellationExpired(true); // Mark as expired
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


  const handleQuantityChange = (itemId, newQuantity) => { // Removed type annotations
    if (paymentCompletedAt) {
        toast({ title: "Order Finalized", description: "Cannot modify quantity after payment.", variant: "destructive"});
        return;
    }
    const quantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0
    updateQuantity(itemId, quantity);
  };

   const handleRemoveItem = (itemId) => { // Removed type annotation
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
     clearCart(); // This now also clears the location in context
     setLocationInput(''); // Clear local input state as well
     setGPayQRCode(null);
     setPaymentCompletedAt(null);
     setCanCancel(false);
     setCancellationExpired(false);
   }

  // Handle Order Cancellation
   const handleCancelOrder = useCallback(() => {
     if (canCancel) {
       console.log("Cancelling order...");
       clearCart(); // Clear items and location from cart context
       setLocationInput(''); // Clear local input state
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
   }, [canCancel, cancellationExpired, clearCart, toast, router]); // Dependencies for useCallback

   // Handle saving the delivery location
    const handleSaveLocation = () => {
        if (paymentCompletedAt) {
            toast({ title: "Order Finalized", description: "Cannot change location after payment.", variant: "destructive"});
            return;
        }
        const trimmedLocation = locationInput.trim();
        if (trimmedLocation) {
            setDeliveryLocation(trimmedLocation); // Update location in context only if not empty
        } else {
             toast({ title: "Invalid Location", description: "Please enter a valid delivery location.", variant: "destructive"});
        }

    };

    // Handle getting current location using Geolocation API
    const handleGetCurrentLocation = () => {
        if (paymentCompletedAt) {
             toast({ title: "Order Finalized", description: "Cannot change location after payment.", variant: "destructive"});
             return;
        }
        if (typeof navigator === 'undefined' || !navigator.geolocation) { // Added check for navigator
            toast({ title: "Geolocation Not Supported", description: "Your browser does not support geolocation.", variant: "destructive" });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // You might want to use a reverse geocoding service here
                // to get a human-readable address from lat/lon.
                // For simplicity, we'll just use the coordinates for now.
                const locationString = `Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`;
                setLocationInput(locationString);
                setDeliveryLocation(locationString); // Update context
                setIsLocating(false);
                toast({ title: "Location Fetched", description: "Current location coordinates set." });
            },
            (error) => {
                setIsLocating(false);
                console.error("Error getting location:", error);
                let message = "Failed to get current location.";
                 if (error.code === error.PERMISSION_DENIED) {
                     message = "Geolocation permission denied. Please enable it in your browser settings.";
                 } else if (error.code === error.POSITION_UNAVAILABLE) {
                    message = "Location information is unavailable.";
                 } else if (error.code === error.TIMEOUT) {
                    message = "The request to get user location timed out.";
                 }
                toast({ title: "Location Error", description: message, variant: "destructive" });
            },
            { timeout: 10000 } // Set a timeout for the request
        );
    };


  // Group items by food court
  const groupedCartItems = cartItems.reduce((acc, item) => {
    const courtId = item.foodCourtId;
    if (!acc[courtId]) {
      acc[courtId] = { name: item.foodCourtName, items: [] };
    }
    acc[courtId].items.push(item);
    return acc;
  }, {}); // Removed type assertion

  if (!isClient) {
     // Render loading state or null during SSR/initial render
     return <div className="text-center p-10">Loading Cart...</div>;
  }

  // Removed type annotation
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  return (
    <div className="container mx-auto px-4 py-8">
       {/* Show Continue Shopping only if payment hasn't started */}
       {!deliveryLocation && !paymentCompletedAt && cartItems.length === 0 && (
            <Link href="/" passHref>
                <Button variant="outline" className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                </Button>
            </Link>
       )}

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
         <ShoppingBag /> {paymentCompletedAt ? "Order Details" : `Your Order (${totalItems} items)`}
      </h1>

      {/* Case 1: Cart is empty AND payment was never initiated (or after cancellation) */}
      {cartItems.length === 0 && !paymentCompletedAt ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">Your cart is empty.</p>
             <Link href="/" passHref>
                <Button className="mt-4">Start Ordering</Button>
             </Link>
          </CardContent>
        </Card>
      ) :
      /* Case 2: Cart became empty AFTER payment was simulated (e.g., successful cancellation) */
      cartItems.length === 0 && paymentCompletedAt && !cancellationExpired ? (
         <Card className="text-center py-10">
            <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle /> Order Cancelled
                </CardTitle>
            </CardHeader>
           <CardContent>
             <p className="text-muted-foreground mb-4">Your order was successfully cancelled.</p>
              <Link href="/" passHref>
                 <Button className="mt-4">Go to Home</Button>
              </Link>
           </CardContent>
         </Card>
      ) :
       /* Case 3: Cart has items OR order was completed and not cancelled */
       (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Display Cart Items - only show if items exist */}
            {cartItems.length > 0 && Object.entries(groupedCartItems).map(([foodCourtId, group]) => (
              <Card key={foodCourtId}>
                <CardHeader>
                  <CardTitle className="text-xl">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 flex-wrap gap-4">
                      {/* Item Image */}
                       <div className="flex-shrink-0">
                         {item.imageUrl ? (
                           <Image
                             src={item.imageUrl}
                             alt={item.name}
                             width={64}
                             height={64}
                             className="rounded-md object-cover aspect-square"
                           />
                         ) : (
                            <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                               <ImageIcon className="h-6 w-6" />
                            </div>
                         )}
                       </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-[150px]">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-sm font-semibold">${item.price.toFixed(2)}</p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
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

                      {/* Item Total */}
                      <div className="w-20 text-right font-semibold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* Clear Cart Button - show only if cart has items and payment not completed */}
            {cartItems.length > 0 && !paymentCompletedAt && (
                <Button variant="outline" onClick={handleClearCart} className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4"/> Clear Cart
                </Button>
            )}

             {/* Order Placed Message - Show if payment completed and cancellation window expired */}
             {paymentCompletedAt && cancellationExpired && cartItems.length > 0 && (
                 <Card className="text-center py-10">
                     <CardHeader>
                         <CardTitle className="flex items-center justify-center gap-2 text-green-600">
                             <CheckCircle /> Order Placed Successfully!
                         </CardTitle>
                     </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                          Your order payment was successful and is being prepared. Estimated delivery in ~{estimatedTime} minutes.
                      </p>
                       <Link href="/" passHref>
                          <Button className="mt-4">Go to Home</Button>
                       </Link>
                    </CardContent>
                  </Card>
             )}


          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg"> {/* Make summary sticky */}
              <CardHeader>
                <CardTitle className="text-xl">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 {/* Delivery Location Input - show only before payment */}
                 {!paymentCompletedAt && (
                     <div className="space-y-2">
                        <Label htmlFor="deliveryLocation" className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" /> Delivery Location *
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="deliveryLocation"
                                placeholder="E.g., Library Room 201"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                className="flex-grow"
                                disabled={!!paymentCompletedAt || isLocating} // Disable if locating or payment done
                                required // Mark as required
                            />
                            <Button size="icon" variant="outline" onClick={handleGetCurrentLocation} disabled={!!paymentCompletedAt || isLocating} title="Use Current Location">
                                <LocateFixed className={`h-4 w-4 ${isLocating ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <Button onClick={handleSaveLocation} className="w-full" disabled={!locationInput.trim() || !!paymentCompletedAt || isLocating}>
                            {deliveryLocation ? 'Update Location' : 'Set Location'}
                        </Button>
                        {!deliveryLocation && cartItems.length > 0 && (
                             <p className="text-xs text-destructive text-center pt-1">Please set a delivery location to proceed.</p>
                        )}
                     </div>
                 )}

                 {/* Display Saved/Current Delivery Location */}
                 {deliveryLocation && (
                     <div className="flex justify-between items-center text-sm text-muted-foreground border-t pt-4">
                         <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" /> Delivering To</span>
                         <span className="font-medium text-right">{deliveryLocation}</span>
                     </div>
                 )}

                {/* Order Totals - only show if cart has items */}
                 {cartItems.length > 0 && (
                     <>
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
                    </>
                 )}

                 {/* === Payment / QR Code Section (Shown BEFORE payment confirmation) === */}
                 {!paymentCompletedAt && deliveryLocation && cartItems.length > 0 && (
                   <div className="mt-6 text-center border-t pt-6">
                     {isGeneratingQR && (
                       <p className="text-muted-foreground mb-3">Generating QR Code...</p>
                     )}
                     {gpayQRCode && !isGeneratingQR && (
                       <>
                         <p className="text-muted-foreground mb-3 flex items-center justify-center gap-1">
                           <QrCode className="h-5 w-5"/> Scan with GPay to Pay
                         </p>
                         <div className="flex justify-center bg-white p-2 rounded-md">
                           <Image src={gpayQRCode} alt="GPay QR Code" width={200} height={200} priority />
                         </div>
                       </>
                     )}
                   </div>
                 )}

                  {/* Prompt to set location if needed */}
                  {!deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                       <Alert variant="destructive" className="mt-4">
                          <AlertTitle>Set Delivery Location</AlertTitle>
                          <AlertDescription>
                             Please enter and save your delivery location above to generate the payment QR code.
                          </AlertDescription>
                        </Alert>
                  )}


                 {/* === Order Confirmation & Cancellation Section (Shown AFTER payment is simulated) === */}
                {paymentCompletedAt && cartItems.length > 0 && ( // Ensure items exist before showing this
                  <div className="mt-6 border-t pt-6 space-y-4">
                     {/* Payment Received Alert - Show immediately after payment simulation */}
                     {!cancellationExpired && ( // Don't show if cancellation expired (means order is placed)
                         <Alert variant="default" className="bg-green-50 border-green-300">
                             <CheckCircle className="h-5 w-5 text-green-600" />
                           <AlertTitle className="text-green-700">Payment Received (Simulated)</AlertTitle>
                           <AlertDescription className="text-green-600">
                             Your order is processing. Preparing for delivery to <strong>{deliveryLocation || 'your location'}</strong>.
                           </AlertDescription>
                         </Alert>
                     )}

                     {/* Cancellation Window: Show only if canCancel is true */}
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

                     {/* Cancellation Expired Message: Show only if cancellationExpired is true */}
                      {cancellationExpired && (
                        <Alert variant="destructive">
                           <Ban className="h-5 w-5" />
                           <AlertTitle>Cancellation Window Closed</AlertTitle>
                           <AlertDescription>
                                You can no longer cancel this order. It is being prepared.
                           </AlertDescription>
                         </Alert>
                      )}

                      {/* Refund Policy Info: Always show after payment is confirmed */}
                      <Alert variant="default" className="bg-blue-50 border-blue-300 mt-4">
                        <Info className="h-5 w-5 text-blue-600" />
                        <AlertTitle className="text-blue-700">Refund Policy</AlertTitle>
                        <AlertDescription className="text-blue-600">
                          Orders can be cancelled within {CANCELLATION_WINDOW_MINUTES} minutes of payment for convenience only. <strong>No refund will be issued for cancelled orders.</strong>
                        </AlertDescription>
                      </Alert>
                  </div>
                )}

              </CardContent>
               {/* Footer can be used for final confirmation button if payment isn't immediate */}
               {/* <CardFooter>
                  {!paymentCompletedAt && deliveryLocation && gpayQRCode && (
                     <Button className="w-full" onClick={handleConfirmPayment}>Confirm Payment (Simulated)</Button>
                   )}
               </CardFooter> */}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
