import React, {useState, useEffect} from 'react';
import './OrderDetails.css';
import backIcon from '../../assets/back-arrow.svg'; // Make sure to add a back arrow icon
import {apiConfig} from '../../config';

interface OrderItem {
    Id: number;
    OrderId: string;
    FlowerId: number;
    Quantity: number;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
}

interface ShopInfo {
    Id: number;
    Name: string;
    Address: string;
    Latitude: number;
    Longitude: number;
}

interface OrderDetailsType {
    Id: string;
    Name: string;
    Email: string;
    Phone: string;
    DeliveryAddress: string;
    DeliveryLatitude: number;
    DeliveryLongitude: number;
    ShopId: number;
    CouponCode: string | null;
    TotalPrice: number;
    CreatedAt: string;
    DeliveryDateTime: string;
    UserTimezone: string;
    items: OrderItem[];
    shop: ShopInfo;
}

interface ApiResponse {
    success: boolean;
    data: OrderDetailsType;
}

interface OrderDetailsProps {
    orderId: string;
    onBackToShop: () => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({orderId, onBackToShop}) => {
    // Reset scroll when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [order, setOrder] = useState<OrderDetailsType | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                setError('No order ID provided');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // Fetch order details from the API
                const response = await fetch(`${apiConfig.baseURL}/orders/${orderId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                }

                const responseData: ApiResponse = await response.json();

                if (responseData.success && responseData.data) {
                    // The API returns items in the 'items' property, so we don't need to transform it
                    setOrder(responseData.data);
                } else {
                    setError('No order data received');
                }
            } catch (err) {
                console.error('Error fetching order details:', err);
                setError('Failed to load order details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            console.error('Error formatting date:', e);
            return dateString;
        }
    };

    const handleBack = () => {
        window.scrollTo(0, 0); // Reset scroll before navigation
        onBackToShop();
    };

    if (isLoading) {
        return (
            <div className="order-details-container">
                <div className="order-loading">Loading order details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-details-container">
                <div className="order-error">
                    <p>Unable to load order details.</p>
                    <button className="back-to-shop" onClick={handleBack}>
                        <img src={backIcon} alt="Back"/> Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="order-details">
            <div className="order-header">
                <h1>Order Details</h1>
                <p className="order-number">Order #{order.Id.substring(0, 8).toUpperCase()}</p>
            </div>

            <div className="order-items">
                <h2>Your Order</h2>
                <div className="items-list">
                    {order.items && order.items.length > 0 ? (
                        order.items.map((item) => (
                            <div key={item.Id} className="order-item">
                                <div className="item-image">
                                    <div className="image-placeholder">
                                        <img
                                            src={`/images/${item.imageUrl}`}
                                            alt={item.name}
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                const placeholder = target.parentElement;
                                                if (placeholder) {
                                                    const emoji = document.createElement('span');
                                                    emoji.textContent = '🌹';
                                                    placeholder.appendChild(emoji);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="item-details">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-description">{item.description}</div>
                                </div>
                                <div className="item-quantity">x{item.Quantity}</div>
                                <div className="item-price">${item.price.toFixed(2)}</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-items">No items in this order</div>
                    )}
                </div>

                <div className="order-total">
                    <span>Total:</span>
                    <span className="total-amount">${order.TotalPrice.toFixed(2)}</span>
                </div>
            </div>

            <div className="order-info">
                <div className="info-section">
                    <h3>Contact Information</h3>
                    <p><strong>Full Name:</strong> {order.Name}</p>
                    <p><strong>Email:</strong> {order.Email}</p>
                    <p><strong>Phone:</strong> {order.Phone}</p>
                </div>

                <div className="info-section">
                    <h3>Delivery Address</h3>
                    <p>{order.DeliveryAddress}</p>
                    {order.DeliveryLatitude && order.DeliveryLongitude && (
                        <p className="coordinates">
                            (Coordinates: {order.DeliveryLatitude.toFixed(6)}, {order.DeliveryLongitude.toFixed(6)})
                        </p>
                    )}
                </div>

                <div className="info-section">
                    <h3>Shop Information</h3>
                    <p><strong>Name:</strong> {order.shop?.Name || 'N/A'}</p>
                    <p><strong>Address:</strong> {order.shop?.Address || 'N/A'}</p>
                    {order.shop?.Latitude && order.shop?.Longitude && (
                        <p className="coordinates">
                            (Coordinates: {order.shop.Latitude.toFixed(6)}, {order.shop.Longitude.toFixed(6)})
                        </p>
                    )}
                </div>

                <div className="info-section">
                    <h3>Order Details</h3>
                    <p><strong>Order Date:</strong> {formatDate(order.CreatedAt)}</p>
                    <p><strong>Delivery Date Time:</strong> {formatDate(order.DeliveryDateTime)}</p>
                    <p><strong>Time Zone:</strong> {order.UserTimezone || 'N/A'}</p>
                    {order.CouponCode && (
                        <p><strong>Coupon Used:</strong> {order.CouponCode}</p>
                    )}
                </div>
            </div>

            <button className="back-to-shop" onClick={handleBack}>
                <img src={backIcon} alt="Back"/> Back to Shop
            </button>
        </div>
    );
};

export default OrderDetails;
