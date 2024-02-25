const StoreReducer = (state, action) => {
  switch (action.type) {
    case "SET_STORE_DATA":
      return {
        ...state,
        storeData: action.payload,
      };
    default:
      return state;
  }
};

export default StoreReducer;
