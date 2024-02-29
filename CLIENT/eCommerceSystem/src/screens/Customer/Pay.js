import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, Alert, Modal } from "react-native";
import axios, { endpoints } from "../../config/API";

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { useRoute } from "@react-navigation/native";
import { useLogin } from "../../context/LoginContext";
import WebView from "react-native-webview";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default Pay = ({ navigation }) => {
  const route = useRoute();
  const { totalPrice, cartItems, itemCount } = route.params;
  const [newOrderId, setNewOrderId] = useState();

  const [user, dispatch] = useLogin();
  const [note, setNote] = useState();

  const [selectedShippingOption, setSelectedShippingOption] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [productByStore, setProductByStore] = useState({});

  console.log("cartItems========", cartItems);

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
          note={note}
          setNote={setNote}
          user={user}
          navigation={navigation}
          totalPrice={totalPrice}
          formatPrice={formatPrice}
          cartItems={cartItems}
          itemCount={itemCount}
          selectedShippingOption={selectedShippingOption}
          setSelectedShippingOption={setSelectedShippingOption}
          selectedPaymentType={selectedPaymentType}
          setSelectedPaymentType={setSelectedPaymentType}
          setNewOrderId={setNewOrderId}
          productByStore={productByStore}
          setProductByStore={setProductByStore}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent
          note={note}
          setNote={setNote}
          user={user}
          navigation={navigation}
          totalPrice={totalPrice}
          formatPrice={formatPrice}
          cartItems={cartItems}
          itemCount={itemCount}
          selectedShippingOption={selectedShippingOption}
          setSelectedShippingOption={setSelectedShippingOption}
          selectedPaymentType={selectedPaymentType}
          setSelectedPaymentType={setSelectedPaymentType}
          newOrderId={newOrderId}
          productByStore={productByStore}
          setProductByStore={setProductByStore}
          setNewOrderId={setNewOrderId}
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
          <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={styles.textSignIn}>Thanh toán</Text>
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
      {/* <View style={styles.brButton6}></View> */}
    </View>
  );
};

