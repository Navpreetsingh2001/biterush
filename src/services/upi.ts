
import axios from 'axios'; // Keep axios for the simulation

/**
 * Represents a QR code for initiating a UPI payment transaction.
 * NOTE: This is a simulation. The URL used is fictional.
 */
export interface UPIQRCode {
  qrCode: string; // This would typically contain UPI deep link data or similar
}

/**
 * Asynchronously generates a simulated UPI QR code data string for a given total price.
 * In a real application, this would interact with a UPI payment gateway API.
 *
 * @param totalPrice The total price for which to generate the QR code data.
 * @returns A promise that resolves to a UPIQRCode object containing the simulated QR code data string.
 */
export async function generateUPIQRCode(
  totalPrice: number
): Promise<UPIQRCode> {
  console.log(`Simulating UPI QR code generation for amount: ${totalPrice}`);
  // Simulate API call latency
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // **Important Simulation Note:**
    // This is NOT a real UPI API endpoint. It simulates fetching QR data.
    // In a real scenario, you'd call your payment provider's API.
    // The response structure ({ qrCode: string }) is assumed for the simulation.
    // const response = await axios.get(
    //   `https://simulated-upi-payment-api.com/create-payment?amount=${totalPrice}&receiver=merchant@upi&refId=${Date.now()}`
    // );
    // return {
    //   qrCode: response.data.qrCode, // Assuming the simulated API returns this structure
    // };

    // --- SIMULATED RESPONSE ---
    // Construct a basic UPI intent string for the QR code data (for simulation)
    // This string format allows many UPI apps to potentially scan and parse it.
    const simulatedUPIData = `upi://pay?pa=merchant-vpa@exampleupi&pn=Biterush%20Campus%20Grub&am=${totalPrice.toFixed(2)}&cu=INR&tn=Order_${Date.now()}`;

    return {
      qrCode: simulatedUPIData,
    };
    // --- END SIMULATED RESPONSE ---

  } catch (error) {
    // Log the actual error if the simulated API call were real
    // console.error("Actual API error during QR code generation:", error);

    // Throw a user-friendly error
    throw new Error(`Failed to generate UPI QR code data (Simulation Error)`);
  }
}
