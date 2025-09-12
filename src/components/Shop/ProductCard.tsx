import React, {useState, useEffect} from 'react';
import {Flower} from '../../types';
import './ProductCard.css';
import {useSession} from '../../hooks/useSession';
import {apiConfig} from '../../config';

interface ProductCardProps {
    flower: Flower;
    onAddToCart: (flower: Flower) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({flower, onAddToCart}) => {
    const [isFavorite, setIsFavorite] = useState(flower.IsFavorite === 1);
    const [isLoading, setIsLoading] = useState(false);
    const {userId} = useSession();

    // Update local state if props change
    useEffect(() => {
        setIsFavorite(flower.IsFavorite === 1);
    }, [flower.IsFavorite]);

    // Function to handle adding to favorites
    const handleAddToFavorites = async (flowerId: number) => {
        if (!userId) {
            alert('Please log in to add to favorites');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${apiConfig.baseURL}/favorites/${flowerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to add to favorites');
            }

            setIsFavorite(true);
        } catch (error) {
            console.error('Error adding to favorites:', error);
            setIsFavorite(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to handle removing from favorites
    const handleRemoveFromFavorites = async (favoriteId: number) => {
        if (!userId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${apiConfig.baseURL}/favorites/${favoriteId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to remove from favorites');
            }

            setIsFavorite(false);
        } catch (error) {
            console.error('Error removing from favorites:', error);
            setIsFavorite(true);
        } finally {
            setIsLoading(false);
        }
    };

    // Favorite button click handler
    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isLoading) return;

        const newFavoriteState = !isFavorite;

        if (newFavoriteState) {
            handleAddToFavorites(flower.Id);
        } else {
            handleRemoveFromFavorites(flower.Id);
        }
    };
    return (
        <div className="product-card" title={flower.Description}>
            <div className="flower-image">
                <img
                    src={`/images/${flower.ImageUrl}`}
                    alt={flower.Name}
                />
                <button
                    className={`favorite-btn ${isFavorite ? 'favorite-active' : ''}`}
                    onClick={handleFavoriteClick}
                    disabled={isLoading}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    {isLoading ? '...' : '❤'}
                </button>
            </div>


            <div className="cart-item-name-container">
                <h3 className="cart-item-name">{flower.Name}</h3>
                {flower.Description && (
                    <div className="tooltip">
                        <span className="tooltip-icon">i</span>
                        <span className="tooltip-text">{flower.Description}</span>
                    </div>
                )}

                <div>{}</div>
            </div>


            <p>${flower.Price}</p>
            <div className="product-card-footer">
                <button
                    className="add-to-cart"
                    onClick={() => onAddToCart(flower)}
                >
                    Add to Cart
                </button>
                <div className="date-added">
                    {new Date(flower.DateAdded).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