const ContentComponent = ({
  selectedShippingOption,
  setSelectedShippingOption,
  selectedPaymentType,
  setSelectedPaymentType,
  totalPrice,
  formatPrice,
  cartItems,
  user,
  note,
  setNote,
  setNewOrderId,
  navigation,
  productByStore,
  setProductByStore,
}) => {
  const [shippingTypeId, setShippingTypeId] = useState([]);
  const [modalVisibleShip, setModalVisibleShip] = useState(false);

  const [paymentTypeId, setPaymentTypeId] = useState([]);
  const [modalVisiblePayment, setModalVisiblePayment] = useState(false);

  //api ShippingTypes
  const fetchShippingTypes = async () => {
    try {
      const response = await axios.get(endpoints.shippingTypes);
      const shippingTypes = response.data;
      setShippingTypeId(shippingTypes);
      // console.log("Shipping Types:", shippingTypes);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu shippingTypes:", error);
    }
  };
  //api PaymentTypes
  const fetchPaymentTypes = async () => {
    try {
      const response = await axios.get(endpoints.paymentTypes);
      const paymentTypes = response.data;
      setPaymentTypeId(paymentTypes);
      // console.log("Payment Types==========:", paymentTypes);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu paymentTypes:", error);
    }
  };

  useEffect(() => {
    fetchShippingTypes();
    fetchPaymentTypes();
  }, []);

  //product by store
  useEffect(() => {
    // product by store
    const updatedProductByStore = {};

    cartItems.forEach((item) => {
      const storeId = item.store_info.id;
      if (!updatedProductByStore[storeId]) {
        updatedProductByStore[storeId] = [item];
      } else {
        updatedProductByStore[storeId].push(item);
      }
    });

    setProductByStore(updatedProductByStore);
  }, [cartItems]);

  // console.log(cartItems);

  // item product
  const CartItem = ({ items }) => (
    <View>
      {/* info */}
      {items[0].store_info.name_store && (
        <View>
          <TouchableOpacity style={styles.bgNameShop}>
            <Image
              source={require("../../images/shop.png")}
              style={styles.iconShop}
            ></Image>
            <Text style={styles.textShop}>
              {items[0].store_info.name_store}
            </Text>
          </TouchableOpacity>
          {/* <View style={styles.brButton2}></View> */}
        </View>
      )}

      {/* <View style={styles.brButton2}></View> */}

      {items.map((item, index) => (
        <View key={index}>
          <View style={styles.brButton2}></View>
          {/* <View style={[styles.brButton2, { marginTop: 5 }]}></View> */}

          <View style={styles.bgInfoShop}>
            <TouchableOpacity style={styles.bgImgProduct}>
              <Image
                source={{ uri: item.images[0].thumbnail }}
                style={styles.imgProdcut}
              ></Image>
            </TouchableOpacity>

            <View style={{ width: "70%" }}>
              <TouchableOpacity>
                <Text
                  style={styles.textNamePr}
                  // numberOfLines={1}
                  // ellipsizeMode="tail"
                >
                  <Text style={styles.textNamePr}>{item.name_product}</Text>
                </Text>
              </TouchableOpacity>

              <Text style={styles.textPricePr}>{formatPrice(item.price)}</Text>
            </View>

            <Text
              style={{
                color: "#555555",
                position: "absolute",
                bottom: 10,
                right: 10,
              }}
            >
              x{item.quantity}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.brButton2}></View>

      <View style={styles.bgVoucher}>
        <TouchableOpacity style={styles.bgFreeShip}>
          <Image
            source={require("../../images/voucher.png")}
            style={styles.iconVoucher}
          ></Image>
          <Text>Voucher của shop</Text>

          <Image
            source={require("../../images/settingnext.png")}
            style={styles.iconView}
          ></Image>
        </TouchableOpacity>
      </View>
      <View style={styles.brButton2}></View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 7,
          paddingTop: 7,
          paddingLeft: 15,
          paddingRight: 15,
        }}
      >
        <View>
          <Text>Tin nhắn:</Text>
        </View>
        <TextInput
          style={styles.textName}
          placeholder="Lưu ý cho người bán..."
          placeholderTextColor="#aaa9a9"
          onChangeText={(text) => setNote(text)}
        />
      </View>

      <View style={styles.brButton2}></View>

      {/* <View style={styles.brButton2}></View> */}

      {/* <View style={styles.brButton2}></View> */}

      {/* <View style={styles.brButton2}></View> */}

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 13,
          paddingTop: 13,
          paddingLeft: 15,
          paddingRight: 15,
        }}
      >
        <View>
          <Text style={{ fontSize: 14, fontWeight: "500" }}>
            Tổng số tiền ({items.length} sản phẩm):
          </Text>
        </View>

        <View>
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#EE4D2D" }}>
            {formatPrice(
              items.reduce(
                (total, item) => total + item.quantity * item.price,
                0
              )
            )}
          </Text>
        </View>
      </View>

      <View style={styles.brButton1}></View>

      {/* <View style={styles.brButton1}></View> */}
    </View>
  );

  return (
    <ScrollView>
      <View style={styles.brButton1}></View>

      <View
        style={{
          flexDirection: "row",
          width: windownWidth - 20,
          marginLeft: 10,
          marginTop: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ width: "10%" }}>
          <Image
            source={require("../../images/locationbill.png")}
            style={styles.iconShop}
          ></Image>
        </View>

        <View style={{ width: "90%" }}>
          <Text style={{ fontWeight: "500", fontSize: 14 }}>
            Địa chỉ nhận hàng
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: windownWidth - 20,
          marginLeft: 10,
          marginTop: 10,
          marginBottom: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ width: "10%" }}></View>

        <View style={{ width: "90%" }}>
          <Text style={{ fontSize: 14 }}>{user.full_name}</Text>
          <Text style={{ fontSize: 14 }}>(+84) {user.phone}</Text>
          <Text style={{ fontSize: 14 }}>{user.address}</Text>
        </View>
      </View>

      <View style={styles.brButton1}></View>

      {/* product */}
      {Object.values(productByStore).map((items, index) => (
        <CartItem key={index} items={items} />
      ))}

      <View style={styles.brButton2}></View>

      {/* paymentType */}
      <TouchableOpacity
        onPress={() => setModalVisibleShip(true)}
        style={{
          borderColor: "#00caca",
          borderWidth: 0.5,
          height: 80,
          // alignItems: "center",
          backgroundColor: "#F6FEFE",
        }}
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisibleShip}
          onRequestClose={() => setModalVisibleShip(false)}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                width: 300,
                backgroundColor: "#f3f3f3",
                padding: 10,
                borderRadius: 10,
              }}
            >
              {/* <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Chọn phương thức vận chuyển (Nhấn để chọn)
              </Text> */}
              {shippingTypeId.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => {
                    setSelectedShippingOption(option);
                    // setShippingTypeId(option.id);
                    setModalVisibleShip(false);
                  }}
                  style={{
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#5e5e5e",
                      fontWeight: "500",
                      marginLeft: 20,
                      marginRight: 20,
                    }}
                  >
                    {option.name_shippingType}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#5e5e5e",
                      fontWeight: "500",
                      marginLeft: 20,
                      marginRight: 20,
                    }}
                  >
                    {formatPrice(option.price_shippingType)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        <View
          style={{
            width: windownWidth - 30,
            marginLeft: 15,
            flexDirection: "row",
            alignItems: "center",
            // marginTop: 20,
          }}
        >
          {/* <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Chọn phương thức vận chuyển (Nhấn để chọn)
              </Text> */}
          <Text style={{ color: "#00AC97", fontSize: 14, marginTop: 30 }}>
            {selectedShippingOption
              ? selectedShippingOption.name_shippingType
              : "Chọn phương thức vận chuyển (Nhấn để chọn)"}
          </Text>

          {/* <Text style={{ color: "#00AC97", fontSize: 14, marginBottom: 10 }}>
            Chọn phương thức vận chuyển (Nhấn để chọn)
          </Text> */}
          {selectedShippingOption && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                position: "absolute",
                right: 0,
              }}
            >
              <Text style={{ fontSize: 14, marginRight: 15, marginTop: 30 }}>
                {formatPrice(selectedShippingOption.price_shippingType)}
              </Text>
              <Image
                source={require("../../images/settingnext.png")}
                style={styles.iconView1}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.bgVoucher}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisiblePayment}
          onRequestClose={() => setModalVisiblePayment(false)}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <View
              style={{
                width: 300,
                backgroundColor: "#f3f3f3",
                padding: 10,
                borderRadius: 10,
              }}
            >
              {paymentTypeId.map((paymentType) => (
                <TouchableOpacity
                  key={paymentType.id}
                  onPress={() => {
                    setSelectedPaymentType(paymentType);
                    // setShippingTypeId(option.id);
                    setModalVisiblePayment(false);
                  }}
                  style={{
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#5e5e5e",
                      fontWeight: "500",
                      marginLeft: 20,
                      marginRight: 20,
                    }}
                  >
                    {paymentType.name_paymentType}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
        <TouchableOpacity
          style={styles.bgFreeShip11}
          onPress={() => setModalVisiblePayment(true)}
        >
          <Image
            source={require("../../images/dollar.png")}
            style={styles.iconVoucher111}
          />
          <Text style={{ marginRight: 15, position: "absolute", left: 30 }}>
            Phương thức thanh toán
          </Text>
          <Text style={{ fontSize: 14, color: "#949494" }}>
            {selectedPaymentType
              ? selectedPaymentType.name_paymentType
              : "Vui lòng chọn"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.brButton111}>
        <Text style={{ fontSize: 12, color: "#888888", fontWeight: "500" }}>
          Không đồng kiểm (?)
        </Text>
      </View>

      <View style={styles.brButton1}></View>

      <View
        style={{
          flexDirection: "row",
          width: windownWidth - 20,
          marginLeft: 13,
          marginTop: 10,
          // justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Image
            source={require("../../images/bill.png")}
            style={styles.iconVoucher111}
          ></Image>
        </View>

        <View>
          <Text style={{ fontSize: 14, marginLeft: 8 }}>
            Chi tiết thanh toán
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          width: windownWidth - 30,
          marginLeft: 15,
          marginTop: 10,
          marginBottom: 10,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 4,
              paddingTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, color: "#555555" }}>
              Tổng tiền hàng
            </Text>

            <Text style={{ fontSize: 13, color: "#555555" }}>
              {formatPrice(totalPrice)}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 4,
              paddingTop: 4,
            }}
          >
            <Text style={{ fontSize: 13, color: "#555555" }}>
              Tổng tiền giá vận chuyển
            </Text>
            <Text style={{ fontSize: 13, color: "#555555" }}>
              {selectedShippingOption
                ? formatPrice(selectedShippingOption.price_shippingType)
                : "0 ₫"}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: 4,
              paddingTop: 4,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: "500" }}>
              Tổng thanh toán
            </Text>
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#EE4D2D" }}>
              {formatPrice(
                totalPrice +
                  (selectedShippingOption
                    ? selectedShippingOption.price_shippingType
                    : 0)
              )}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.brButton1}></View>
    </ScrollView>
  );
};

