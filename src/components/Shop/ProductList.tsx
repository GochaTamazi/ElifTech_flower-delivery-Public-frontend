import React, { useState, useMemo } from 'react';
import { Flower } from '../../types';
import ProductCard from './ProductCard';
import styles from './ProductList.module.css';

interface ProductListProps {
    flowers: Flower[];
    isLoading: boolean;
    sortBy: 'price' | 'date' | null;
    sortOrder: 'asc' | 'desc';
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onAddToCart: (flower: Flower) => void;
}

const ProductList: React.FC<ProductListProps> = ({ 
    flowers, 
    isLoading, 
    sortBy, 
    sortOrder, 
    currentPage,
    totalPages,
    onPageChange,
    onAddToCart 
}) => {
    const sortedFlowers = useMemo(() => {
        const flowersToSort = [...flowers];
        
        if (!sortBy) return flowersToSort;
        
        return flowersToSort.sort((a, b) => {
            let comparison = 0;
            
            switch (sortBy) {
                case 'price':
                    comparison = a.Price - b.Price;
                    break;
                case 'date':
                    comparison = new Date(a.DateAdded).getTime() - new Date(b.DateAdded).getTime();
                    break;
            }
            
            return sortOrder === 'asc' ? comparison : -comparison;
        });
    }, [flowers, sortBy, sortOrder]);

    if (isLoading) {
        return <div className={styles.loading}>Loading flowers...</div>;
    }

    if (flowers.length === 0) {
        return <div className={styles.noFlowers}>No flowers available in this shop</div>;
    }

    return (
        <div className={styles.container}>

            <div className={styles.productsGrid}>
                {sortedFlowers.map((flower: Flower) => (
                    <ProductCard 
                        key={flower.Id} 
                        flower={flower} 
                        onAddToCart={onAddToCart} 
                    />
                ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button 
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                    >
                        Previous
                    </button>
                    
                    <div className={styles.pageNumbers}>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={`${styles.pageButton} ${currentPage === pageNum ? styles.activePage : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <span className={styles.ellipsis}>...</span>
                        )}
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className={`${styles.pageButton} ${currentPage === totalPages ? styles.activePage : ''}`}
                            >
                                {totalPages}
                            </button>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.pageButton}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductList;
