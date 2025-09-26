const API_URL = import.meta.env.VITE_API_URL;

/**
 * Envia peticiones GET a la API y devuelve JSON.
 * @param {string} endpoint => '/products', '/orders', etc.
 */
export async function get(endpoint, token) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Registro de usuario
export async function registerUser({ name, email, password }) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();
  console.log('🔍 Register response:', data);

  if (!res.ok) {
    return { error: data.error || 'Error desconocido' };
  }

  return data;
}

// Login de usuario
export async function loginUser(credentials) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return res.json();
}

// Perfil autenticado ESTA FUNCION VERIFICA LA SESIÓN
export async function getProfile(token) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
// Para pantalla PROFILE.JSX 
export async function updateUserInfo(data) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/auth/updateme`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Error al actualizar usuario');
    }

    return await response.json();
  } catch (error) {
    console.error('🛑 Error en updateUserInfo:', error);
    throw error;
  }
}




//
// ===== ADMIN =====
//

// Obtener todos los usuarios (admin only)
export async function getAdminUsers(token) {
  return get('/dashboard/users', token);
}

// Obtener resumen de productos (admin only)
export async function getAdminProducts(token) {
  return get('/dashboard/products', token);
}

// Cambiar el rol de un usuario
export async function updateUserRole(userId, role, token) {
  const res = await fetch(`${API_URL}/dashboard/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { error: data.error || 'Error al actualizar rol' };
  }

  return data;
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/dashboard/products/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.json();
}

export async function updateProduct(productId, data, token) {
  const res = await fetch(`${API_URL}/dashboard/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Error al actualizar producto');
  return result.product;
}

export async function createProduct(data, token) {
  const res = await fetch(`${API_URL}/dashboard/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Error al crear producto');
  return result;
}

export async function getAdminCategories(token) {
  const res = await fetch(`${API_URL}/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function getPublicProducts() {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error('Error al cargar productos');
  return res.json();
}

export async function getPublicCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error('Error al cargar categorías');
  return res.json();
}


// WISHLIST
export const getWishlist = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/wishlist`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener wishlist');
  return res.json();
};

export const addToWishlist = async (product_id) => {
  const token = localStorage.getItem('token');
  console.log('ADD TO WISHLIST', product_id);
  const res = await fetch(`${API_URL}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ product_id }),
  });

  if (!res.ok) throw new Error('Error al agregar a wishlist');
  return res.json();
};

export const removeFromWishlist = async (product_id) => {
  const token = localStorage.getItem('token');
  console.log('REMOVE FROM WISHLIST', product_id);
  const res = await fetch(`${API_URL}/wishlist/${product_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Error al eliminar de wishlist');
  return res.json();
};

export const getWishlistAnalytics = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/wishlistAdmin`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Error al obtener wishlist');
  return res.json();
};


// THEMES
export async function getThemes(token) {
  try {
    const res = await fetch(`${API_URL}/dashboard/themes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ Correcto
      }
      
    });

    if (!res.ok) throw new Error('Error al obtener temas');
    return await res.json();
  } catch (error) {
    console.error('getThemes error:', error);
    throw error;
  }
}

export async function activateTheme(themeId, token) {
  try {
    const res = await fetch(`${API_URL}/dashboard/themes/${themeId}/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ Correcto
      }
    });

    if (!res.ok) throw new Error('Error al activar el tema');
    return await res.json();
  } catch (error) {
    console.error('activateTheme error:', error);
    throw error;
  }
}

export async function getActiveTheme() {
  try {
    const res = await fetch(`${API_URL}/theme`);
    if (!res.ok) throw new Error('Error al obtener el tema activo');
    return await res.json(); // devuelve solo el JSON de variables
  } catch (error) {
    console.error('getActiveTheme error:', error);
    throw error;
  }
}


// SETTINGS
export async function getPublicSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'GET',
    });

    if (!res.ok) throw new Error('Error al obtener settings públicos');
    return await res.json();
  } catch (error) {
    console.error('getPublicSettings error:', error);
    throw error;
  }
}
export async function updateSettings(data, token) {
  try {
    const res = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al actualizar configuración');
    }

    return await res.json();
  } catch (error) {
    console.error('updateSettings error:', error);
    throw error;
  }
}
export async function getCart() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Error al obtener carrito');
  return res.json();
}

export async function addToCart(product_id, quantity = 1) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id, quantity }),
  });
  if (!res.ok) throw new Error('Error al agregar al carrito');
  return res.json();
}
export async function updateCart(product_id, quantity) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/cart`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_id, quantity }),
  });

  if (!res.ok) throw new Error('Error al actualizar carrito');
  return res.json();
}
export async function removeFromCart(product_id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/cart/${product_id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Error al eliminar del carrito');
  return res.json();
}
export async function clearCart() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/cart`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Error al vaciar el carrito');
  return res.json();
}


// === CHECKOUT ===
// channel: 'whatsapp' | 'mercadopago'
export async function checkoutInit(channel = 'whatsapp') {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/checkout/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en checkout');
  // whatsapp: { orderId, total, pay_url }
  // MP (futuro): { orderId, total, mp_init_point }
  return data;
}

// === ORDERS (usuario autenticado) ===
export async function getMyOrders(page = 1, limit = 20) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al listar órdenes');
  return data; // { page, limit, data: [...] }
}

export async function getOrderDetail(orderId) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error al obtener orden');
  return data; // { id, status, total, items: [...] }
}

// === ADMIN: confirmar pago manual (WhatsApp/transferencia) ===
export async function confirmOrderPayment(orderId, token) {
  const res = await fetch(`${API_URL}/dashboard/orders/${orderId}/confirm-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'No se pudo confirmar el pago');
  return data; // { ok: true, message: ... }
}
