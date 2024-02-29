export const refreshDataReducer = (state, action) => {
  switch (action.type) {
    case "REFRESH_DATA":
      return !state;
    case "REFRESH_DATA_MENUSTORE":
      return !state;
    case "REFRESH_DATA_MANAGER":
      return !state;
    default:
      return state;
  }
};
