import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios, { endpoints, authApi } from "../../config/API";
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
import { useRoute } from "@react-navigation/native";
import { AirbnbRating, Rating } from "react-native-ratings";
import { LoginContext } from "../../../App";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default MyReviewProduct = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>Đánh giá của tôi</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const [productList, setProductList] = useState([]);
  const [user, dispatch] = useContext(LoginContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.comments_get_byUser, {
          params: {
            user_id: user.id,
          },
        });

        setProductList(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          {productList.comments &&
            productList.comments.map((comment, index) => (
              <View key={index}>
                {/* product */}

                <View
                  style={{
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "row",
                    marginTop: 20,
                    marginBottom: 10,
                  }}
                >
                  <Image
                    source={{
                      uri: comment.product_info.images[0].thumbnail,
                    }}
                    style={{
                      //   borderWidth: 1,
                      width: 70,
                      height: 70,
                      borderRadius: 5,
                    }}
                  />
                  <Text
                    style={{
                      color: "#d40000",
                      fontWeight: "500",
                      fontSize: 13,
                      marginLeft: 20,
                      width: 170,
                    }}
                  >
                    {comment.product_info.name_product}
                  </Text>
                </View>
                <View style={styles.brButton66}></View>

                {/* comments */}
                <View style={{ marginTop: 20, width: "100%", marginLeft: 15 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 0,
                      marginBottom: 20,
                      height: 120,
                    }}
                  >
                    <View>
                      <Image
                        source={{ uri: comment.account_info.avt }}
                        style={styles.iconShop}
                      ></Image>
                    </View>
                    <View
                      style={{
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        // borderWidth: 1,
                        width: "85%",
                      }}
                    >
                      <Text style={styles.textShop}>
                        {comment.account_info.full_name} - [ Customer ]
                      </Text>
                      <Rating
                        type="star"
                        ratingCount={5}
                        fractions={1}
                        jumpValue={1}
                        startingValue={comment.rating}
                        imageSize={13}
                        readonly={true}
                      />
                      <Text
                        style={{
                          color: "#636363",
                          fontSize: 14,
                          marginTop: 10,
                          marginBottom: 20,
                          width: "80%",
                        }}
                      >
                        [{comment.id}] - {comment.content}
                      </Text>
                      <Text
                        style={{
                          color: "#636363",
                          fontSize: 11,
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                        }}
                      >
                        {comment.created_at}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.brButton6}></View>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
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

    backgroundColor: "white",
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
    height: 20,
    width: "100%",
    backgroundColor: "#F2F2F2",
    // paddingBottom: 10
  },
  brButton6666: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
    marginTop: 20,
    // paddingBottom: 10
  },
  brButton666: {
    height: 10,
    width: "100%",
    backgroundColor: "#F2F2F2",
    // paddingBottom: 10
  },
  brButton66: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
    marginBottom: 10,
  },
  bgButton: {
    height: 43,
    width: "90%",
    textAlign: "center",
    backgroundColor: "#ee4d2d",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 27,
  },
  containerContent: {
    // borderWidth: 1,
    // height: "80%",
    // width: "100%",
    // backgroundColor: "#eeeeee",
    // justifyContent: "center",
  },
  productRowContainer: {
    // flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
    // flexWrap: "wrap",
    // width: windownWidth - 15,
    // marginLeft: 8,
    // marginTop: 5,
    // marginBottom: "26%",
    // height: "100%",
    // borderWidth: 1
    // marginBottom: 5,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent:'center',
    borderColor: "#eeeeee",
    // height: 50,
    width: "100%",
    backgroundColor: "white",
    // position: "relative",
    // borderRadius: 5,
    borderWidth: 10,
    padding: 10,
    // marginBottom: 7,
  },
  nameProduct: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
    width: "95%",
    // padding: 10,
    // paddingBottom: 15,
    // marginTop: 15,
  },
  btnUpdate: {
    backgroundColor: "#d40000",
    height: 30,
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#d40000",
    marginRight: 20,
  },
  btnDelete: {
    backgroundColor: "#d40000",
    height: 30,
    width: 57,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d40000",
    marginRight: 10,
  },
  priceProduct: {
    color: "#EE4D2D",
    fontWeight: "400",
    fontSize: 13,
    marginBottom: 5,
    marginTop: 3,
    // borderWidth: 5,
    // position: "absolute",
    // bottom: 7,
    // left: 10,
  },
  priceProductSold: {
    color: "#252525",
    fontWeight: "400",
    fontSize: 12,
    // borderWidth: 5,
    // position: "absolute",
    // bottom: 8,
    // right: 10,
  },
  bgRating1: {
    // marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  textReviewPr: {
    // color: "",
    marginLeft: 10,
    fontWeight: "400",
    fontWeight: "500",
    fontSize: 18,
  },
  textReviewPr1: {
    color: "#575757",
    marginLeft: 10,
    fontWeight: "400",
    fontSize: 12,
  },
  textReviewPr111: {
    color: "gray",
    // marginLeft: 5,
    marginRight: 10,
    fontWeight: "400",
    fontSize: 13,
  },
  iconShop: {
    height: 20,
    width: 20,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconShop111: {
    height: 23,
    width: 23,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconShop1111: {
    height: 26,
    width: 26,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconShop11111: {
    height: 23,
    width: 23,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  textShop: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
});
