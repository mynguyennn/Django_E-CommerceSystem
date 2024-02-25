const CartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART":
      const existingItemIndex = state.cartItems.findIndex(
        (item) => item.id === action.payload.id
      );

      if (existingItemIndex !== -1) {
        const updatedCartItems = state.cartItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );

        return {
          ...state,
          cartItems: updatedCartItems,
        };
      }

      return {
        ...state,
        cartItems: [...state.cartItems, { ...action.payload, quantity: 1 }],
      };

    case "UPDATE_CART":
      return {
        ...state,
        cartItems: action.payload,
      };

    case "REMOVE_FROM_CART":
      const updatedCartItems = state.cartItems.filter(
        (item) => item.id !== action.payload.id
      );
      return {
        ...state,
        cartItems: updatedCartItems,
      };

    case "DECREASE_QUANTITY":
      const decreasedCartItems = state.cartItems.map((item) => {
        if (item.id === action.payload.productId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
      return { ...state, cartItems: decreasedCartItems };

    case "INCREASE_QUANTITY":
      const increasedCartItems = state.cartItems.map((item) => {
        if (item.id === action.payload.productId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      return { ...state, cartItems: increasedCartItems };

    default:
      return state;
  }
};

export default CartReducer;
