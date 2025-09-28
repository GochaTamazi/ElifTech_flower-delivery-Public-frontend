import React, { useState, useMemo, useEffect } from 'react';
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
    // Принудительно отслеживаем, была ли пагинация показана ранее
    const [hasPagination, setHasPagination] = useState(false);

    useEffect(() => {
        if (totalPages > 1 || currentPage > 1) {
            setHasPagination(true);
        }
    }, [totalPages, currentPage]);

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

    // Отладочная информация - удалите после исправления бага
    console.log('ProductList Debug:', {
        currentPage,
        totalPages,
        flowersLength: flowers.length,
        isLoading,
        hasPagination,
        shouldShowPagination: totalPages > 1 || currentPage > 1 || hasPagination
    });

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading flowers...</div>
                {/* Показываем пагинацию даже во время загрузки, если знаем что она должна быть */}
                {hasPagination && (
                    <div className={styles.pagination}>
                        <button disabled className={styles.pageButton}>Previous</button>
                        <div className={styles.pageNumbers}>
                            <button disabled className={styles.pageButton}>...</button>
                        </div>
                        <button disabled className={styles.pageButton}>Next</button>
                    </div>
                )}
            </div>
        );
    }

    // Показываем сообщение о пустом списке только если нет цветов И никогда не было пагинации
    if (flowers.length === 0 && !hasPagination && totalPages <= 1 && currentPage <= 1) {
        return <div className={styles.noFlowers}>No flowers available in this shop</div>;
    }

    // Определяем, нужно ли показывать пагинацию
    const shouldShowPagination = totalPages > 1 || currentPage > 1 || hasPagination;

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

            {/* Принудительно показываем пагинацию если есть основания полагать, что она нужна */}
            {shouldShowPagination && (
                <div className={styles.pagination} style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', padding: '10px' }}>



                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={styles.pageButton}
                    >
                        Previous
                    </button>

                    <div className={styles.pageNumbers}>
                        {Array.from({ length: Math.min(5, Math.max(totalPages, currentPage)) }, (_, i) => {
                            const maxPages = Math.max(totalPages, currentPage);
                            let pageNum: number;

                            if (maxPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= maxPages - 2) {
                                pageNum = maxPages - 4 + i;
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
                        {Math.max(totalPages, currentPage) > 5 && currentPage < Math.max(totalPages, currentPage) - 2 && (
                            <>
                                <span className={styles.ellipsis}>...</span>
                                <button
                                    onClick={() => onPageChange(Math.max(totalPages, currentPage))}
                                    className={`${styles.pageButton} ${currentPage === Math.max(totalPages, currentPage) ? styles.activePage : ''}`}
                                >
                                    {Math.max(totalPages, currentPage)}
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= Math.max(totalPages, 1)}
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