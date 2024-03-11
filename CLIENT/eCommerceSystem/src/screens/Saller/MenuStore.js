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

export default MenuStore = ({ navigation }) => {
  const route = useRoute();
  const { storeData } = route.params;
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          route={route}
          storeData={storeData}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} storeData={storeData} />
      </View>
    </View>
  );
};

const HeaderComponent = () => {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.containerHeader}>
        <View style={styles.signIn}>
          {/* <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity> */}
          <TouchableOpacity>
            <Text style={styles.textSignIn}>Shop của tôi</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation, storeData, route }) => {
  // const route = useRoute();
  const { state: refreshState } = useRefreshData();

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

  //count order & comment
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(
          endpoints.count_orders_and_comments(storeData[0].id)
        );

        setCounts(response.data);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, [refreshState]);

  return (
    <ScrollView style={{ height: "100%" }}>
      <View style={styles.bgStore}>
        {/* store info */}
        {storeData &&
          storeData.map((store, index) => (
            <View
              key={index}
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
                    store.avt
                      ? { uri: store.avt }
                      : require("../../images/chualogin.png")
                  }
                />
              </View>

              <View>
                <Text style={styles.textStore}>{store.name_store}</Text>
                <View style={styles.bgLocationSt}>
                  <Image
                    style={styles.locationShop}
                    source={require("../../images/location.png")}
                  />
                  <Text
                    style={styles.textLocation}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {store.address}
                  </Text>
                </View>
              </View>
            </View>
          ))}
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

      <View style={styles.bgAddName}>
        <View style={styles.btnAddName}>
          <Text style={styles.textAddName}>Đơn hàng</Text>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              position: "absolute",
              right: -9,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={() => {
              navigation.navigate("OrderSold", {
                storeId: storeData[0].id,
                storeData: storeData,
              });
            }}
          >
            <Text style={styles.textAddName1}>Xem lịch sử đơn hàng</Text>
            <Image
              source={require("../../images/settingnext.png")}
              style={styles.iconNext}
            ></Image>
          </TouchableOpacity>
        </View>

        <View style={styles.bgItem}>
          <TouchableOpacity
            style={styles.btnItem}
            onPress={() => {
              navigation.navigate("OrderPendingList", {
                storeId: storeData[0].id,
                storeData: storeData,
              });
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              {counts.count_orders}
            </Text>
            <Text style={{ fontSize: 12, color: "#5c5c5c", marginTop: 3 }}>
              Chờ xác nhận
            </Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.btnItem}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>0</Text>
            <Text style={{ fontSize: 12, color: "#5c5c5c", marginTop: 3 }}>
              Đơn hủy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnItem}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>0</Text>
            <Text style={{ fontSize: 12, color: "#5c5c5c", marginTop: 3 }}>
              Trả hàng
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity
            style={styles.btnItem}
            onPress={() => {
              navigation.navigate("ProductListComments", {
                storeId: storeData[0].id,
                storeData: storeData,
              });
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              {counts.count_comments}
            </Text>
            <Text style={{ fontSize: 12, color: "#5c5c5c", marginTop: 3 }}>
              Đánh giá
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.brContent}></View>

      <View style={styles.bgAddName}>
        <View style={styles.bgItem1}>
          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("StoreRevenue", {
                storeId: storeData[0].id,
                storeData: storeData,
              });
            }}
          >
            <View
              style={{
                backgroundColor: "#EBA41E",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                source={require("../../images/card.png")}
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
              Tài chính
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("ChooseStats", {
                storeId: storeData[0].id,
              });
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

          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("TagProduct", {
                storeId: storeData[0].id,
              });
            }}
          >
            <View
              style={{
                backgroundColor: "#ff0095",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                source={require("../../images/ad.png")}
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
              Quảng cáo
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bgAddName}>
        <View style={styles.bgItem11}>
          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("ProductList", {
                storeData: storeData,
              });
            }}
          >
            <View
              style={{
                backgroundColor: "#7b00e0",
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
              Sản phẩm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("ProductPending", {
                storeId: storeData,
              });
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
              Chờ duyệt
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnItem1}
            onPress={() => {
              navigation.navigate("ProductSoldOut", {
                storeId: storeData,
              });
            }}
          >
            <View
              style={{
                backgroundColor: "#F14D2F",
                padding: 5,
                borderRadius: 8,
              }}
            >
              <Image
                source={require("../../images/soldout.png")}
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
              Hết hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.brContent}></View>
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
});
