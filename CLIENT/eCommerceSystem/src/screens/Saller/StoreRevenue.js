import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect, useRef } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDown from "react-native-dropdown-picker";
import axios, { endpoints } from "../../config/API";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default StoreRevenue = ({ navigation }) => {
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent navigation={navigation} />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} />
      </View>
    </View>
  );
};

const HeaderComponent = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.containerHeader}>
        <View style={styles.signIn}>
          <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.textSignIn}>Tài chính</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const route = useRoute();
  const { storeId } = route.params;
  const [totalRevenue, setTotalRevenue] = useState(null);

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  useEffect(() => {
    const getRevenue = async () => {
      try {
        const response = await axios.get(endpoints.get_revenue_store(storeId));
        const data = response.data;

        setTotalRevenue(data.total_revenue);
      } catch (error) {
        console.error("Error fetching total revenue:", error);
      }
    };

    getRevenue();
  }, [storeId]);

  return (
    <View>
      <View style={styles.bgAddImg}>
        <Text>Tổng số dư:</Text>
      </View>

      <View style={styles.bgAddImg}>
        <Text style={{ fontSize: 24, color: "#ee4d2d", fontWeight: "600" }}>
          {totalRevenue !== null ? formatPrice(totalRevenue) : "0đ"}
        </Text>
      </View>

      <TouchableOpacity
        style={{
          width: windownWidth - 30,
          marginLeft: 15,
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: 25,
          flexDirection: "row",
          // borderWidth: 1,
          // padding: 5,
        }}
        onPress={() => {
          navigation.navigate("TagProduct", {
            storeId: storeId,
            totalRevenue: totalRevenue,
          });
        }}
      >
        <View
          style={{
            backgroundColor: "#ee4d2d",
            padding: 5,
            borderRadius: 5,
          }}
        >
          <Image
            source={require("../../images/ad.png")}
            style={styles.iconItem}
          ></Image>
        </View>
        <View>
          <Text
            style={{
              fontSize: 15,
              marginLeft: 10,
              fontWeight: "400",
              color: "#242424",
            }}
          >
            Quảng cáo sản phẩm
          </Text>
        </View>

        <View style={{ position: "absolute", right: 0 }}>
          <Image
            source={require("../../images/settingnext.png")}
            style={styles.iconNext}
          ></Image>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const FooterComponent = () => {
  return;
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  viewHeader: {
    width: "100%",
    flex: 12,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 15,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 65,
    backgroundColor: "#EEEEEE",
    alignItems: "center",
    justifyContent: "center",
  },
  containerHeader: {
    marginTop: 40,
    // width: "100%",
    // height: "100%",
  },
  signIn: {
    height: 55,
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
    height: 23,
    width: 23,
    // marginLeft: 200,
  },
  bgIconMess: {
    position: "absolute",
    left: 20,
  },
  brContent: {
    // marginTop: 15,
    height: 10,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginRight: 10,
  },
  bgAddImg: {
    width: windownWidth - 30,
    marginLeft: 15,
    justifyContent: "center",
    marginTop: 6,
  },
  btnAddImg: {
    backgroundColor: "white",
    height: 85,
    width: 95,
    // paddingTop: 30,
    // paddingBottom: 30,
    // paddingLeft: 20,
    // paddingRight: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ee4d2d",
    alignItems: "center",
    justifyContent: "center",
  },
  textAddImg: {
    color: "#ee4d2d",
    fontSize: 13,
  },
  bgStore: {
    width: windownWidth - 20,
    marginLeft: 10,
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    // borderWidth: 1,
    margin: 10,
  },
  avtShop: {
    height: 55,
    width: 55,
    marginRight: 10,
    borderRadius: 100,
  },
  locationShop: {
    height: 15,
    width: 15,
    marginRight: 5,
  },
  textStore: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c2c2c",
  },
  bgLocationSt: {
    marginTop: 8,
    // borderWidth:1,
    flexDirection: "row",
    alignItems: "center",
  },
  textLocation: {
    fontSize: 13,
    color: "#575757",
    // borderWidth: 1,
    // width: 150
  },
  viewShop: {
    borderWidth: 1,
    borderColor: "#EE4D2D",
    padding: 5,
    width: 100,
    borderRadius: 5,
    position: "absolute",
    right: 5,
    // marginLeft: 105,
  },
  textViewShop: {
    color: "#EE4D2D",
    textAlign: "center",
  },
  imageContainer: {
    // height: 200,
    // borderRadius: 20,
    overflow: "visible",
    marginHorizontal: 5,
    width: windownWidth - 10,
    // marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageInScrollView: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    // marginTop: 10
    // justifyContent: "center",
    // alignItems: "center",
  },
  bgAddName: {
    width: windownWidth - 30,
    marginLeft: 15,
  },
  btnAddName: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 10,
    position: "relative",
  },
  textAddName: {
    fontSize: 14,
    fontWeight: "500",
  },
  textAddName1: {
    fontSize: 13,
    color: "#777777",
  },
  iconNext: {
    height: 19,
    width: 19,
    // marginBottom: -2,
    // marginLeft: 3,
  },
  bgItem: {
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    width: windownWidth - 30,
    marginLeft: 5,
  },
  bgItem1: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 15,
    width: windownWidth - 40,
    marginLeft: 20,
  },
  bgItem11: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 15,
    width: windownWidth - 40,
    marginLeft: 20,
  },
  btnItem: {
    // borderWidth: 1,
    height: 75,
    width: 85,
    marginRight: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconItem: {
    height: 20,
    width: 20,
  },
  btnItem1: {
    height: 85,
    width: 100,
    // marginLeft: 30,
    marginRight: 30,
    // backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
