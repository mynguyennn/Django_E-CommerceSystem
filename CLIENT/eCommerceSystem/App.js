import React, {
  Component,
  useState,
  useEffect,
  createContext,
  useReducer,
} from "react";
import { View, Text, SafeAreaView, Image } from "react-native";
import Login from "./src/screens/Customer/Login";
import Register from "./src/screens/Customer/Register";
import Home from "./src/screens/Customer/Home";
import AddProducts from "./src/screens/Saller/AddProducts";
import Profile from "./src/screens/Customer/Profile";
import Cart from "./src/screens/Customer/Cart";
import SearchProducts from "./src/screens/Customer/SearchProducts";
import ProductDetail from "./src/screens/Customer/ProductDetail";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { SafeAreaProvider } from "react-native-safe-area-context";
import MyTabs from "./src/screens/Customer/MyTabs";
import ProductList from "./src/screens/Saller/ProductList";
import ProductSoldOut from "./src/screens/Saller/ProductSoldOut";
import ProductPending from "./src/screens/Saller/ProductPending";
import TagProduct from "./src/screens/Saller/TagProduct";
import LoginReducer from "./src/reducer/LoginReducer";
import AddStore from "./src/screens/Saller/AddStore";
import UpdateProduct from "./src/screens/Saller/UpdateProduct";
import MenuStore from "./src/screens/Saller/MenuStore";
import ProfileStore from "./src/screens/Saller/ProfileStore";
import ProductStats from "./src/screens/Saller/ProductStats";
import ProductListStats from "./src/screens/Saller/ProductListStats";
import ChooseStats from "./src/screens/Saller/ChooseStats";
import CategoryListStats from "./src/screens/Saller/CategoryListStats";
import CategoryStats from "./src/screens/Saller/CategoryStats";
import BillDetail from "./src/screens/Customer/BillDetail";
import Pay from "./src/screens/Customer/Pay";
import BillList from "./src/screens/Customer/BillList";
import ChooseBill from "./src/screens/Customer/ChooseBill";
import BillConfirm from "./src/screens/Customer/BillConfirm";
import ReviewProduct from "./src/screens/Customer/ReviewProduct";
import FollowList from "./src/screens/Customer/FollowList";
import MyReviewProduct from "./src/screens/Customer/MyReviewProduct";
import EditProfile from "./src/screens/Customer/EditProfile";
import OrderSold from "./src/screens/Saller/OrderSold";
import OrderPendingList from "./src/screens/Saller/OrderPendingList";
import ProductListComments from "./src/screens/Saller/ProductListComments";
import CommentDetail from "./src/screens/Saller/CommentDetail";
import StoreRevenue from "./src/screens/Saller/StoreRevenue";

import CartReducer from "./src/reducer/CartReducer";
import { CartProvider } from "./src/context/CartContext";
import { RefreshDataProvider } from "./src/context/RefreshDataContext";
import { ProductProvider } from "./src/context/CompareProductContext";
import { LoginProvider } from "./src/context/LoginContext";

import MenuManager from "./src/screens/Manager/MenuManager";
import StoreStats from "./src/screens/Manager/StoreStats";
import ConfirmStore from "./src/screens/Manager/ConfirmStore";
import ConfirmProduct from "./src/screens/Manager/ConfirmProduct";
import ListConfirmProduct from "./src/screens/Manager/ListConfirmProduct";
import StoreListStats from "./src/screens/Manager/StoreListStats";
import StatsFrequencySale from "./src/screens/Manager/StatsFrequencySale";
import StatsTotalProduct from "./src/screens/Manager/StatsTotalProduct";

const Stack = createNativeStackNavigator();

const RootComponent = () => {
  const [cart, dispatchCart] = useReducer(CartReducer, { cartItems: [] });
  return (
    <CartProvider initialState={cart} reducer={CartReducer}>
      <LoginProvider>
        <RefreshDataProvider>
          <ProductProvider>
            <SafeAreaProvider>
              <NavigationContainer>
                <Stack.Navigator
                  initialRouteName="HomeTabs"
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="HomeTabs" component={MyTabs} />
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="Register" component={Register} />
                  <Stack.Screen
                    name="ProductDetail"
                    component={ProductDetail}
                  />
                  <Stack.Screen name="AddProducts" component={AddProducts} />
                  <Stack.Screen name="AddStore" component={AddStore} />
                  <Stack.Screen name="ProfileStore" component={ProfileStore} />
                  <Stack.Screen name="MenuStore" component={MenuStore} />
                  <Stack.Screen
                    name="SearchProducts"
                    component={SearchProducts}
                  />
                  <Stack.Screen name="ProductList" component={ProductList} />
                  <Stack.Screen
                    name="ProductSoldOut"
                    component={ProductSoldOut}
                  />
                  <Stack.Screen
                    name="ProductPending"
                    component={ProductPending}
                  />
                  <Stack.Screen name="TagProduct" component={TagProduct} />
                  <Stack.Screen
                    name="UpdateProduct"
                    component={UpdateProduct}
                  />
                  <Stack.Screen name="ProductStats" component={ProductStats} />
                  <Stack.Screen name="ChooseStats" component={ChooseStats} />
                  <Stack.Screen
                    name="CategoryStats"
                    component={CategoryStats}
                  />
                  <Stack.Screen name="BillDetail" component={BillDetail} />
                  <Stack.Screen name="Pay" component={Pay} />
                  <Stack.Screen
                    name="StoreListStats"
                    component={StoreListStats}
                  />
                  <Stack.Screen name="StoreRevenue" component={StoreRevenue} />
                  <Stack.Screen name="MenuManager" component={MenuManager} />
                  <Stack.Screen name="StoreStats" component={StoreStats} />
                  <Stack.Screen name="ConfirmStore" component={ConfirmStore} />
                  <Stack.Screen
                    name="ListConfirmProduct"
                    component={ListConfirmProduct}
                  />

                  <Stack.Screen
                    name="ConfirmProduct"
                    component={ConfirmProduct}
                  />

                  <Stack.Screen
                    name="MyReviewProduct"
                    component={MyReviewProduct}
                  />
                  <Stack.Screen name="OrderSold" component={OrderSold} />
                  <Stack.Screen
                    name="StatsFrequencySale"
                    component={StatsFrequencySale}
                  />
                  <Stack.Screen
                    name="StatsTotalProduct"
                    component={StatsTotalProduct}
                  />
                  <Stack.Screen name="BillList" component={BillList} />
                  <Stack.Screen name="ChooseBill" component={ChooseBill} />
                  <Stack.Screen name="BillConfirm" component={BillConfirm} />
                  <Stack.Screen name="FollowList" component={FollowList} />
                  <Stack.Screen
                    name="ReviewProduct"
                    component={ReviewProduct}
                  />
                  <Stack.Screen
                    name="ProductListComments"
                    component={ProductListComments}
                  />
                  <Stack.Screen
                    name="CommentDetail"
                    component={CommentDetail}
                  />
                  <Stack.Screen
                    name="OrderPendingList"
                    component={OrderPendingList}
                  />
                  <Stack.Screen
                    name="CategoryListStats"
                    component={CategoryListStats}
                  />
                  <Stack.Screen
                    name="ProductListStats"
                    component={ProductListStats}
                  />
                  <Stack.Screen name="EditProfile" component={EditProfile} />
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaProvider>
          </ProductProvider>
        </RefreshDataProvider>
      </LoginProvider>
    </CartProvider>
  );
};

export default RootComponent;

const styles = {
  cartIcon: {
    height: 29,
    width: 29,
    marginRight: 3,
  },
};
