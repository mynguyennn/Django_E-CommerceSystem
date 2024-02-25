import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import WebView from "react-native-webview";
import { useRoute } from "@react-navigation/native";

const PaymentType = ({
  selectedShippingOption,
  totalPrice,
  formatPrice,
  navigation,
  cartItems,
  selectedPaymentType,
  setSelectedPaymentType,
  user,
  note,
  setNote,
  newOrderId,
}) => {
  // const [newOrderId, setNewOrderId] = useState();
  const [isVNPAYModalVisible, setVNPAYModalVisible] = useState(false);
  const [isPayPalModalVisible, setPayPalModalVisible] = useState(false);

  //payment
  const handleOpenVNPAYModal = () => {
    setVNPAYModalVisible(true);
  };

  const handleOpenPayPalModal = () => {
    setPayPalModalVisible(true);
  };

  const handleCloseModal = () => {
    setVNPAYModalVisible(false);
    setPayPalModalVisible(false);
    navigation.navigate("BillList", { user: user.id, refreshData: true });
  };

  const vnpayData = {
    amount:
      totalPrice +
      (selectedShippingOption ? selectedShippingOption.price_shippingType : 0),
    order_desc: newOrderId,
    bank_code: "NCB",
    language: "vn",
  };

  const paypalData = {
    giohang_id: newOrderId,
    total_amount:
      totalPrice +
      (selectedShippingOption ? selectedShippingOption.price_shippingType : 0),
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

      {/* <TouchableOpacity onPress={createOrders} style={styles.bgPayProduct1}>
          <Text style={styles.textPayProduct}>Đặt hàng</Text>
        </TouchableOpacity> */}

      {/* VNPay */}
      <TouchableOpacity style={styles.button} onPress={handleOpenVNPAYModal}>
        <Text style={styles.buttonText}>THANH TOÁN VNPAY</Text>
      </TouchableOpacity>
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

      {/* PayPal */}
      <TouchableOpacity style={styles.button} onPress={handleOpenPayPalModal}>
        <Text style={styles.buttonText}>THANH TOÁN PAYPAL</Text>
      </TouchableOpacity>
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
    </View>
  );
};

const styles = {
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
};

export default PaymentType;
