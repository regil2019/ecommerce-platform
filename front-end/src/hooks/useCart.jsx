import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./useAuth";

const CartContext = createContext();
export function CartProvider({children}) {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    // Load cart items from backend when user logs in
    useEffect(() => {
        if (user && user.id) {
            loadCartFromBackend();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const loadCartFromBackend = async () => {
        if (!user || !user.id) return;

        try {
            setLoading(true);
            const response = await api.get('/cart');
            const backendItems = response.data || [];

            // Transform backend items to match frontend format
            const transformedItems = backendItems.map(item => ({
                id: item.productId,
                name: item.Product?.name,
                price: item.Product?.price,
                image: item.Product?.images?.[0],
                images: item.Product?.images,
                description: item.Product?.description,
                quantity: item.quantity,
                cartId: item.id // Store cart item ID for updates
            }));

            setCartItems(transformedItems);
        } catch (error) {
            console.error('Error loading cart from backend:', error);
            // Don't show error to user, just keep empty cart
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (product) => {
        if (!user || !user.id) {
            // Fallback: add to local state if not logged in
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === product.id);
                if(existingItem) {
                    return prevItems.map(item => item.id === product.id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                    )
                }
                return [...prevItems, {...product, quantity: 1}];
            });
            return;
        }

        try {
            // Try to add to backend
            const response = await api.post('/cart', {
                productId: product.id,
                quantity: 1
            });

            // Reload cart to get updated items
            await loadCartFromBackend();
        } catch (error) {
            console.error('Error adding to cart:', error);
            // Fallback to local state
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.id === product.id);
                if(existingItem) {
                    return prevItems.map(item => item.id === product.id
                        ? {...item, quantity: item.quantity + 1}
                        : item
                    )
                }
                return [...prevItems, {...product, quantity: 1}];
            });
        }
    };

    const removeFromCart = async (productId) => {
        const cartItem = cartItems.find(item => item.id === productId);

        if (!user || !user.id || !cartItem?.cartId) {
            // Fallback: remove from local state
            setCartItems(prevItems =>
                prevItems.filter(item => item.id !== productId)
            );
            return;
        }

        try {
            await api.delete(`/cart/${cartItem.cartId}`);
            await loadCartFromBackend();
        } catch (error) {
            console.error('Error removing from cart:', error);
            // Fallback to local state
            setCartItems(prevItems =>
                prevItems.filter(item => item.id !== productId)
            );
        }
    };

    const updateQuantity = async (productId, newQuantity) => {
        const cartItem = cartItems.find(item => item.id === productId);

        if (!user || !user.id || !cartItem?.cartId) {
            // Fallback: update local state
            setCartItems(prevItems =>
                prevItems.map(item => item.id === productId
                    ?{...item, quantity: Math.max(1, newQuantity)}
                    : item
                )
            );
            return;
        }

        try {
            await api.put(`/cart/${cartItem.cartId}`, { quantity: Math.max(1, newQuantity) });
            await loadCartFromBackend();
        } catch (error) {
            console.error('Error updating quantity:', error);
            // Fallback to local state
            setCartItems(prevItems =>
                prevItems.map(item => item.id === productId
                    ?{...item, quantity: Math.max(1, newQuantity)}
                    : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (!user || !user.id) {
            setCartItems([]);
            return;
        }

        try {
            // Clear all items from backend
            const deletePromises = cartItems
                .filter(item => item.cartId)
                .map(item => api.delete(`/cart/${item.cartId}`));

            await Promise.all(deletePromises);
            setCartItems([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
            // Fallback: clear local state
            setCartItems([]);
        }
    };

    const total = cartItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    )

    return (
        <CartContext.Provider
        value = {{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            total,
            loading
        }}
        >
            {children}
        </CartContext.Provider>
    );
}

export default function useCart () {
    const context = useContext(CartContext);
    if(!context){
        throw new Error('useCart deve ser usado dentro de um CartProvider')
    }
    return context
}
