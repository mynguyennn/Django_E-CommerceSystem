import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect, useRef } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import { useLogin } from "../../context/LoginContext";

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
import { useRefreshData } from "../../context/RefreshDataContext";

const imageBanner = [
  require("../../images/banner1.png"),
  // require("../images/banner2.png"),
  // require("../images/banner3.png"),
  require("../../images/banner4.png"),
  require("../../images/banner5.png"),
  require("../../images/banner6.png"),
  require("../../images/banner7.png"),
  require("../../images/banner8.png"),
  require("../../images/banner9.png"),
];

export default MenuManager = ({ navigation }) => {
  const route = useRoute();

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent navigation={navigation} route={route} />
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
          <TouchableOpacity>
            <Text style={styles.textSignIn}>Manager e-Commerce System</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation, route }) => {
  // const route = useRoute();
  const [user, dispatch] = useLogin();

  //banner
  const [imgActive, setImgActive] = useState(0);
  const [counts, setCounts] = useState({ count_orders: 0, count_comments: 0 });

  const onChange = (event) => {
    const slideWidth = Dimensions.get("window").width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeImage = Math.floor(offset / slideWidth);
    setImgActive(activeImage);
  };
  //banner
  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextImage = (imgActive + 1) % imageBanner.length;
      setImgActive(nextImage);
      scrollViewRef.current.scrollTo({
        x: nextImage * windownWidth,
        animated: true,
      });
    }, 1500);

    return () => clearInterval(intervalId);
  }, [imgActive]);

  const scrollViewRef = useRef();
  // console.log(storeData);

  //logout
  const logout = () => {
    dispatch({
      type: "logout",
    });
    navigation.navigate("Profile");
  };

  return (
    <ScrollView style={{ height: "100%" }}>
      <View style={styles.bgStore}>
        {/* manager info */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View>
            <Image
              style={styles.avtShop}
              source={
                user.avt
                  ? { uri: user.avt }
                  : require("../../images/chualogin.png")
              }
            />
          </View>

          <View>
            <Text style={styles.textStore}>{user.full_name}</Text>
          </View>
        </View>

        {/* <TouchableOpacity style={styles.viewShop}>
          <Text style={styles.textViewShop}>Xem Shop</Text>
        </TouchableOpacity> */}
      </View>

      {/* <View style={styles.brContent}></View> */}

      {/* banner */}
      <View
        style={{
          height: 140,
          backgroundColor: "white",
          marginTop: 10,
          marginBottom: 5,
        }}
      >
        <ScrollView
          ref={scrollViewRef}
          onScroll={(event) => onChange(event)}
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          horizontal
          style={styles.wrap}
        >
          {imageBanner.map((e, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image
                resizeMode="stretch"
                style={styles.imageInScrollView}
                source={e}
              />
            </View>
          ))}
        </ScrollView>
      </View>

      {/* <View style={styles.brContent}></View> */}

      {/* <View style={styles.brContent}></View> */}

      <View style={styles.bgAddName}>
        <View style={styles.bgItem1}>
          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("ConfirmStore");
            }}
          >
            <View
              style={{
                backgroundColor: "#3DA69E",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                source={require("../../images/pending.png")}
                style={styles.iconItem}
              ></Image>
            </View>

            <Text
              style={{
                fontSize: 13,
                color: "#222222",
                marginTop: 10,
                fontWeight: "500",
              }}
            >
              Duyệt cửa hàng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("ListConfirmProduct");
            }}
          >
            <View
              style={{
                backgroundColor: "#dd3232",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                source={require("../../images/product.png")}
                style={styles.iconItem}
              ></Image>
            </View>

            <Text
              style={{
                fontSize: 13,
                color: "#222222",
                marginTop: 10,
                fontWeight: "500",
              }}
            >
              Duyệt sản phẩm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("StoreListStats");
            }}
          >
            <View
              style={{
                backgroundColor: "#0046AB",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                source={require("../../images/stats.png")}
                style={styles.iconItem}
              ></Image>
            </View>

            <Text
              style={{
                fontSize: 13,
                color: "#222222",
                marginTop: 10,
                fontWeight: "500",
              }}
            >
              Thống kê
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.brContent}></View>

      {user && (
        <>
          <TouchableOpacity style={styles.bgButtonLogin} onPress={logout}>
            <Text style={styles.textBtnLogin}>Đăng xuất</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
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
    flex: 83,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 6.5,
    // backgroundColor: "#ee4d2d",
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
    color: "#db3918",
    fontWeight: "500",
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
    height: 120,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "center",
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
    // marginTop:20,
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
    // position: "absolute",
    height: 19,
    width: 19,
    marginBottom: -2,
    marginLeft: 3,
    // right: 0,
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
    height: 22,
    width: 22,
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
  bgButtonLogin: {
    height: 43,
    borderRadius: 5,
    width: windownWidth - 230,
    marginLeft: 115,
    marginTop: 270,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EE4D2D",
    marginBottom: 20,
  },
  textBtnLogin: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
