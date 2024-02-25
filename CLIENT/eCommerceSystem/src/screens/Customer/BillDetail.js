import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, StyleSheet, Image } from "react-native";
import axios, { endpoints } from "../../config/API";
import { LoginContext } from "../../../App";

const BillDetail = ({ route }) => {
  const [user, dispatch] = useContext(LoginContext);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(endpoints.get_orders_by_account, {
          params: {
            account_id: user.id,
          },
        });

        setOrders(response.data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [user.id]);

  return (
    <ScrollView>
      <View style={styles.container}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderContainer}>
            <Text style={styles.orderHeader}>Order ID: {order.id}</Text>
            <Text>Shipping Address: {order.shipping_address}</Text>
            <Text>Note: {order.note}</Text>
            <Text>Shipping Fee: {order.shipping_fee}</Text>
            <Text>Status Pay: {order.status_pay ? "Rồi" : "Chưa"}</Text>
            <Text>Status Review: {order.status_review ? "Rồi" : "Chưa"}</Text>
            <Text>Status Order: {order.status_order ? "Rồi" : "Chưa"}</Text>
            <Text>Created At: {order.created_at}</Text>
            <Text>Payment Type: {order.paymentType.name_paymentType}</Text>
            <Text>Shipping Type: {order.shippingType.name_shippingType}</Text>

            <Text style={styles.orderDetailsHeader}>Order Details:</Text>
            {order.order_details.map((orderDetail) => (
              <View key={orderDetail.id} style={styles.orderDetailContainer}>
                {orderDetail.product.images.length > 0 && (
                  <Image
                    style={{ width: 100, height: 100 }}
                    source={{ uri: orderDetail.product.images[0].thumbnail }}
                  />
                )}
                <Text>Product Name: {orderDetail.product.name_product}</Text>
                <Text>Price: {orderDetail.product.price}</Text>
                <Text>Quantity: {orderDetail.quantity}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default BillDetail;

const styles = StyleSheet.create({
  container: {
    marginTop: 50,
    flex: 1,
    padding: 16,
    width: "100%",
  },
  orderContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 16,
  },
  orderHeader: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  orderDetailsHeader: {
    fontWeight: "bold",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  orderDetailContainer: {
    marginLeft: 16,
    marginTop: 8,
  },
});
