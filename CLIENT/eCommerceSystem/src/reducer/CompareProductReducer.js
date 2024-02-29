export const initialState = {
  selectedProductIds: [],
  selectedCategoryIds: [],
  selectedProducts: [],
  productCount: 0,
};

const productReducer = (state, action) => {
  switch (action.type) {
    case "ADD_PRODUCT":
      const newProducts = action.payload;

      if (state.selectedProductIds.length < 2) {
        const productIds = newProducts.map((product) => product.id);
        const categoryIds = newProducts.map(
          (product) => product.category_info.id
        );

        //ktra da co 2 sp giong nhau ko
        if (productIds.some((id) => state.selectedProductIds.includes(id))) {
          alert("Sản phẩm đã được chọn!");
          return state;
        }

        if (
          state.selectedProductIds.length === 0 ||
          (state.selectedProductIds.length < 2 &&
            state.selectedCategoryIds.includes(categoryIds[0]))
        ) {
          console.log("Product IDs reducer:", productIds);
          console.log("Category IDs reducer:", categoryIds);

          console.log("add product: ", newProducts);

          //them id category vao ds
          const updatedCategoryIds = [
            ...new Set([...state.selectedCategoryIds, ...categoryIds]),
          ];

          //ktra da co 2 sp chua
          if (state.selectedProductIds.length + productIds.length > 2) {
            alert("Bạn chỉ có thể so sánh 2 sản phẩm!");
            return state;
          }

          //tao ds product moi
          const updatedProducts = [
            ...state.selectedProducts,
            ...newProducts.map((product) => ({
              ...product,
              key: product.id.toString(),
            })),
          ];

          return {
            ...state,
            selectedProductIds: [...state.selectedProductIds, ...productIds],
            selectedCategoryIds: updatedCategoryIds,
            selectedProducts: updatedProducts,
            productCount: state.productCount + 1,
          };
        } else {
          alert("Bạn chỉ so sánh được hai sản phẩm có cùng Danh mục!");
          return state;
        }
      } else {
        alert("Đã có hai sản phẩm được so sánh!");
        return state;
      }

    case "REMOVE_ALL_PRODUCTS":
      return {
        ...state,
        selectedProductIds: [],
        selectedCategoryIds: [],
        selectedProducts: [],
        productCount: 0,
      };

    default:
      return state;
  }
};

export default productReducer;
