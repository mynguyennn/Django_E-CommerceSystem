export const refreshDataReducer = (state, action) => {
  switch (action.type) {
    case "REFRESH_DATA":
      return !state;
    case "REFRESH_DATA_MENUSTORE":
      return !state;
    case "REFRESH_DATA_MANAGER":
      return !state;
    case "REFRESH_DATA_UPDATECMT":
      return !state;
    case "REFRESH_DATA_ADDCMT":
      return !state;
    default:
      return state;
  }
};
