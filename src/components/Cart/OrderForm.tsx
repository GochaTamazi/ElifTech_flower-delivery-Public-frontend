import React, { useState, useEffect } from 'react';
import { OrderForm as OrderFormType } from '../../types';
import './OrderForm.css';

// Check if react-datepicker is available
let DatePicker: any = null;
try {
    // @ts-ignore
    DatePicker = require('react-datepicker');
    require('react-datepicker/dist/react-datepicker.css');
} catch (e) {
    console.warn('react-datepicker not available, using fallback inputs');
}

interface OrderFormProps {
    formData: OrderFormType;
    onChange: (field: keyof OrderFormType, value: string) => void;
    onSubmit: () => void;
    isSubmitDisabled: boolean;
}

const OrderForm: React.FC<OrderFormProps> = ({
    formData,
    onChange,
    onSubmit,
    isSubmitDisabled
}) => {
    const [localDate, setLocalDate] = useState<Date | null>(() => {
        try {
            // Try to parse the existing date or use the current date + 1 day at 12:00 PM
            const date = formData.DeliveryDateTime ? new Date(formData.DeliveryDateTime) : new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(12, 0, 0, 0);
            return date;
        } catch (e) {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            date.setHours(12, 0, 0, 0);
            return date;
        }
    });

    // Update form data when local date changes
    useEffect(() => {
        if (localDate) {
            // Convert to ISO string with timezone offset
            const timezoneOffset = localDate.getTimezoneOffset();
            const timezoneOffsetHours = Math.abs(Math.floor(timezoneOffset / 60));
            const timezoneOffsetSign = timezoneOffset <= 0 ? '+' : '-';
            const timezoneString = `${timezoneOffsetSign}${String(timezoneOffsetHours).padStart(2, '0')}:00`;
            
            const dateTimeString = localDate.toISOString().replace('Z', timezoneString);
            onChange('DeliveryDateTime', dateTimeString);
        }
    }, [localDate]);

    const handleDateChange = (date: Date | null) => {
        if (!date) return;
        
        // If we have a previous date, preserve the time
        if (localDate) {
            date.setHours(
                localDate.getHours(),
                localDate.getMinutes(),
                0,
                0
            );
        }
        
        setLocalDate(date);
    };

    const handleTimeChange = (time: Date) => {
        if (!localDate) return;
        
        const newDate = new Date(localDate);
        newDate.setHours(
            time.getHours(),
            time.getMinutes(),
            0,
            0
        );
        
        setLocalDate(newDate);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSubmitDisabled && localDate) {
            onSubmit();
        }
    };

    return (
        <div className="order-form-container">
            <form className="order-form" onSubmit={handleSubmit}>
                <h2>Order Details</h2>
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input 
                        id="name"
                        type="text" 
                        value={formData.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        required 
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input 
                        id="email"
                        type="email" 
                        value={formData.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        required
                        placeholder="your.email@example.com"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone:</label>
                    <input 
                        id="phone"
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => onChange('phone', e.target.value)}
                        required
                        placeholder="+1 (___) ___-____"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Delivery Address:</label>
                    <textarea 
                        id="address"
                        value={formData.address}
                        onChange={(e) => onChange('address', e.target.value)}
                        required
                        placeholder="Enter full delivery address"
                    />
                </div>
                
                <div className="form-group">
                    <label>Delivery Date and Time:</label>
                    {DatePicker ? (
                        <div className="datetime-picker">
                            <DatePicker
                                selected={localDate}
                                onChange={handleDateChange}
                                minDate={new Date()}
                                dateFormat="dd/MM/yyyy"
                                className="date-input"
                                required
                            />
                            <DatePicker
                                selected={localDate}
                                onChange={handleTimeChange}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={30}
                                timeCaption="Time"
                                dateFormat="HH:mm"
                                className="time-input"
                                minTime={new Date().setHours(9, 0, 0, 0)}
                                maxTime={new Date().setHours(21, 0, 0, 0)}
                            />
                        </div>
                    ) : (
                        <input
                            type="datetime-local"
                            required
                            min={new Date().toISOString().slice(0, 16)}
                            onChange={(e) => {
                                if (e.target.value) {
                                    const date = new Date(e.target.value);
                                    setLocalDate(date);
                                }
                            }}
                            value={localDate ? localDate.toISOString().slice(0, 16) : ''}
                            className="datetime-input"
                        />
                    )}
                    {localDate && (
                        <div className="timezone-info">
                            Your local time: {localDate.toLocaleString('en-US')}
                        </div>
                    )}
                </div>

            </form>
        </div>
    );
};

export default OrderForm;
