import React from 'react';
import { Shop as ShopType, Flower } from '../../types';
import ShopList from './ShopList';
import ProductList from './ProductList';
import './Shop.css';

interface ShopProps {
    shops: ShopType[];
    selectedShop: number;
    flowers: Flower[];
    isLoading: boolean;
    sortBy: 'price' | 'date' | null;
    sortOrder: 'asc' | 'desc';
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onSelectShop: (id: number) => void;
    onAddToCart: (flower: Flower) => void;
}

const Shop: React.FC<ShopProps> = ({
    shops,
    selectedShop,
    flowers,
    isLoading,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    onPageChange,
    onSelectShop,
    onAddToCart
}) => {
    return (
        <div className="main-content">
            <aside className="sidebar">
                <h3>Shops:</h3>
                <ShopList 
                    shops={shops}
                    selectedShop={selectedShop}
                    onSelectShop={onSelectShop}
                />
            </aside>

            <main>
                <ProductList 
                    flowers={flowers}
                    isLoading={isLoading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    onAddToCart={onAddToCart}
                />
            </main>
        </div>
    );
};

export default Shop;
