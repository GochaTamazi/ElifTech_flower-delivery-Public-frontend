import React from 'react';
import { Shop as ShopType } from '../../types';

interface ShopListProps {
    shops: ShopType[];
    selectedShop: number;
    onSelectShop: (id: number) => void;
}

const ShopList: React.FC<ShopListProps> = ({ shops, selectedShop, onSelectShop }) => {
    return (
        <div className="shop-list">
            {shops.map(shop => (
                <button
                    key={shop.Id}
                    className={`shop-btn ${selectedShop === shop.Id ? 'active' : ''}`}
                    onClick={() => onSelectShop(shop.Id)}
                >
                    {shop.Name}
                </button>
            ))}
        </div>
    );
};

export default ShopList;
