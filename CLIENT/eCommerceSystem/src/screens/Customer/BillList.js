import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, Alert, FlatList, Modal } from "react-native";
import WebView from "react-native-webview";
import { useRefreshData } from "../../context/RefreshDataContext";

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

export default BillList = ({ navigation }) => {
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
        <HeaderComponent />
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

const HeaderComponent = () => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Component Header */}
      <View style={styles.containerHeader}>
        <View style={styles.signIn}>
          {/* <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity> */}

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
  const { state: refreshState } = useRefreshData();

  const route = useRoute();
  const { user, totalShip } = route.params;
  const [orders, setOrders] = useState([]);
  const [vnpayModalData, setVNPAYModalData] = useState({
    order_desc: null,
    amount: null,
  });

  const [paypalModalData, setPayPalModalData] = useState({
    giohang_id: null,
    total_amount: null,
  });
  // console.log(orders);

  //get bill
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(
          endpoints.get_orders_noConfirm_by_account,
          {
            params: {
              account_id: user,
            },
          }
        );

        setOrders(response.data);

        // console.log("=>>>>>>>", response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [refreshState]);

  //bill item
  const BillItem = ({ order }) => {
    //product by store
    const groupProductsByStore = (orderDetails) => {
      const groupedProducts = {};
      orderDetails.forEach((orderDetail) => {
        const storeId = orderDetail.product.store_info.id;
        if (!groupedProducts[storeId]) {
          groupedProducts[storeId] = {
            storeInfo: orderDetail.product.store_info,
            products: [],
          };
        }
        groupedProducts[storeId].products.push(orderDetail);
      });
      return groupedProducts;
    };

    const groupedProducts = groupProductsByStore(order.order_details);

    //total product
    const calculateOrderDetailTotal = (orderDetail) => {
      return orderDetail.product.price * orderDetail.quantity;
    };

    const calculateStoreTotal = (store) => {
      return store.products.reduce(
        (total, orderDetail) => total + calculateOrderDetailTotal(orderDetail),
        0
      );
    };

    const calculateOrderTotal = () => {
      const totalProducts = Object.values(groupedProducts).reduce(
        (total, store) => total + calculateStoreTotal(store),
        0
      );

      const ship = totalProducts + order.shipping_fee;

      return ship;
    };

    return (
      <View style={{ backgroundColor: "white" }}>
        {/* <View style={styles.brButton1} /> */}

        {Object.values(groupedProducts).map((group, index) => (
          <View key={index}>
            <View style={styles.bgNameShop}>
              {/* <Image
                source={{ uri: group.storeInfo.avt }}
                style={styles.iconShop}
              /> */}
              <Image
                source={require("../../images/shop.png")}
                style={styles.iconShop}
              />
              <Text style={styles.textShop}>{group.storeInfo.name_store}</Text>
              <Text style={styles.iconView}>
                <Text style={styles.iconView}>
                  {order.status_pay === true
                    ? "Đã thanh toán"
                    : "Vui lòng thanh toán"}
                </Text>
              </Text>
            </View>

            <View style={styles.brButton2} />

            {group.products.map((orderDetail) => (
              <View key={orderDetail.id}>
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
              </View>
            ))}
          </View>
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
                // paddingBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                }}
              >
                Tiền hàng:
              </Text>
              <Text
                style={{
                  marginLeft: 5,
                  // color: "#EE4D2D",
                  // fontWeight: "500",
                  fontSize: 14,
                }}
              >
                {formatPrice(
                  Object.values(groupedProducts).reduce(
                    (total, store) => total + calculateStoreTotal(store),
                    0
                  )
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
                // paddingBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                }}
              >
                Giá vận chuyển:{" "}
              </Text>
              <Text
                style={{
                  marginLeft: 5,
                  // color: "#EE4D2D",
                  // fontWeight: "500",
                  fontSize: 14,
                }}
              >
                {formatPrice(order.shipping_fee)}
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
              <Text
                style={{
                  fontSize: 14,
                }}
              >
                Tổng thanh toán:
              </Text>
              <Text
                style={{
                  marginLeft: 5,
                  color: "#EE4D2D",
                  fontWeight: "500",
                  fontSize: 14,
                }}
              >
                {formatPrice(
                  order.bill_info.total_amount !== null
                    ? order.bill_info.total_amount
                    : order.order_details.reduce(
                        (acc, curr) => acc + curr.product.price * curr.quantity,
                        0
                      ) + order.shipping_fee
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
          <TouchableOpacity>
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
              Mã Hóa đơn: {order.id}
            </Text>
          </TouchableOpacity>

          {order.paymentType === 1 || order.status_pay === true ? (
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
              Chờ xác nhận
            </Text>
          ) : order.paymentType === 3 ? (
            <TouchableOpacity
              onPress={() =>
                handlePaymentPayPal(order.id, calculateOrderTotal())
              }
            >
              <Text
                style={{
                  textAlign: "center",
                  width: 180,
                  backgroundColor: "#EE4D2D",
                  color: "white",
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 5,
                }}
              >
                Chờ thanh toán (PayPal)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() =>
                handlePaymentVNPay(order.id, calculateOrderTotal())
              }
            >
              <Text
                style={{
                  textAlign: "center",
                  width: 180,
                  backgroundColor: "#EE4D2D",
                  color: "white",
                  paddingTop: 10,
                  paddingBottom: 10,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 5,
                }}
              >
                Chờ thanh toán (VNPay)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* vnpay */}
        <Modal visible={isVNPAYModalVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: "http://10.0.2.2:8000/payment" }}
              injectedJavaScript={dataVNPAY}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.buttonText}>Trở về</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        {/* paypal */}
        <Modal visible={isPayPalModalVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            <WebView
              source={{ uri: "http://10.0.2.2:8000/sendpaypal/" }}
              injectedJavaScript={dataPAYPAL}
            />
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.buttonText}>Trở về</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <View style={styles.brButton11111} />
      </View>
    );
  };

  //payment
  const [isVNPAYModalVisible, setVNPAYModalVisible] = useState(false);
  const [isPayPalModalVisible, setPayPalModalVisible] = useState(false);

  const handleOpenVNPAYModal = () => {
    setVNPAYModalVisible(true);
  };

  const handleOpenPayPalModal = () => {
    setPayPalModalVisible(true);
  };

  const handleCloseModal = () => {
    setVNPAYModalVisible(false);
    setPayPalModalVisible(false);
    navigation.navigate("BillList", { user: user, refreshData: true });
  };

  const vnpayData = {
    amount: vnpayModalData.amount,
    order_desc: vnpayModalData.order_desc,
    bank_code: "NCB",
    language: "vn",
  };

  const paypalData = {
    giohang_id: paypalModalData.giohang_id,
    total_amount: paypalModalData.total_amount,
  };

  const dataVNPAY = `
      document.getElementById("amount").value = "${vnpayData.amount}";
      document.getElementById("order_desc").value = "${vnpayData.order_desc}";
      document.getElementById("bank_code").value = "${vnpayData.bank_code}";
      document.getElementById("language").value = "${vnpayData.language}";
    `;

  const dataPAYPAL = `
    document.getElementById("paypalData_giohang_id").value = "${paypalData.giohang_id}";
    document.getElementById("paypalData_total_amount").value = "${paypalData.total_amount}";
  `;

  const handlePaymentPayPal = (id, total) => {
    setPayPalModalData({
      giohang_id: id,
      total_amount: total,
    });

    setPayPalModalVisible(true);
  };

  const handlePaymentVNPay = (id, total) => {
    setVNPAYModalData({
      order_desc: id,
      amount: total,
    });

    setVNPAYModalVisible(true);
  };

  const renderItem = ({ item }) => {
    return <BillItem key={item.id} order={item} />;
  };

  return (
    <ScrollView>
      {orders.map((order) => (
        <BillItem key={order.id} order={order} />
      ))}
    </ScrollView>
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
    fontSize: 14.5,
    fontWeight: "700",
  },
  iconView: {
    position: "absolute",
    // height: 21,
    // width: 21,
    right: 0,
    color: "#EE4D2D",
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
