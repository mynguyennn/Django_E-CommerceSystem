import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, Alert, FlatList, Modal } from "react-native";
import WebView from "react-native-webview";

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import axios, { endpoints } from "../../config/API";
import { useRoute } from "@react-navigation/native";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default OrderPendingList = ({ navigation }) => {
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
        <HeaderComponent navigation={navigation} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent navigation={navigation} formatPrice={formatPrice} />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} formatPrice={formatPrice} />
      </View>
    </View>
  );
};

const HeaderComponent = ({ navigation }) => {
  const route = useRoute();
  const { storeData } = route.params;
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Component Header */}
      <View style={styles.containerHeader}>
        <View style={styles.signIn}>
          <TouchableOpacity
            style={styles.bgIconMess}
            onPress={() =>
              navigation.navigate("MenuStore", {
                refreshData: true,
                storeData: storeData,
              })
            }
          >
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>

          <View>
            <Text style={styles.textSignIn}>Đơn chờ xác nhận</Text>
          </View>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation, formatPrice }) => {
  const route = useRoute();
  const { storeId } = route.params;

  //   const storeId = 6;
  const [orders, setOrders] = useState([]);

  // console.log(orders);

  //update status_order
  const handleConfirmButtonClick = async (orderId) => {
    await updateOrderStatus(orderId);
    console.log(orderId);
    navigation.navigate("OrderPendingList", {
      refreshData: true,
      storeId: storeId,
    });
  };
  const updateOrderStatus = async (orderId) => {
    try {
      const response = await axios.patch(
        endpoints.update_order_status(storeId) + `?order_id=${orderId}`
      );
      if (response.status === 200) {
        console.log(
          "Đã cập nhật trạng thái đơn hàng thành công:",
          response.data
        );

        //render update status_orderss
        setOrders(response.data);
      } else {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", response.data);
      }
    } catch (error) {
      console.error("Lỗi khi gửi yêu cầu PATCH:", error);
    }
  };

  //get bill
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          endpoints.get_orders_status_order_false(storeId)
        );

        setOrders(response.data);

        console.log("=>>>>>>>", response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [route.params?.refreshData]);

  //bill item
  const OrderDetailItem = ({ orderDetail }) => (
    <View style={styles.bgInfoShop}>
      <View style={styles.bgImgProduct}>
        <Image
          source={{ uri: orderDetail.product.images[0].thumbnail }}
          style={styles.imgProdcut}
        />
      </View>

      <View style={styles.bgInfoProduct}>
        <View>
          <Text style={styles.textNamePr}>
            {orderDetail.product.name_product}
          </Text>
        </View>

        <Text style={styles.textPricePr}>
          {formatPrice(orderDetail.product.price)}
        </Text>
      </View>
      <Text style={{ position: "absolute", right: 0, bottom: 0 }}>
        x {orderDetail.quantity}
      </Text>
    </View>
  );

  const OrderItem = ({ order }) => (
    <View style={{ backgroundColor: "white" }}>
      <View style={styles.bgNameShop}>
        <Text style={styles.textShop}>Khách hàng:</Text>

        <Text style={styles.textShop1}>
          {order.order_info.account_info.full_name}
        </Text>
        <Text style={styles.iconView}>
          <Text style={styles.iconView}>
            {order.order_info.status_pay ? "Đã thanh toán" : "Chưa thanh toán"}
          </Text>
        </Text>
      </View>

      {/* <View style={styles.brButton2} /> */}

      <View style={styles.bgNameShop1}>
        <View style={styles.bgNameShop11}>
          <Text style={{ color: "#EE4D2D", fontWeight: "500", fontSize: 14 }}>
            Thông tin đơn hàng:
          </Text>
        </View>

        <View style={styles.bgNameShop11}>
          <Text style={styles.textShop}>Địa chỉ:</Text>

          <Text style={styles.textShop2}>
            {order.order_info.account_info.address}
          </Text>
        </View>

        <View style={styles.bgNameShop11}>
          <Text style={styles.textShop}>Điện thoại:</Text>

          <Text style={styles.textShop2}>
            {order.order_info.account_info.phone}
          </Text>
        </View>

        <View style={styles.bgNameShop11}>
          <Text style={styles.textShop}>Phương thức thanh toán:</Text>

          <Text style={styles.textShop2}>
            {order.order_info.paymentType.name_paymentType}
          </Text>
        </View>

        <View style={styles.bgNameShop11}>
          <Text style={styles.textShop}>Phương thức vận chuyển:</Text>

          <Text style={styles.textShop2}>
            {order.order_info.shippingType.name_shippingType}
          </Text>
        </View>
      </View>

      <View style={styles.brButton2} />

      {order.order_details.map((orderDetail) => (
        <OrderDetailItem key={orderDetail.id} orderDetail={orderDetail} />
      ))}

      <View style={styles.brButton2} />
      <View
        style={{
          flexDirection: "row",
          width: windownWidth - 30,
          marginLeft: 15,
          justifyContent: "flex-end",
          alignItems: "center",
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <Text
          style={{
            position: "absolute",
            left: 0,
            color: "gray",
            fontSize: 13,
          }}
        >
          {order.order_details.length} sản phẩm
        </Text>

        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 5,
              marginLeft: 32,
            }}
          >
            <Text style={{ fontSize: 14 }}>Tiền hàng:</Text>
            <Text style={{ marginLeft: 5, fontSize: 14 }}>
              {formatPrice(
                order.order_details.reduce((total, orderDetail) => {
                  return (
                    total + orderDetail.product.price * orderDetail.quantity
                  );
                }, 0)
              )}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 5,
              marginLeft: 32,
            }}
          >
            <Text style={{ fontSize: 14 }}>Giá vận chuyển:</Text>
            <Text style={{ marginLeft: 5, fontSize: 14 }}>
              {formatPrice(order.order_info.shipping_fee)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 5,
              paddingBottom: 5,
            }}
          >
            <Image
              source={require("../../images/protect.png")}
              style={styles.iconShop1}
            />
            <Text style={{ fontSize: 14 }}>Tổng thanh toán:</Text>
            <Text
              style={{
                marginLeft: 5,
                color: "#EE4D2D",
                fontWeight: "500",
                fontSize: 14,
              }}
            >
              {formatPrice(
                order.order_details.reduce((total, orderDetail) => {
                  return (
                    total + orderDetail.product.price * orderDetail.quantity
                  );
                }, 0) + order.order_info.shipping_fee
              )}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.brButton2} />
      <View
        style={{
          width: windownWidth - 30,
          marginLeft: 15,
          paddingTop: 10,
          paddingBottom: 10,
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <View>
          <Text
            style={{
              textAlign: "center",
              width: 130,
              backgroundColor: "#919191",
              color: "white",
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 5,
            }}
          >
            Mã hóa đơn: {order.order_info.id}
          </Text>
        </View>

        {order.order_info.status_pay ? (
          <TouchableOpacity
            onPress={() => handleConfirmButtonClick(order.order_info.id)}
          >
            <Text
              style={{
                textAlign: "center",
                width: 140,
                backgroundColor: "#EE4D2D",
                color: "white",
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 5,
              }}
            >
              {order.order_info.status_pay ? "Xác nhận" : "Đã xác nhận"}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Text
              style={{
                textAlign: "center",
                width: 140,
                backgroundColor: "#919191",
                color: "white",
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 5,
              }}
            >
              Chờ thanh toán
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.brButton11111} />
    </View>
  );

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item.order_info.id.toString()}
      renderItem={({ item }) => <OrderItem order={item} />}
    />
  );
};

