import React, {
  useState,
  useEffect,
  useContext,
  useReducer,
  createContext,
} from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./Home";
import CompareProduct from "./CompareProduct";
import Cart from "./Cart";
import Profile from "./Profile";
import { View, Text, SafeAreaView, Image } from "react-native";
import { useCart } from "../../context/CartContext";
import { useProductContext } from "../../context/CompareProductContext";

const Tab = createBottomTabNavigator();

const MyTabs = () => {
  const [selectedTab, setSelectedTab] = useState("Home");

  useEffect(() => {
    setSelectedTab("Home");
  }, []);

  const tabBarOptions = {
    headerShown: false,
    tabBarStyle: {
      backgroundColor: "#FEFEFE",
      padding: 5,
      borderRadius: 0,
      height: 55,
      elevation: 10,
    },
    tabBarLabelStyle: {
      marginBottom: 5,
      fontWeight: "bold",
    },
    tabBarActiveTintColor: "#EE4D2D",
    tabBarInactiveTintColor: "#5a595e",
  };

  const tabBarIconOptions = (route, color, size) => {
    const icons = {
      Home: {
        default: require("../../images/home.png"),
        selected: require("../../images/home1.png"),
      },
      Cart: {
        default: require("../../images/cartt.png"),
        selected: require("../../images/cart1.png"),
      },
      CompareProduct: {
        default: require("../../images/id1.png"),
        selected: require("../../images/id2.png"),
      },
      Profile: {
        default: require("../../images/user.png"),
        selected: require("../../images/user1.png"),
      },
    };

    const isCurrentTab = route.name === selectedTab;
    const imageSource = isCurrentTab
      ? icons[route.name].selected
      : icons[route.name].default;

    const cartStyle = route.name === "Cart" ? styles.cartIcon : null;

    const [{ cartItems }, dispatchCart] = useCart();
    const itemCount = cartItems.length;
    const { state } = useProductContext();
    const { productCount } = state;
    return (
      <View>
        <Image
          source={imageSource}
          style={{ width: size, height: size, tintColor: color, ...cartStyle }}
        />
        {route.name === "Cart" && (
          <Text
            style={{
              position: "absolute",
              top: -5,
              right: -5,
              color: "white",
              paddingTop: 2,
              paddingBottom: 1,
              paddingLeft: 6,
              paddingRight: 6,
              borderRadius: 100,
              backgroundColor: "#c20302",
              fontSize: 12,
              borderWidth: 1,
              borderColor: "white",
              textAlign: "center",
              alignItems: "center",
              fontWeight: "500",
            }}
          >
            {itemCount}
          </Text>
        )}

        {route.name === "CompareProduct" && (
          <Text
            style={{
              position: "absolute",
              top: -7,
              right: -8,
              color: "white",
              paddingTop: 2,
              paddingBottom: 1,
              paddingLeft: 6,
              paddingRight: 6,
              borderRadius: 100,
              backgroundColor: "#c20302",
              fontSize: 12,
              borderWidth: 1,
              borderColor: "white",
              textAlign: "center",
              alignItems: "center",
              fontWeight: "500",
            }}
          >
            {productCount}
          </Text>
        )}
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...tabBarOptions,
        tabBarIcon: ({ color, size }) => tabBarIconOptions(route, color, size),
      })}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: "Trang chủ",
        }}
        listeners={{
          tabPress: () => {
            setSelectedTab("Home");
          },
        }}
      />
      <Tab.Screen
        name="Cart"
        component={Cart}
        options={{
          tabBarLabel: "Giỏ hàng",
        }}
        listeners={{
          tabPress: () => {
            setSelectedTab("Cart");
          },
        }}
      />
      <Tab.Screen
        name="CompareProduct"
        component={CompareProduct}
        options={{
          tabBarLabel: "So sánh",
        }}
        listeners={{
          tabPress: () => {
            setSelectedTab("CompareProduct");
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarLabel: "Cá nhân",
        }}
        listeners={{
          tabPress: () => {
            setSelectedTab("Profile");
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default MyTabs;

const styles = {
  cartIcon: {
    height: 29,
    width: 29,
    marginRight: 3,
  },
};
