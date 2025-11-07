// src/api/PaymentApi.js

import { API_ENDPOINTS, combineHeaders } from './config';
import axios from 'axios';

/**
 * Create a Razorpay order for membership payment
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Order details including razorpay_key, amount, currency, order_id
 */
// export const createRazorpayOrder = async (userId) => {
//   try {
//     const response = await axios.post(API_ENDPOINTS.PAYMENT.CREATE_RAZORPAY_ORDER, {
//       user_id: userId
//     }, {
//       headers: combineHeaders()
//     });
    
//     return response.data;
//   } catch (error) {
//     throw error.response?.data || error;
//   }
// };
export const createRazorpayOrder = async (userId) => {
  try {
    // console.log('Creating Razorpay order for user ID:', userId);
    
    const response = await axios.post(API_ENDPOINTS.PAYMENT.CREATE_RAZORPAY_ORDER, {
      user_id: userId
    }, {
      headers: combineHeaders()
    });
    
    // console.log('Razorpay order created:', response.data);
    
    // Ensure user_id is included in the response
    return {
      ...response.data,
      user_id: userId  // Explicitly include the user ID in the response
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error.response?.data || error;
  }
};
/**
 * Verify Razorpay payment after completion
 * @param {Object} paymentResponse - Response from Razorpay callback
 * @param {string} paymentResponse.razorpay_payment_id - Payment ID
 * @param {string} paymentResponse.razorpay_order_id - Order ID
 * @param {string} paymentResponse.razorpay_signature - Payment signature
 * @returns {Promise<Object>} - Verification result
 */
export const verifyPayment = async (paymentResponse) => {
  // console.log('Verifying payment with data:', paymentResponse);
  
  // Validate required fields
  if (!paymentResponse?.razorpay_payment_id || 
      !paymentResponse?.razorpay_order_id || 
      !paymentResponse?.razorpay_signature) {
    console.error('Missing required fields:', paymentResponse);
    throw new Error('Missing required payment verification fields');
  }

  try {
    // console.log('Sending verification request to:', API_ENDPOINTS.PAYMENT.VERIFY_PAYMENT);
    
    const response = await axios.post(
      API_ENDPOINTS.PAYMENT.VERIFY_PAYMENT, 
      paymentResponse, 
      {
        headers: {
          ...combineHeaders(),
          'Content-Type': 'application/json',
        },
        timeout: 30000
      }
    );
    
    // console.log('Verification response:', response.data);
    
    // Make sure to include user_id in the response if it was in the request
    if (paymentResponse.user_id && !response.data.user_id) {
      response.data.user_id = paymentResponse.user_id;
    }
    
    return response.data;
  } catch (error) {
    console.error('Verification error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      throw error.response.data;
    }
    throw error;
  }
};



// /**
//  * Initiate Razorpay checkout
//  * @param {Object} orderData - Order details from createRazorpayOrder
//  * @param {Object} userInfo - User information for pre-filling checkout
//  * @param {Function} onSuccess - Callback function on successful payment
//  * @param {Function} onError - Callback function on payment failure
//  */
// export const initiateRazorpayCheckout = (orderData, userInfo, onSuccess, onError) => {
//   // console.log('Initiating Razorpay checkout with order data:', orderData);
  
//   const options = {
//     key: orderData.razorpay_key,
//     amount: orderData.amount.toString(),
//     currency: orderData.currency,
//     name: 'Kerala Engineers Association',
//     description: 'Membership Fee',
//     order_id: orderData.order_id,
//     handler: async function (response) {
//       // Include user_id and order_id in the response for verification
//       const paymentData = {
//         ...response,
//         user_id: orderData.user_id, // Important: Pass user_id to verification
//         order_id: orderData.order_id
//       };
//       // console.log('Payment successful, data for verification:', paymentData);
//       if (onSuccess) onSuccess(paymentData);
//     },
//     prefill: {
//       name: userInfo.fullName,
//       email: userInfo.email,
//       contact: userInfo.contactNo
//     },
//     notes: {
//       user_id: orderData.user_id // Include user_id in notes for backend access
//     },
//     theme: {
//       color: '#267540' // KEA green color
//     }
//   };

//   try {
//     const rzp = new window.Razorpay(options);
//     rzp.open();
  
//     rzp.on('payment.failed', function (resp) {
//       console.error('Payment failed:', resp.error);
//       if (onError) onError(resp.error.description);
//     });
    
//     return rzp;
//   } catch (error) {
//     console.error("Razorpay initialization error:", error);
//     if (onError) onError("Could not initialize payment gateway");
//     return null;
//   }
// };

/**
 * Initiate Razorpay checkout (Vite-compatible)
 * Ensures Razorpay SDK is loaded before creating instance
 *
 * @param {Object} orderData - Object containing razorpay_key, amount, currency, order_id, user_id
 * @param {Object} userInfo - Object containing fullName, email, contactNo
 * @param {Function} onSuccess - Callback when payment succeeds
 * @param {Function} onError - Callback when payment fails
 */
export const initiateRazorpayCheckout = async (orderData, userInfo, onSuccess, onError) => {
  // Helper to dynamically load the Razorpay script if not already loaded
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true); // Already loaded
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => reject("Failed to load Razorpay SDK");
      document.body.appendChild(script);
    });
  };

  try {
    // Ensure Razorpay SDK is available
    await loadRazorpayScript();

    // Build Razorpay options
    const options = {
      key: orderData.razorpay_key,
      amount: orderData.amount.toString(),
      currency: orderData.currency,
      name: "Kerala Engineers Association",
      description: "Membership Fee",
      order_id: orderData.order_id,
      handler: async function (response) {
        // Append user_id and order_id for backend verification
        const paymentData = {
          ...response,
          user_id: orderData.user_id,
          order_id: orderData.order_id,
        };
        if (onSuccess) onSuccess(paymentData);
      },
      prefill: {
        name: userInfo.fullName || "",
        email: userInfo.email || "",
        contact: userInfo.contactNo || "",
      },
      notes: {
        user_id: orderData.user_id,
      },
      theme: {
        color: "#267540",
      },
    };

    // Initialize Razorpay checkout
    const rzp = new window.Razorpay(options);

    // Handle payment failure
    rzp.on("payment.failed", function (resp) {
      console.error("Payment failed:", resp.error);
      if (onError) onError(resp.error.description);
    });

    // Open Razorpay payment window
    rzp.open();

    return rzp;
  } catch (error) {
    console.error("Razorpay initialization error:", error);
    if (onError) onError("Could not initialize payment gateway");
    return null;
  }
};




