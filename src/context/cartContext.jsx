import { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} from '../lib/apiClient';
import CartSidebar from '../components/CartSider';
const DEBOUNCE_DELAY = 600; // en ms
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showCart, setShowCart] = useState(false);


  // Cargar carrito al montar
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await getCart();
        setCart(data);
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Acciones
  const handleAdd = async (product_id, quantity = 1) => {
    // Asegurate de que product_id sea un string o number, no un objeto
    await addToCart(product_id, quantity);
    const data = await getCart();
    setCart(data);
    setShowCart(true);
    };
    
    const updateTimers = useRef({});
    const handleUpdate = (product_id, quantity) => {
        const updatedCart = cart.map(item =>
            item.id === product_id ? { ...item, quantity } : item
        );
        setCart(updatedCart);

        // Limpiar timer anterior si existe
        if (updateTimers.current[product_id]) {
            clearTimeout(updateTimers.current[product_id]);
        }

        // Nuevo timer debounced
        updateTimers.current[product_id] = setTimeout(async () => {
            try {
            await updateCart(product_id, quantity);
            } catch (err) {
            console.error(`Error al guardar cantidad de ${product_id}:`, err);
            setErrors(prev => ({ ...prev, [product_id]: 'Error al guardar' }));
            }
        }, DEBOUNCE_DELAY);
    };

  const handleRemove = async (product_id) => {
    await removeFromCart(product_id);
    const data = await getCart();
    setCart(data);
  };

  const handleClear = async () => {
    await clearCart();
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      addToCart: handleAdd,
      updateCart: handleUpdate,
      removeFromCart: handleRemove,
      clearCart: handleClear,
      errors
    }}>
      {children}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
