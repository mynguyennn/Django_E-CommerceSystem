import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, Alert } from "react-native";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LoginContext } from "../../../App";
import { useCart } from "../../context/CartContext";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default Cart = ({ navigation }) => {
  const [user, dispatch] = useContext(LoginContext);
  const [{ cartItems }, dispatchCart] = useCart();

  const isLoggedIn = user !== null;
  const [totalPrice, setTotalPrice] = useState(0);
  const itemCount = cartItems.length;
  // console.log(itemCount);
  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent itemCount={itemCount} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          user={user}
          isLoggedIn={isLoggedIn}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          formatPrice={formatPrice}
          cartItems={cartItems}
          dispatchCart={dispatchCart}
          itemCount={itemCount}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent
          navigation={navigation}
          user={user}
          isLoggedIn={isLoggedIn}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          formatPrice={formatPrice}
          cartItems={cartItems}
          itemCount={itemCount}
        />
      </View>
    </View>
  );
};

const HeaderComponent = ({ itemCount }) => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Component Header */}
      <View style={styles.containerHeader}>
        <View style={styles.signIn}>
          <TouchableOpacity>
            <Text style={styles.textSignIn}>Giỏ hàng ({itemCount})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/333.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>

      <View style={styles.bgContent}>
        <View style={styles.bgFreeShip}>
          <Image
            source={require("../../images/freeship.png")}
            style={styles.iconFreeShip}
          ></Image>
          <Text>Đừng bỏ lỡ mã Freeship ở mục Voucher</Text>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({
  navigation,
  user,
  isLoggedIn,
  totalPrice,
  setTotalPrice,
  formatPrice,
  cartItems,
  dispatchCart,
  itemCount,
}) => {
  const [quantity, setQuantity] = useState(1);
  // console.log("============>>>>", cartItems);
  //add cart

  const CartItem = ({ item, onDecrease, onIncrease }) => (
    <View>
      <View>
        <TouchableOpacity style={styles.bgNameShop}>
          <Image
            source={require("../../images/shop.png")}
            style={styles.iconShop}
          ></Image>
          <Text style={styles.textShop}>{item.store_info.name_store}</Text>

          <Image
            source={require("../../images/settingnext.png")}
            style={styles.iconView}
          ></Image>
        </TouchableOpacity>
        <View style={styles.brButton2}></View>
      </View>

      <View style={styles.bgInfoShop}>
        <TouchableOpacity style={styles.bgImgProduct}>
          <Image
            source={{ uri: item.images[0].thumbnail }}
            style={styles.imgProdcut}
          ></Image>
        </TouchableOpacity>

        <View style={styles.bgInfoProduct}>
          <TouchableOpacity>
            <Text
              style={styles.textNamePr}
              // numberOfLines={1}
              // ellipsizeMode="tail"
            >
              <Text>{item.name_product}</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.textPricePr}>{formatPrice(item.price)}</Text>

          <View style={styles.bgQuantity}>
            <TouchableOpacity onPress={onDecrease} style={styles.button}>
              <Text style={styles.buttonText}>–</Text>
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity onPress={onIncrease} style={styles.button}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.brButton2}></View>

      <View style={styles.bgVoucher}>
        <TouchableOpacity style={styles.bgFreeShip}>
          <Image
            source={require("../../images/voucher.png")}
            style={styles.iconVoucher}
          ></Image>
          <Text>Voucher giảm đến 5k</Text>

          <Image
            source={require("../../images/settingnext.png")}
            style={styles.iconView}
          ></Image>
        </TouchableOpacity>
      </View>

      <View style={styles.brButton1}></View>
    </View>
  );

  //quantily
  const handleDecrease = (productId) => {
    const item = cartItems.find((item) => item.id === productId);

    if (item && item.quantity === 1) {
      Alert.alert(
        "Xác nhận",
        `Bạn có chắc chắn muốn xóa ${item.name_product} khỏi giỏ hàng?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => {
              dispatchCart({
                type: "REMOVE_FROM_CART",
                payload: { id: productId },
              });
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      dispatchCart({ type: "DECREASE_QUANTITY", payload: { productId } });
    }
  };

  const handleIncrease = (productId) => {
    dispatchCart({ type: "INCREASE_QUANTITY", payload: { productId } });
  };

  //total price
  const calculateTotalPrice = () => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total;
  };

  useEffect(() => {
    setTotalPrice(calculateTotalPrice());
  }, [cartItems]);

  return (
    <ScrollView>
      {isLoggedIn ? (
        <>
          {cartItems.map((item, index) => (
            <CartItem
            
              key={index}
              item={item}
              isLoggedIn={isLoggedIn}
              onDecrease={() => handleDecrease(item.id)}
              onIncrease={() => handleIncrease(item.id)}
            />
          ))}
        </>
      ) : (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: 15,
          }}
        >
          <Text style={{ fontSize: 15 }}>Vui lòng</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("Login");
            }}
          >
            <Text
              style={{
                fontSize: 15,
                marginLeft: 2,
                color: "#EE4D2D",
                fontWeight: "500",
              }}
            >
              đăng nhập?
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const FooterComponent = ({
  user,
  isLoggedIn,
  totalPrice,
  formatPrice,
  navigation,
  cartItems,
  itemCount,
}) => {
  // console.log("===============>", cartItems);
  const isTotalPriceZero = totalPrice === 0;

  return (
    <>
      {isLoggedIn ? (
        <>
          <View style={styles.bgPayProduct}>
            <View style={styles.bgIconChat}>
              <Text style={styles.textIconChat}>Tổng thanh toán:</Text>
              <Text style={styles.textTotalPay}>{formatPrice(totalPrice)}</Text>
            </View>

            {isTotalPriceZero ? (
              <View style={styles.bgPayProduct1}>
                <Text style={styles.textPayProduct}>
                  Mua hàng ({itemCount})
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.bgPayProduct1}
                onPress={() =>
                  navigation.navigate("Pay", {
                    cartItems: cartItems,
                    totalPrice: totalPrice,
                    itemCount: itemCount,
                  })
                }
              >
                <Text style={styles.textPayProduct}>
                  Mua hàng ({itemCount})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  viewHeader: {
    width: "100%",
    flex: 14.1,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 57,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 5.5,
    // backgroundColor: "gray",
  },
  containerHeader: {
    marginTop: 40,
    // width: "100%",
    // height: "100%",
  },
  signIn: {
    height: 60,
    flexDirection: "row",
    backgroundColor: "#FEFEFE",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // borderWidth: 1
  },
  textSignIn: {
    fontSize: 19,
    color: "black",
    fontWeight: "400",
  },
  brButton: {
    height: 3,
    width: "100%",
    backgroundColor: "#F2F2F2",
    position: "absolute",
    bottom: 0,
  },
  brButton1: {
    height: 10,
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
  brButton6: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
  brButton2: {
    height: 1.5,
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
  bgContent: {
    backgroundColor: "#FFF7E3",
  },
  iconBack: {
    height: 25,
    width: 25,
    // marginLeft: 200,
  },
  bgIconMess: {
    position: "absolute",
    right: 20,
  },
  bgFreeShip: {
    padding: 4,
    flexDirection: "row",
    width: windownWidth - 20,
    marginLeft: 10,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  iconFreeShip: {
    height: 27,
    width: 27,
    marginRight: 15,
  },
  bgNameShop: {
    flexDirection: "row",
    width: windownWidth - 20,
    marginLeft: 10,
    alignItems: "center",
    paddingTop: 13,
    paddingBottom: 13,
    position: "relative",
  },
  iconShop: {
    height: 19,
    width: 19,
    marginRight: 10,
  },
  textShop: {
    fontSize: 14.5,
    fontWeight: "700",
  },
  iconView: {
    position: "absolute",
    height: 21,
    width: 21,
    right: 0,
  },
  bgInfoShop: {
    flexDirection: "row",
    width: windownWidth - 20,
    marginLeft: 10,
    marginTop: 25,
    marginBottom: 25,
    // backgroundColor: "red",
  },
  imgProdcut: {
    height: 80,
    width: 80,
  },
  bgImgProduct: {
    marginRight: 20,
  },
  // bgInfoProduct: {
  //  marginRight: 20
  // },
  bgQuantity: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    // width: 105,
  },
  button: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#535353",
    fontSize: 15,
    fontWeight: "500",
  },
  quantity: {
    fontWeight: "500",
    color: "#535353",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  textNamePr: {
    maxWidth: "88%",
    fontSize: 15,
  },
  textPricePr: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "500",
    color: "#EE4D2D",
  },
  iconVoucher: {
    height: 25,
    width: 25,
    marginRight: 15,
  },

  //footer
  bgPayProduct: {
    flex: 1,
    // borderWidth: 2,
    flexDirection: "row",
  },
  bgIconChat: {
    borderTopWidth: 0.5,
    borderTopColor: "#c5c5c5",
    width: "60%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    flexDirection: "row",
  },

  iconChat: {
    marginTop: 5,
    width: 21,
    height: 21,
  },
  textIconChat: {
    marginTop: 2,
    color: "#3b3b3b",
    fontSize: 14,
    marginRight: 7,
  },
  textTotalPay: {
    marginTop: 2,
    color: "black",
    fontSize: 15,
    color: "#EE4D2D",
    fontWeight: "600",
    // marginRight: 5
  },
  bgPayProduct1: {
    borderTopWidth: 0.5,
    borderTopColor: "#EE4D2D",
    width: "40%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EE4D2D",
  },
  textPayProduct: {
    color: "white",
  },
  brFooterPay: {
    width: 1,
    backgroundColor: "#ebebeb",
    // marginRight: 10,
  },
});