const FooterComponent = ({}) => {
  return;
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  viewHeader: {
    width: "100%",
    flex: 12.5,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 87.5,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 0,
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
    fontSize: 20,
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
  brButton11111: {
    // marginTop: 10,
    height: 20,
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
    left: 20,
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
    // borderWidth:1
  },
  bgNameShop1: {
    // flexDirection: "row",
    // width: windownWidth - 20,
    // marginLeft: 10,
    // alignItems: "center",
    paddingTop: 10,
    paddingBottom: 10,
    position: "relative",
    // borderWidth:1

    borderColor: "#00caca",
    borderWidth: 0.5,
    // height: 80,
    // alignItems: "center",
    backgroundColor: "#F6FEFE",
  },
  bgNameShop11: {
    flexDirection: "row",
    width: windownWidth - 20,
    marginLeft: 10,
    alignItems: "center",
    paddingTop: 5,
    paddingBottom: 5,
    position: "relative",
  },
  iconShop: {
    height: 19,
    width: 19,
    marginRight: 10,
  },
  iconShop1: {
    height: 22,
    width: 22,
    marginRight: 10,
  },
  textShop: {
    fontSize: 14,
    color: "#3f3f3f",
    // fontWeight: "700",
  },
  textShop1: {
    marginLeft: 5,
    fontSize: 14.5,
    fontWeight: "700",
    // borderWidth: 1,
  },
  textShop2: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
    // borderWidth:1,
    width: 250,
    color: "#3f3f3f",
  },
  iconView: {
    position: "absolute",
    // height: 21,
    // width: 21,
    right: 0,
    color: "#d80000",
    // fontWeight:'500'
  },
  bgInfoShop: {
    flexDirection: "row",
    width: windownWidth - 20,
    marginLeft: 10,
    marginTop: 15,
    marginBottom: 15,
    alignItems: "center",
    // backgroundColor: "red",
  },
  imgProdcut: {
    height: 80,
    width: 80,
    borderWidth: 0.2,
    borderColor: "gray",
    borderRadius: 5,
  },
  bgImgProduct: {
    marginRight: 20,
    // borderWidth: 1,
    // paddingTop: 10,
    // alignItems: "center",
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
    color: "white",
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
    width: 270,
    fontSize: 14,
    // borderWidth: 1,
  },
  textPricePr: {
    marginTop: 5,
    fontSize: 14,
    // fontWeight: "500",
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
  backButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
  },
});