const FooterComponent = ({
  selectedShippingOption,
  totalPrice,
  formatPrice,
  productByStore,
  setProductByStore,
  selectedPaymentType,
  setNewOrderId,
  note,
  user,
  navigation,
}) => {
  //create order
  const createOrders = async () => {
    try {
      let finalOrderId;

      for (const storeId in productByStore) {
        const storeItems = productByStore[storeId];

        const formData = new FormData();
        const totalShip = selectedShippingOption
          ? selectedShippingOption.price_shippingType
          : 0;

        formData.append("shipping_address", user.address);
        formData.append("shipping_fee", totalShip);
        formData.append("note", note);
        formData.append("account_id", user.id);
        formData.append("paymentType_id", selectedPaymentType.id);
        formData.append("shippingType_id", selectedShippingOption.id);

        const response = await axios.post(endpoints.create_order, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log(
          "Đơn đặt hàng đã được tạo cho cửa hàng",
          storeId,
          ":",
          response.data
        );
        const newId = response.data.id;
        finalOrderId = newId;
        await createOrderDetails(newId, storeItems);

        if (selectedPaymentType.id === 1) {
          await createBill(newId, totalShip);
        }
      }

      setNewOrderId(finalOrderId);

      navigation.navigate("ChooseBill", {});
    } catch (error) {
      console.error("Lỗi khi tạo đơn đặt hàng:", error);
    }
  };

  // order details
  const createOrderDetails = async (orderId, items) => {
    try {
      const formData = new FormData();

      for (const item of items) {
        formData.append("product_id[]", item.id);
        formData.append("quantity[]", item.quantity);
      }

      await axios.post(endpoints.create_orderdetail(orderId), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("OrderDetails đã được tạo thành công cho cửa hàng", orderId);
    } catch (error) {
      console.error("Lỗi khi tạo OrderDetails:", error);
    }
  };

  // create bill
  const createBill = async (orderId, totalShip) => {
    try {
      const formData = new FormData();
      formData.append("total_amount", totalPrice + totalShip);
      formData.append("order_id", orderId);

      await axios.post(endpoints.create_bill, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("total====", totalPrice + totalShip);
      console.log("Bill đã được tạo thành công cho đơn hàng", orderId);
    } catch (error) {
      console.error("Lỗi khi tạo Bill:", error);
    }
  };

  return (
    <View style={styles.bgPayProduct}>
      <View style={styles.bgIconChat}>
        <Text style={styles.textIconChat}>Tổng thanh toán:</Text>
        <Text style={styles.textTotalPay}>
          {formatPrice(
            totalPrice +
              (selectedShippingOption
                ? selectedShippingOption.price_shippingType
                : "0 ₫")
          )}
        </Text>
      </View>

      <TouchableOpacity onPress={createOrders} style={styles.bgPayProduct1}>
        <Text style={styles.textPayProduct}>Đặt hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  viewHeader: {
    width: "100%",
    flex: 12.9,
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
    flex: 5.5,
    // borderWidth: 1,
    width: "100%",
    // flex: 0,
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
  brButton111: {
    width: windownWidth - 30,
    marginLeft: 15,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 1,
    // width: "100%",
    backgroundColor: "#FAFAFA",
    // borderWidth: 1,
    // justifyContent: "sta",
    // alignItems: "center",
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
    marginBottom: 2,
    marginTop: 2,
  },
  bgFreeShip11: {
    padding: 4,
    paddingBottom: 10,
    paddingTop: 10,
    flexDirection: "row",
    width: windownWidth - 20,
    marginLeft: 10,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    marginTop: 2,
    // borderWidth: 1,
  },
  iconFreeShip: {
    height: 27,
    width: 27,
    marginRight: 15,
  },
  bgNameShop: {
    flexDirection: "row",
    width: windownWidth - 30,
    marginLeft: 15,
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
    fontSize: 14,
    fontWeight: "600",
  },
  iconView: {
    position: "absolute",
    height: 21,
    width: 21,
    right: 0,
  },
  iconView1: {
    // position: "absolute",
    height: 21,
    width: 21,
    marginTop: 30,
    // marginLeft: 10,
    // marginRight: 5,
    // right: 100,
  },
  iconView111: {
    position: "absolute",
    height: 15,
    width: 15,
    right: 0,
  },
  bgInfoShop: {
    flexDirection: "row",
    // width: windownWidth - 20,
    // marginLeft: 10,
    // marginTop: 20,
    // marginBottom: 20,
    paddingTop: 8,
    paddingBottom: 8,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1,
    backgroundColor: "#FAFAFA",
  },
  imgProdcut: {
    height: 80,
    width: 80,
    borderRadius: 5,
  },
  bgImgProduct: {
    paddingTop: 5,
    paddingBottom: 5,
    marginRight: 20,
    // borderWidth: 1,
    paddingLeft: 5,
    width: "20%",
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
    // borderWidth: 1,
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
    // borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 15,
    paddingLeft: 15,
    paddingRight: 15,
  },
  textNamePr: {
    // maxWidth: "85%",
    fontSize: 14,
    marginRight: 20,
    paddingLeft: 10,
    // borderWidth: 1,
  },
  textPricePr: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "500",
    color: "#EE4D2D",
    marginRight: 20,
    paddingLeft: 10,
  },
  iconVoucher: {
    height: 23,
    width: 23,
    marginRight: 10,
  },
  iconVoucher111: {
    height: 20,
    width: 20,
    // marginRight: 15,
  },

  //footer
  bgPayProduct: {
    flex: 1,
    // height: "auto",
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
    fontSize: 15,
    fontWeight: "500",
  },
  brFooterPay: {
    width: 1,
    backgroundColor: "#ebebeb",
    // marginRight: 10,
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
  button: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
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
