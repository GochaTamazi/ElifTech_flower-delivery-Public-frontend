import React from 'react';

import { CartItem as CartItemType, OrderForm as OrderFormType } from '../../types';
import './Cart.css';
import CartItem from './CartItem';
import OrderFormComponent from './OrderForm';
import { apiConfig } from '../../config';

interface CartProps {
    cartItems: CartItemType[];
    orderForm: OrderFormType;
    selectedShop: number;
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemoveFromCart: (id: number) => void;
    onOrderFormChange: (field: keyof OrderFormType, value: string) => void;
    onOrderSuccess: (orderId: string) => void;
}

const Cart: React.FC<CartProps> = ({
    cartItems,
    orderForm,
    selectedShop,
    onUpdateQuantity,
    onRemoveFromCart,
    onOrderFormChange,
    onOrderSuccess
}) => {
    const getTotalPrice = () => {
        return cartItems.reduce(
            (total, item) => total + (item.Price * item.quantity),
            0
        ).toFixed(2);
    };

    // Check if all required form fields are filled
    const isFormValid = () => {
        return (
            orderForm.name.trim() !== '' &&
            orderForm.email.trim() !== '' &&
            orderForm.phone.trim() !== '' &&
            orderForm.address.trim() !== '' &&
            cartItems.length > 0
        );
    };

    const isSubmitDisabled = !isFormValid();

    const handleSubmitOrder = async () => {
        if (isSubmitDisabled) return;

        try {
            // Prepare the order data in the required JSON format
            const totalPrice = cartItems.reduce((sum, item) => sum + (item.Price * item.quantity), 0);
            
            const orderData = {
                Name: orderForm.name,
                Email: orderForm.email,
                Phone: orderForm.phone,
                DeliveryAddress: orderForm.address,
                DeliveryDateTime: orderForm.DeliveryDateTime,
                DeliveryLatitude: 50.4501, // Default coordinates for Kiev
                DeliveryLongitude: 30.5234, // Default coordinates for Kiev
                ShopId: selectedShop,
                TotalPrice: totalPrice,
                UserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                CouponCode: '', // You can add coupon functionality later
                OrderItems: cartItems.map(item => ({
                    FlowerId: item.Id,
                    Quantity: item.quantity
                }))
            };

            console.log('Sending order data:', orderData);
            
            // Sending order to backend
            console.log('Sending order to endpoint:', '/orders');
            console.log('Order data:', JSON.stringify(orderData, null, 2));
            
            // Log delivery date for debugging
            if (orderForm.DeliveryDateTime) {
                const deliveryDate = new Date(orderForm.DeliveryDateTime);
                console.log('Formatted delivery date:', deliveryDate.toLocaleString('en-US'));
                console.log('Date in ISO format:', deliveryDate.toISOString());
                console.log('Timezone offset (minutes):', deliveryDate.getTimezoneOffset());
            }
            
            let response;
            try {
                response = await fetch(`${apiConfig.baseURL}/orders/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });
                
                console.log('Response status:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Server responded with error:', errorText);
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                const result = await response.json();
                console.log('Order submitted successfully. Full response:', JSON.stringify(result, null, 2));
                
                if (!result) {
                    throw new Error('Empty response from server');
                }
                
                // Assume the server returns an order with an 'id' or 'Id' field
                const orderId = result.id || result.Id || 
                              (result.order && (result.order.id || result.order.Id)) ||
                              (result.data && (result.data.id || result.data.Id));
                
                if (orderId) {
                    console.log('Order ID found in response:', orderId);
                    // Show success message and pass the order ID to the parent component
                    onOrderSuccess(String(orderId));
                } else {
                    // If we can't find the order ID, try to extract it from the Location header
                    const locationHeader = response.headers.get('Location');
                    if (locationHeader) {
                        const match = locationHeader.match(/\/(\d+)$/);
                        if (match && match[1]) {
                            console.log('Extracted order ID from Location header:', match[1]);
                            onOrderSuccess(match[1]);
                            return;
                        }
                    }
                    
                    console.error('No order ID found in response. Full response:', result);
                    console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
                    throw new Error('Order was submitted but no order ID was returned from the server');
                }
                
            } catch (error) {
                console.error('Error in order submission:', error);
                throw error; // Re-throw to be caught by the outer try-catch
            }
            
        } catch (error) {
            console.error('Error submitting order:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            alert(`Failed to submit order: ${errorMessage}`);
        }
    };

    return (
        <div className="cart-page">
            <div className="cart-container">
                <OrderFormComponent
                    formData={orderForm}
                    onChange={onOrderFormChange}
                    onSubmit={handleSubmitOrder}
                    isSubmitDisabled={isSubmitDisabled}
                />

                
                <div className="cart-items">
                    <h2>Your Order</h2>
                    {cartItems.length > 0 ? (
                        <>
                            <div className="cart-items-list">
                                {cartItems.map(item => (
                                    <CartItem
                                        key={item.Id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemove={onRemoveFromCart}/>
                                ))}
                            </div>
                            <div className="cart-actions">
                                <div className="cart-total">
                                    <h3>Total Price: ${getTotalPrice()}</h3>
                                </div>
                                <button
                                    className="submit-order-btn"
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitDisabled}
                                    title={isSubmitDisabled ? 'Please fill in all required fields' : 'Submit order'}
                                >
                                    Submit Order
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="empty-cart">Your cart is empty</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Cart;
