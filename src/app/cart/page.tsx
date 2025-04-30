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
  const [upiQRCode, setUpiQRCode] = useState(null); // Changed state name
  const [isClient, setIsClient] = useState(false);
  const [paymentCompletedAt, setPaymentCompletedAt] = useState(null);
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
     // Run only if QR code exists and payment hasn't been marked complete yet
     if (!isClient || !upiQRCode || paymentCompletedAt || !isScanning) {
       return;
     }

     console.log("QR Code state updated, simulating payment completion shortly...");

     // Simulate payment completion shortly after QR Code is set, allowing render time
     const paymentTimeout = setTimeout(() => {
       setPaymentCompletedAt(new Date());
       setCanCancel(true); // Enable cancellation window
       setCancellationExpired(false);
       setTimeLeft(CANCELLATION_WINDOW_MINUTES * 60); // Reset timer
       console.log("Payment considered completed at:", new Date());
        toast({
             title: "Payment Processing",
             description: "Payment received (simulated). You have a short window to cancel.",
             variant: "default",
        });
       setIsScanning(false);
     }, 300); // Delay in ms (adjust if needed, e.g., 100-500ms)

     // Cleanup timeout if upiQRCode changes or component unmounts
     return () => clearTimeout(paymentTimeout);

   }, [upiQRCode, isClient, paymentCompletedAt, isScanning, toast]); // Depends on upiQRCode state


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

    const handleScanQRCode = () => {
      setIsScanning(true);
    };


  // Group items by food court
  const groupedCartItems = cartItems.reduce((acc, item) => {
    const courtId = item.foodCourtId;
    if (!acc[courtId]) {
      acc[courtId] = { name: item.foodCourtName, items: [] };
    }
    acc[courtId].items.push(item);
    return acc;
  }, {});

  if (!isClient || authLoading) {
     // Show loading state while checking auth or during SSR
     return (
         
             
                 Loading Cart...
             
         
      );
  }

   // If finished loading and still no user, show message (should be handled by redirect, but as fallback)
   if (!user) {
     return (
       
         
           
              
                 Access Denied
              
           
           
             
                 You need to be logged in to view your cart.
             
             
               Go to Login
             
           
         
       
     );
   }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };


  return (
    
       
            
                Continue Shopping
            
       
    

      
         
             {paymentCompletedAt ? "Order Details" : `Your Order (${totalItems} items)`}
         
      

      {/* Case 1: Cart is empty AND payment was never initiated (or after cancellation) */}
      {cartItems.length === 0 && !paymentCompletedAt ? (
        
          
            Your cart is empty.
             
                Start Ordering
             
          
        
      ) :
      /* Case 2: Cart became empty AFTER payment was simulated (e.g., successful cancellation) */
      cartItems.length === 0 && paymentCompletedAt && !cancellationExpired ? (
         
            
                
                    
                        Order Cancelled
                    
                
           
             
               Your order was successfully cancelled.
              
                 Go to Home
              
           
         
      ) :
       /* Case 3: Cart has items OR order was completed and not cancelled */
       (
        
          
            
              {/* Display Cart Items - only show if items exist */}
              {cartItems.length > 0 && Object.entries(groupedCartItems).map(([foodCourtId, group]) => (
                
                  
                    
                      {group.name}
                    
                  
                  
                    {group.items.map((item) => (
                      
                        
                        {/* Item Image */}
                         
                           {item.imageUrl ? (
                             
                           ) : (
                              
                               
                               
                            
                           )}
                         

                          {/* Item Details */}
                          
                            
                              {item.name}
                            
                            
                              {item.description}
                            
                            
                              ₹{item.price.toFixed(2)}
                            
                          

                          {/* Quantity Controls */}
                          
                            
                              
                                
                              
                              
                                
                                  
                                
                                
                                  
                                
                              
                              
                                
                              
                             
                             
                                
                              
                            
                         

                          {/* Item Total */}
                          
                           ₹{(item.price * item.quantity).toFixed(2)}
                          
                        
                    ))}
                  
                
              ))}

              {/* Clear Cart Button - show only if cart has items and payment not completed */}
              {cartItems.length > 0 && !paymentCompletedAt && (
                
                  
                      
                           Clear Cart
                      
                  
                
              ))}

               {/* Order Placed Message - Show if payment completed and cancellation window expired */}
               {paymentCompletedAt && cancellationExpired && cartItems.length > 0 && (
                 
                     
                         
                             
                                 Order Placed Successfully!
                             
                         
                     
                    
                      Your order payment was successful and is being prepared. Estimated delivery in ~{estimatedTime} minutes.
                      
                       
                          Go to Home
                       
                    
                  
               )}
          

          

            
                
                   
                      
                         Delivery Location *
                      
                      
                        
                            
                            
                            
                              
                            
                        
                        
                            {deliveryLocation ? 'Update Location' : 'Set Location'}
                        
                        
                             Please set a delivery location to proceed.
                        
                     
                 

                 
                     
                        
                           Delivering To
                        
                         {deliveryLocation}
                     
                 

                
                     
                        Subtotal ({totalItems} items)
                        ₹{totalPrice.toFixed(2)}
                     
                      {/* Estimated Delivery Time */}
                      
                         
                            
                               Est. Delivery Time
                            
                            ~ {estimatedTime} minutes
                         
                        
                       
                         
                           Total
                           ₹{totalPrice.toFixed(2)}
                         
                     
                 

                  {/* === Payment / QR Code Section === */}
                  {/* Show this section ONLY if location is set, cart has items, and payment is NOT completed */}
                  {deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                       
                           {isGeneratingQR && (
                               
                                   
                                       
                                           Generating QR Code...
                                       
                                   
                               
                           )}
                           {!isGeneratingQR && upiQRCode && ( // Ensure QR code exists and not loading
                               
                                   
                                        
                                           Scan with your UPI App to Pay
                                        
                                   
                                   
                                       
                                   
                                   
                                       (Payment will be simulated automatically after scanning)
                                   
                               
                           )}
                           
                           
                                Could not generate QR code. Please try again.
                           
                           
                            Cart total is zero.
                           
                       
                  )}

                  {deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                    
                      Simulate UPI Scan
                    
                  )}

                  {/* Prompt to set location if needed (and payment not done) */}
                  {!deliveryLocation && cartItems.length > 0 && !paymentCompletedAt && (
                       
                          
                            Set Delivery Location
                           Please enter and save your delivery location above to generate the payment QR code.
                         
                       
                  )}


                 {/* === Order Confirmation & Cancellation Section (Shown AFTER payment is simulated) === */}
                {paymentCompletedAt && cartItems.length > 0 && ( // Ensure items exist before showing this
                  
                     
                     {!cancellationExpired && ( // Don't show if cancellation expired (means order is placed)
                         
                             
                           
                           
                             Your order is processing. Preparing for delivery to {deliveryLocation || 'your location'}.
                           
                         
                     )}

                     
                        
                            Need to cancel? You have {formatTime(timeLeft)} left.
                            
                              
                               Cancel Order (No Refund)
                            
                        
                     

                      
                        
                           
                           
                                You can no longer cancel this order. It is being prepared.
                           
                         
                      

                      
                         
                           Refund Policy
                           Orders can be cancelled within {CANCELLATION_WINDOW_MINUTES} minutes of payment for convenience only. 
                           
                              No refund will be issued for cancelled orders.
                           
                        
                     
                  
                )}

              
               
               
            
          
        
      )}
    
  );
}

export default CartPage;
