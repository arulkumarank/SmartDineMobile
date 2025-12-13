import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Food } from '../types';

interface CartItem extends Food {
    quantity: number;
    cartId: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (food: Food) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getTax: () => number;
    getTotal: () => number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (food: Food) => {
        const existingItem = items.find(
            item => item.name === food.name && item.restaurant === food.restaurant
        );

        if (existingItem) {
            setItems(prev =>
                prev.map(item =>
                    item.cartId === existingItem.cartId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            const cartId = `${food.name}-${food.restaurant}-${Date.now()}`;
            setItems(prev => [...prev, { ...food, quantity: 1, cartId }]);
        }
    };

    const removeFromCart = (cartId: string) => {
        setItems(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartId);
        } else {
            setItems(prev =>
                prev.map(item =>
                    item.cartId === cartId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = () => {
        setItems([]);
    };

    const getSubtotal = () => {
        return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
    };

    const getTax = () => {
        return Math.round(getSubtotal() * 0.05); // 5% tax
    };

    const getTotal = () => {
        return getSubtotal() + getTax();
    };

    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getSubtotal,
                getTax,
                getTotal,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
