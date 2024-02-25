import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
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
import DropDown from "react-native-dropdown-picker";
import { LoginContext } from "../../../App";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ChooseBill = ({ navigation }) => {
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent navigation={navigation} />
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

const HeaderComponent = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>Đơn mua</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const [user, dispatch] = useContext(LoginContext);

  return (
    <View>
      <View
        style={{
          // flex: 1,
          // borderWidth: 1,
          backgroundColor: "white",
          paddingLeft: 15,
          paddingTop: 15,
        }}
      >
        <Text style={{ fontWeight: "500", fontSize: 14.5, color: "#363636" }}>
          Chọn loại hóa đơn:
        </Text>
      </View>
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          padding: 15,
        }}
      >
        <TouchableOpacity
          style={styles.btnItem1}
          onPress={() => {
            navigation.navigate("BillList", { user: user.id });
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 5,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#b8b8b8",
            }}
          >
            <Image
              source={require("../../images/bill1.png")}
              style={styles.iconItem1}
            ></Image>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#2e2e2e",
              marginTop: 10,
              fontWeight: "500",
            }}
          >
            Chờ xác nhận
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnItem1}
          onPress={() => {
            navigation.navigate("BillConfirm", {
              user: user.id,
              // refreshData: true,
            });
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              padding: 5,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#b8b8b8",
            }}
          >
            <Image
              source={require("../../images/bill2.png")}
              style={styles.iconItem}
            ></Image>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: "#2e2e2e",
              marginTop: 10,
              fontWeight: "500",
            }}
          >
            Đã giao hàng
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const FooterComponent = ({ navigation }) => {
  return;
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  viewHeader: {
    width: "100%",
    flex: 11.7,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 88.3,
    // marginTop: 1,

    backgroundColor: "#EEEEEE",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 0,
    backgroundColor: "white",
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
  iconBack: {
    height: 25,
    width: 25,
    // marginLeft: 200,
  },
  bgIconMess: {
    position: "absolute",
    left: 20,
  },
  brButton6: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
    // paddingBottom: 10
  },
  bgItem: {
    marginTop: 20,
    // borderWidth: 1,
    width: 150,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EE4D2D",
    borderRadius: 10,
    // padding: 10
    margin: 10,
  },
  iconItem: {
    height: 25,
    width: 25,
  },
  iconItem1: {
    height: 28,
    width: 28,
  },
  btnItem1: {
    height: 85,
    width: 100,
    // marginLeft: 10,
    // marginRight: 30,
    // backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