/**
 * Create a Razorpay order for membership payment
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Order details
 */
export const createMembershipOrder = async (userId) => {
  try {
    const response = await fetch(API_ENDPOINTS.PAYMENT.CREATE_RAZORPAY_ORDER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
};
/**
 * Initialize Razorpay payment window
 * @param {Object} orderData - Order data from createMembershipOrder
 * @param {Object} options - Additional options
 * @returns {Object} - Razorpay instance
 */
export const initializeRazorpay = (orderData, options = {}) => {
  const defaultOptions = {
    key: orderData.razorpay_key,
    amount: orderData.amount.toString(),
    currency: orderData.currency,
    name: 'KEA Membership',
    description: 'Annual Subscription',
    order_id: orderData.order_id,
    theme: { color: '#267540' }
  };

  const rzpOptions = { ...defaultOptions, ...options };
  console.log('Initializing Razorpay with options:', rzpOptions);
  try {
    const rzp = new window.Razorpay(rzpOptions);
    return rzp;
  } catch (error) {
    console.error('Error initializing Razorpay:', error);
    throw new Error('Failed to initialize payment gateway');
  }
};

export default {
     createMembershipOrder,
       initializeRazorpay,
  createRazorpayOrder,
  verifyPayment,
  initiateRazorpayCheckout
};