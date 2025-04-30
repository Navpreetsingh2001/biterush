
"use client";

import type { FC } from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label"; // Import Label
import { Minus, Plus, Trash2, QrCode, ShoppingBag, ArrowLeft, Clock, Ban, Info, CheckCircle, MapPin, LocateFixed, Image as ImageIcon, Loader2, UserX } from 'lucide-react'; // Added UserX
import Image from 'next/image';
import Link from 'next/link';
// Corrected import: Use upi.ts and generateUPIQRCode
import { generateUPIQRCode, type UPIQRCode } from '@/services/upi';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Helper function to estimate delivery time
const estimateDeliveryTime = (itemCount: number): number => {
  // Simple estimation: 15 minutes base + 2 minutes per item
  if (itemCount === 0) return 0;
  return 15 + itemCount * 2;
};

const CANCELLATION_WINDOW_MINUTES = 2;

const CartPage: FC = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, deliveryLocation, setDeliveryLocation } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(); // Get user and loading state
  const [upiQRCode, setUpiQRCode] = useState<string | null>(null); // Changed state name and type to string | null
  const [isClient, setIsClient] = useState(false);
  const [paymentCompletedAt, setPaymentCompletedAt] = useState<Date | null>(null); // Use Date type
  const [canCancel, setCanCancel] = useState(false);
  const [cancellationExpired, setCancellationExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(CANCELLATION_WINDOW_MINUTES * 60); // Time left in seconds
  const [locationInput, setLocationInput] = useState(''); // State for location input
  const [isLocating, setIsLocating] = useState(false); // State for geolocation loading
  const [isGeneratingQR, setIsGeneratingQR] = useState(false); // State for QR generation loading
  const [isScanning, setIsScanning] = useState(false); // State for QR scanning simulation

  const estimatedTime = useMemo(() => estimateDeliveryTime(totalItems), [totalItems]);

  // Ensure component is mounted on client before proceeding
  useEffect(() => {
    setIsClient(true);
    // Initialize location input with context value if available
    if (deliveryLocation) {
        setLocationInput(deliveryLocation);
    }
  }, [deliveryLocation]); // Add deliveryLocation dependency

  // Redirect if not logged in (client-side guard)
   useEffect(() => {
       // Redirect only when auth check is complete and user is not logged in
       if (isClient && !authLoading && !user) {
           toast({
               title: "Authentication Required",
               description: "Please log in to view your cart.",
               variant: "destructive",
           });
           router.push('/login?redirectedFrom=/cart'); // Redirect to login, passing current path
       }
   }, [isClient, authLoading, user, router, toast]);


  // Generate QR Code Effect - Triggered when location is set and cart is not empty
  useEffect(() => {
    // Guard conditions: Run only on client, user logged in, before payment, not already generating, location set, cart not empty, price > 0, and QR not already generated
    if (!isClient || !user || paymentCompletedAt || isGeneratingQR || !deliveryLocation || cartItems.length === 0 || totalPrice <= 0 || upiQRCode) {
        // If conditions are not met, ensure QR code is null and not loading
        if(upiQRCode && (!deliveryLocation || cartItems.length === 0 || totalPrice <= 0 || !user)) {
            setUpiQRCode(null); // Clear QR code if cart becomes empty, location removed, or user logs out
        }
        setIsGeneratingQR(false); // Ensure loading state is off
        return;
    }


    const generateQRCode = async () => {
      setIsGeneratingQR(true); // Indicate QR generation start
      console.log("Attempting to generate QR Code for total:", totalPrice);
      try {
        // Use the corrected service function and type
        const upiData = await generateUPIQRCode(totalPrice);
        // Simulate UPI data being just the text for the QR code
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiData.qrCode)}`; // Use the data from the service
        setUpiQRCode(qrCodeUrl);
        console.log("UPI QR Code URL generated:", qrCodeUrl);
         toast({
             title: "UPI QR Code Ready",
             description: "Scan the QR code with your UPI app to complete your payment.", // Updated toast text
             variant: "default",
         });

      } catch (error) {
        console.error("Failed to generate QR code:", error);
        setUpiQRCode(null);
         toast({
            title: "Error",
            description: "Failed to generate payment QR code. Please try again.",
            variant: "destructive",
         });
      } finally {
          setIsGeneratingQR(false); // QR Generation finished (success or fail)
      }
    };

    generateQRCode();

  // IMPORTANT: Added upiQRCode and user to dependencies
  }, [totalPrice, isClient, user, cartItems.length, deliveryLocation, paymentCompletedAt, isGeneratingQR, upiQRCode, toast]); // Dependencies


   // Effect to Simulate Payment Completion AFTER QR Code is generated
   useEffect(() => {
     // Run only if QR code exists and payment hasn't been marked complete yet AND scanning is initiated
     if (!isClient || !upiQRCode || paymentCompletedAt || !isScanning) {
       return;
     }

     console.log("QR Code state updated, simulating payment completion shortly...");

     // Simulate payment completion shortly after QR Code is set, allowing render time
     const paymentTimeout = setTimeout(() => {
       const completionTime = new Date(); // Store the completion time
       setPaymentCompletedAt(completionTime);
       setCanCancel(true); // Enable cancellation window
       setCancellationExpired(false);
       setTimeLeft(CANCELLATION_WINDOW_MINUTES * 60); // Reset timer
       console.log("Payment considered completed at:", completionTime);
        toast({
             title: "Payment Processing",
             description: "Payment received (simulated). You have a short window to cancel.",
             variant: "default",
        });
       setIsScanning(false); // Turn off scanning indicator
     }, 1500); // Delay in ms (e.g., 1.5 seconds to simulate scan/processing)

     // Cleanup timeout if upiQRCode changes or component unmounts or scanning state changes
     return () => clearTimeout(paymentTimeout);

   }, [upiQRCode, isClient, paymentCompletedAt, isScanning, toast]); // Depends on upiQRCode state and isScanning


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


  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (paymentCompletedAt) {
        toast({ title: "Order Finalized", description: "Cannot modify quantity after payment.", variant: "destructive"});
        return;
    }
    const quantity = Math.max(0, newQuantity); // Ensure quantity doesn't go below 0
    updateQuantity(itemId, quantity);
    setUpiQRCode(null); // Reset QR code on quantity change before payment
  };

   const handleRemoveItem = (itemId: string) => {
     if (paymentCompletedAt) {
       toast({ title: "Order Finalized", description: "Cannot remove items after payment.", variant: "destructive"});
       return;
     }
     removeFromCart(itemId);
     setUpiQRCode(null); // Reset QR code on remove change before payment
   };

   const handleClearCart = () => {
     if (paymentCompletedAt) {
        toast({ title: "Order Finalized", description: "Cannot clear cart after payment.", variant: "destructive"});
        return;
     }
     clearCart(); // This now also clears the location in context
     setLocationInput(''); // Clear local input state as well
     setUpiQRCode(null);
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
       setUpiQRCode(null); // Remove QR code
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
             setUpiQRCode(null); // Reset QR code if location changes before payment
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
                setUpiQRCode(null); // Reset QR code if location changes before payment
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

   // Renamed handleScanQRCode to simulate payment initiation
   const handleSimulatePayment = () => {
     if (!upiQRCode) {
        toast({
          title: "QR Code Not Ready",
          description: "Please set a location and wait for the QR code to generate.",
          variant: "destructive",
        });
       return;
     }
     if(isScanning) {
        toast({
          title: "Processing...",
          description: "Payment simulation is already in progress.",
          variant: "destructive",
        });
        return; // Avoid triggering multiple times
     }
     setIsScanning(true); // Start the scanning/payment simulation process
      toast({
         title: "Simulating Payment",
         description: "Processing your UPI payment...",
         variant: "default",
      });
   };


  // Group items by food court
  const groupedCartItems = Object.values(
    cartItems.reduce((acc, item) => {
        const courtId = item.foodCourtId;
        if (!acc[courtId]) {
        acc[courtId] = { name: item.foodCourtName, items: [] };
        }
        acc[courtId].items.push(item);
        return acc;
    }, {} as Record<string, { name: string; items: CartItem[] }>) // Type assertion for accumulator
  );


  if (!isClient || authLoading) {
       return (
         <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
             <div className="flex items-center space-x-2">
                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 <span>Loading Cart...</span> {/* Wrap text in span */}
             </div>
         </div>
       );
    }

     // If finished loading and still no user, show message (should be handled by redirect, but as fallback)
     if (!user) {
       return (
         <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
             <Card className="w-full max-w-md p-6">
                 <CardHeader>
                     <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                         <UserX /> Access Denied
                     </CardTitle>
                 </CardHeader>
                 <CardContent>
                     <p className="text-muted-foreground mb-6">You need to be logged in to view your cart.</p>
                     <Link href="/login?redirectedFrom=/cart" passHref>
                         <Button variant="default">Go to Login</Button>
                     </Link>
                 </CardContent>
             </Card>
         </div>
       );
     }

  const formatTime = (seconds: number): string => { // Added type annotation
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  return (
    <div className="container mx-auto px-4 py-8">
       {/* Show Continue Shopping only if cart is empty and payment not done */}
       {cartItems.length === 0 && !paymentCompletedAt && (
            <div className="mb-6 text-center md:text-left">
                <Link href="/" passHref>
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Continue Shopping
                    </Button>
                </Link>
            </div>
       )}

      <h1 className="text-3xl font-bold mb-8 text-center text-primary">
         {paymentCompletedAt ? "Order Details" : `Your Order (${totalItems} items)`}
      </h1>

      {/* Case 1: Cart is empty AND payment was never initiated (or after cancellation) */}
      {cartItems.length === 0 && !paymentCompletedAt ? (
        <div className="text-center p-10 border rounded-lg shadow-sm bg-card">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-semibold mb-4">Your cart is empty.</p>
             <Link href="/" passHref>
                <Button variant="default">Start Ordering</Button>
             </Link>
          </div>
      ) :
      /* Case 2: Cart became empty AFTER payment was simulated (e.g., successful cancellation) */
      cartItems.length === 0 && paymentCompletedAt && !cancellationExpired ? (
         <Card className="text-center p-10 border rounded-lg shadow-sm">
             <CardHeader>
                 <CardTitle className="flex flex-col items-center gap-2 text-green-600">
                     <CheckCircle className="h-12 w-12" />
                     Order Cancelled
                 </CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground mb-6">Your order was successfully cancelled.</p>
                 <Link href="/" passHref>
                     <Button variant="outline">Go to Home</Button>
                 </Link>
             </CardContent>
         </Card>
      ) :
       /* Case 3: Cart has items OR order was completed and not cancelled */
       (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side: Cart Items / Order Placed Message */}
            <div className="lg:col-span-2 space-y-6">
              {/* Display Cart Items - only show if items exist */}
              {cartItems.length > 0 && groupedCartItems.map((group, index) => ( // Use groupedCartItems
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                        {/* Item Image */}
                         <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0">
                           {item.imageUrl ? (
                             <Image
                               src={item.imageUrl}
                               alt={item.name}
                               fill
                               sizes="64px"
                               className="object-cover"
                              />
                           ) : (
                              <div className="h-full w-full bg-secondary flex items-center justify-center">
                               <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              </div>
                           )}
                         </div>

                          {/* Item Details */}
                          <div className="flex-grow">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                            <p className="text-sm font-medium">₹{item.price.toFixed(2)}</p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            {!paymentCompletedAt ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveItem(item.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                                 <span className="font-semibold w-8 text-center">{item.quantity}</span> // Just show quantity after payment
                            )}
                          </div>

                          {/* Item Total */}
                          <div className="w-20 text-right font-semibold">
                           ₹{(item.price * item.quantity).toFixed(2)}
                          </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}

              {/* Clear Cart Button - show only if cart has items and payment not completed */}
              {cartItems.length > 0 && !paymentCompletedAt && (
                <div className="flex justify-end mt-4">
                   <Button variant="outline" onClick={handleClearCart} className="text-destructive border-destructive hover:bg-destructive/10">
                         <Trash2 className="mr-2 h-4 w-4" /> Clear Cart
                     </Button>
                </div>
              )}

               {/* Order Placed Message - Show if payment completed and cancellation window expired */}
               {paymentCompletedAt && cancellationExpired && cartItems.length > 0 && (
                 <Alert variant="default" className="bg-green-50 border-green-300 text-green-800">
                     <CheckCircle className="h-5 w-5 text-green-600" />
                     <AlertTitle className="font-bold">
                         Order Placed Successfully!
                     </AlertTitle>
                     <AlertDescription>
                        Your order payment was successful and is being prepared. Estimated delivery in ~{estimatedTime} minutes.
                        <div className="mt-4">
                            <Link href="/" passHref>
                                <Button variant="outline" className="border-green-500 text-green-700 hover:bg-green-100">Go to Home</Button>
                            </Link>
                        </div>
                     </AlertDescription>
                 </Alert>
               )}
          </div>

          {/* Right Side: Summary & Payment */}
            <div className="lg:col-span-1">
               <Card className="sticky top-20"> {/* Make summary card sticky */}
                 <CardHeader>
                     <CardTitle>Order Summary</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                     {/* Delivery Location Section */}
                     <div className="space-y-2">
                         <Label htmlFor="delivery-location" className="flex items-center gap-1">
                             <MapPin className="h-4 w-4" /> Delivery Location *
                         </Label>
                         <div className="flex gap-2 items-center">
                             <Input
                                id="delivery-location"
                                placeholder="e.g., Block B, Room 301"
                                value={locationInput}
                                onChange={(e) => setLocationInput(e.target.value)}
                                disabled={!!paymentCompletedAt || isLocating} // Disable after payment or while locating
                             />
                             <Button
                                 variant="outline"
                                 size="icon"
                                 onClick={handleGetCurrentLocation}
                                 disabled={!!paymentCompletedAt || isLocating}
                                 title="Get Current Location"
                                 className="shrink-0"
                             >
                                 {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
                             </Button>
                         </div>
                         <Button
                             size="sm"
                             onClick={handleSaveLocation}
                             disabled={!!paymentCompletedAt || !locationInput.trim()}
                             className="w-full"
                         >
                             {deliveryLocation ? 'Update Location' : 'Set Location'}
                         </Button>
                         {!deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                             <p className="text-xs text-destructive">Please set a delivery location to proceed.</p>
                         )}
                     </div>

                 {deliveryLocation && (
                     <Alert variant="default" className="bg-blue-50 border-blue-300 text-blue-800">
                         <Info className="h-4 w-4 text-blue-600" />
                         <AlertDescription>
                             Delivering To: <span className="font-semibold">{deliveryLocation}</span>
                         </AlertDescription>
                     </Alert>
                 )}

                 {/* Price Summary */}
                    <div className="space-y-1 border-t pt-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal ({totalItems} items)</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        {/* Estimated Delivery Time */}
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="h-4 w-4" /> Est. Delivery Time
                            </span>
                            <span className="font-medium">~ {estimatedTime} minutes</span>
                        </div>
                         {/* Total */}
                         <div className="flex justify-between font-bold text-lg pt-2 border-t">
                             <span>Total</span>
                             <span>₹{totalPrice.toFixed(2)}</span>
                         </div>
                    </div>


                  {/* === Payment / QR Code Section === */}
                  {/* Show this section ONLY if location is set, cart has items, and payment is NOT completed */}
                  {deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                       <div className="border-t pt-4 space-y-3 text-center">
                           {isGeneratingQR && (
                               <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                   <Loader2 className="h-5 w-5 animate-spin" />
                                   <span>Generating QR Code...</span>
                               </div>
                           )}
                           {/* Display QR Code Image */}
                           {!isGeneratingQR && upiQRCode && ( // Ensure QR code exists and not loading
                               <div className="flex flex-col items-center gap-2">
                                   <p className="font-semibold text-center">Scan with your UPI App to Pay</p>
                                   <Image
                                       src={upiQRCode}
                                       alt="UPI Payment QR Code"
                                       width={200}
                                       height={200}
                                       className="rounded-md border shadow-sm"
                                    />
                                    {/* Simulate Scan Button */}
                                    <Button
                                        onClick={handleSimulatePayment}
                                        disabled={isScanning || !upiQRCode} // Disable if already scanning or no QR
                                        className="mt-2 w-full"
                                    >
                                        {isScanning ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <QrCode className="mr-2 h-4 w-4" /> Simulate UPI Payment
                                            </>
                                        )}
                                    </Button>
                                   <p className="text-xs text-muted-foreground mt-1">(Payment will be simulated)</p>
                               </div>
                           )}
                           {/* Error/Info Messages for QR */}
                           {!isGeneratingQR && !upiQRCode && totalPrice > 0 && (
                                <p className="text-sm text-destructive">Could not generate QR code. Ensure location is set.</p>
                           )}
                           {totalPrice <= 0 && (
                                <p className="text-sm text-muted-foreground">Cart total is zero.</p>
                           )}
                       </div>
                  )}

                  {/* Prompt to set location if needed (and payment not done) */}
                  {!deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                       <Alert variant="destructive">
                           <MapPin className="h-4 w-4" />
                           <AlertTitle>Set Delivery Location</AlertTitle>
                           <AlertDescription>
                              Please enter and save your delivery location above to generate the payment QR code.
                           </AlertDescription>
                       </Alert>
                  )}


                 {/* === Order Confirmation & Cancellation Section (Shown AFTER payment is simulated) === */}
                {paymentCompletedAt && cartItems.length > 0 && ( // Ensure items exist before showing this
                  <div className="border-t pt-4 space-y-4">
                     {/* Processing message before cancellation expiry */}
                     {!cancellationExpired && (
                         <Alert variant="default" className="bg-yellow-50 border-yellow-300 text-yellow-800">
                           <Clock className="h-4 w-4 text-yellow-600" />
                           <AlertTitle>Order Processing</AlertTitle>
                           <AlertDescription>
                             Your order is processing. Preparing for delivery to {deliveryLocation || 'your location'}.
                           </AlertDescription>
                         </Alert>
                     )}

                     {/* Cancellation Button and Timer */}
                     {canCancel && (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">Need to cancel? You have <span className="font-bold text-destructive">{formatTime(timeLeft)}</span> left.</p>
                            <Button
                                variant="destructive"
                                onClick={handleCancelOrder}
                                className="w-full"
                                disabled={!canCancel} // Extra safety check
                            >
                               <Ban className="mr-2 h-4 w-4" /> Cancel Order (No Refund)
                            </Button>
                        </div>
                     )}

                      {/* Cancellation Expired Message */}
                      {cancellationExpired && (
                         <Alert variant="destructive">
                           <Ban className="h-4 w-4" />
                           <AlertTitle>Cancellation Window Closed</AlertTitle>
                           <AlertDescription>
                                You can no longer cancel this order. It is being prepared.
                           </AlertDescription>
                         </Alert>
                      )}

                      {/* Refund Policy Info */}
                      <Alert variant="default" className="mt-4">
                         <Info className="h-4 w-4" />
                         <AlertTitle>Refund Policy</AlertTitle>
                         <AlertDescription>
                           Orders can be cancelled within {CANCELLATION_WINDOW_MINUTES} minutes of payment for convenience only.
                           <strong className="block mt-1 text-destructive">No refund will be issued for cancelled orders.</strong>
                        </AlertDescription>
                     </Alert>
                  </div>
                )}

              </CardContent>
              </Card>
            </div>
          </div>
        )}
    </div>
  );
}

export default CartPage;

