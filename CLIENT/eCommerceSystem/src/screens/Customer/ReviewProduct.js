import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import { useRefreshData } from "../../context/RefreshDataContext";

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
import { Rating, AirbnbRating } from "react-native-ratings";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ReviewProduct = ({ navigation }) => {
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
          {/* <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity> */}
          <TouchableOpacity>
            <Text style={styles.textSignIn}>Đánh giá sản phẩm</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const route = useRoute();
  const { dispatch } = useRefreshData();

  const { userId, orderDetailId, imageProduct, nameProduct } = route.params;
  const [rating, setRating] = useState("3");
  const [content, setContent] = useState("");

  //   console.log(userId, orderDetailId);

  ratingCompleted = (rating) => {
    setRating(rating);
  };

  //add cmt product
  const handleComment = async () => {
    try {
      if (!content || content.trim() === "") {
        alert("Vui lòng nhập nội dung đánh giá!");
      } else {
        const formData = new FormData();
        formData.append("account_id", userId);
        formData.append("rating", rating);
        formData.append("content", content);

        const response = await axios.post(
          `/comments/${orderDetailId}/add_comment_product/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // console.log(response.data);
        dispatch({ type: "REFRESH_DATA_ADDCMT" });

        Alert.alert("Thành công", "Bình luận đã được thêm.");

        navigation.navigate("BillConfirm", { user: userId });
      }
    } catch (error) {
      console.error("Lỗi khi thêm bình luận:", error);
    }
  };

  return (
    <View>
      <View style={{ width: windownWidth - 20, marginLeft: 10 }}>
        <View style={styles.bgInfoShop}>
          <View style={styles.bgImgProduct}>
            <Image source={{ uri: imageProduct }} style={styles.imgProdcut} />
          </View>

          <View style={styles.bgInfoProduct}>
            <View>
              <Text style={styles.textNamePr}>{nameProduct}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.brButton2} />

      <View style={{ width: windownWidth - 20, marginLeft: 10 }}>
        <View style={styles.bgInfoShop11}>
          <View>
            <Text style={{ fontWeight: "500", fontSize: 14.5 }}>
              Chất lượng sản phẩm
            </Text>
          </View>

          <View style={styles.bgInfoProduct}>
            <View>
              <AirbnbRating
                onFinishRating={this.ratingCompleted}
                // ratingContainerStyle={styles.ratingContainer}
                // ratingStyle={styles.rating}
                // starContainerStyle={styles.starContainer}
                starStyle={styles.star}
                // showRating={false}
                reviewSize={15}
                reviews={[
                  "Tệ",
                  "Không hài lòng",
                  "Bình thường",
                  "Hài lòng",
                  "Tuyệt vời",
                ]}
              />
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          marginTop: 10,
          width: windownWidth - 30,
          marginLeft: 15,
          backgroundColor: "#ececec",
          height: 150,
          borderWidth: 0.5,
          borderColor: "#bdbdbd",
          borderRadius: 10,
        }}
      >
        <TextInput
          style={{
            // borderWidth: 1,
            height: "100%",
            marginLeft: 20,
            marginRight: 20,
          }}
          placeholder="Hãy chia sẻ nhận xét cho sản phẩm này bạn nhé!"
          autoCapitalize="none"
          placeholderTextColor="#969696"
          onChangeText={(text) => setContent(text)}
        ></TextInput>
      </View>

      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginTop: 30,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#EE4D2D",
            height: 45,
            width: 140,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={handleComment}
        >
          <Text style={{ color: "white", fontWeight: "500", fontSize: 15 }}>
            Gửi
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

    // backgroundColor: "#EEEEEE",
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
  imgProdcut: {
    height: 50,
    width: 50,
    borderWidth: 0.2,
    borderColor: "gray",
    borderRadius: 5,
    marginRight: 15,
  },
  bgInfoShop: {
    flexDirection: "row",
    // width: windownWidth - 20,
    // marginLeft: 10,
    marginTop: 15,
    marginBottom: 15,
    alignItems: "center",
    // borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
  },
  bgInfoShop11: {
    flexDirection: "row",
    // width: windownWidth - 20,
    // marginLeft: 10,
    marginTop: 15,
    marginBottom: 15,
    alignItems: "center",
    // borderWidth: 1,
    justifyContent: "space-around",
    alignItems: "center",
    // backgroundColor: "red",
  },
  textNamePr: {
    width: 300,
    fontSize: 14,
    // borderWidth: 1,
  },
  brButton2: {
    height: 1.5,
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
  ratingContainer: {
    paddingVertical: 8,
  },
  rating: {
    paddingVertical: 4,
  },
  reviews: {
    fontSize: 14,
    color: "black", // Default color for reviews
    textAlign: "center",
  },
  starContainer: {
    justifyContent: "center",
    flexDirection: "row",
  },
  // Customize the star size and color
  star: {
    width: 20, // Customize the width of the stars
    height: 20, // Customize the height of the stars
  },
  // Custom styles for specific reviews
});
