import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment-timezone";

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Modal,
} from "react-native";
import DropDown from "react-native-dropdown-picker";
import axios, { endpoints } from "../../config/API";


const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default TagProduct = ({ navigation }) => {
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent navigation={navigation} />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent />
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
            <Text style={styles.textSignIn}>Quảng cáo sản phẩm</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const route = useRoute();
  const { storeId, totalRevenue } = route.params;
  // const storeId = 20;
  const today = new Date();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [showModal, setShowModal] = useState(false);
  //call api product
  const fetchData = async () => {
    try {
      const response = await axios.get(endpoints.list_products_tag(storeId));
      setProducts(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // modal tag
  const toggleModal = (product, isAdding) => {
    setSelectedProduct(product);
    setIsAddingTag(isAdding);
    setModalVisible(true);
  };

  //show startDate - endDate

  const showEndDatePickers = () => {
    setShowModal(true);
  };

  const handleEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === "ios");
    setShowModal(false);
    setEndDate(currentDate);
  };

  //save tag
  const handleSaveTag = async () => {
    try {
      const formData = new FormData();

      formData.append("tag_start_date", startDate.toISOString().split(".")[0]);
      formData.append("tag_end_date", endDate.toISOString().split(".")[0]);

      console.log(startDate, endDate);

      const response = await axios.post(
        endpoints.add_tag(selectedProduct),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Tag add:", response.data);
      fetchData();
      setModalVisible(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error tag:", error);
    }
  };

  // remove tag
  const handleRemoveTag = (product) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa tag?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              const response = await axios.post(endpoints.remove_tag(product));
              console.log("product vua xoa tag", product);
              console.log("Tag remove:", response.data);
              fetchData();
            } catch (error) {
              console.error("Error tag:", error);
            } finally {
              setModalVisible(false);
              setSelectedProduct(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  //kiem tra data
  const isTagExpired = (tagEndDate) => {
    const currentDate = new Date();
    return currentDate > new Date(tagEndDate);
  };

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          {products && products.length > 0 ? (
            products.map((product) => {
              return (
                <View key={product.id} style={styles.productContainer}>
                  <TouchableOpacity
                    style={{
                      width: "30%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderRadius: 5,
                      borderColor: "#cecece",
                    }}
                  >
                    <Image
                      style={{ width: "95%", height: "95%" }}
                      source={{ uri: product.images[0].thumbnail }}
                    />

                    {/* tag */}
                    {product.tag === true && (
                      <View
                        style={{
                          position: "absolute",
                          top: -14,
                          right: 0,
                          zIndex: 1,
                        }}
                      >
                        <Animatable.View
                          animation="flash"
                          iterationCount="infinite"
                          duration={2000}
                        >
                          <Image
                            source={require("../../images/hot1.png")}
                            style={[
                              styles.newTag,
                              { transform: [{ rotate: "33deg" }] },
                            ]}
                          ></Image>
                        </Animatable.View>
                      </View>
                    )}

                    {/* modal tag */}
                    {selectedProduct && (
                      <Modal isVisible={isModalVisible} transparent={true}>
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "#f3f3f3",
                              padding: 10,
                              borderRadius: 10,
                              width: "80%",
                              borderColor: "#bbbbbb",
                              // borderWidth: 1,
                              height: "26%",
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: 7,
                                marginBottom: 10,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 17,
                                  fontWeight: "bold",
                                  // marginBottom: 10,
                                  marginRight: 10,
                                }}
                              >
                                Chọn thời gian gắn Tag Hot
                              </Text>

                              <Image
                                source={require("../../images/hot1.png")}
                                style={[
                                  styles.newTag1,
                                  { transform: [{ rotate: "40deg" }] },
                                ]}
                              ></Image>
                            </View>

                            <View>
                              <View
                                style={{
                                  paddingLeft: 20,
                                  // padding: 6,
                                  // paddingRight: 10,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    // color: "white",
                                    // backgroundColor: "#ee4d2d",
                                    // padding: 10,
                                    // borderRadius: 5,
                                    // width: 250,
                                    // textAlign: "center",
                                  }}
                                >
                                  Ngày hôm nay: {today.toLocaleDateString()}
                                </Text>
                              </View>

                              <View
                                style={{
                                  padding: 10,
                                  paddingLeft: 20,
                                  // paddingRight: 10,
                                }}
                              >
                                <TouchableOpacity onPress={showEndDatePickers}>
                                  <Text style={{ fontSize: 14 }}>
                                    Chọn ngày kết thúc:{" "}
                                    {endDate.toLocaleDateString()}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            </View>

                            <View
                              style={{
                                flexDirection: "row",
                                justifyContent: "space-around",
                                marginTop: 15,
                              }}
                            >
                              <TouchableOpacity
                                style={{
                                  backgroundColor: "white",
                                  padding: 6,
                                  paddingLeft: 15,
                                  paddingRight: 15,
                                  borderRadius: 5,
                                  borderWidth: 1,
                                  borderColor: "#ee4d2d",
                                  alignItems: "center",
                                }}
                                onPress={() => handleSaveTag(product.id)}
                              >
                                <Text style={{ color: "#ee4d2d" }}>Lưu</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{
                                  backgroundColor: "#d40000",
                                  padding: 6,
                                  paddingLeft: 15,
                                  paddingRight: 15,
                                  borderRadius: 5,
                                  alignItems: "center",
                                }}
                                onPress={() => {
                                  setModalVisible(false);
                                  setSelectedProduct(null);
                                }}
                              >
                                <Text style={{ color: "white" }}>Hủy</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </Modal>
                    )}
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: "column",
                      width: "50%",
                      // borderWidth: 1,
                      marginLeft: 5,
                      height: "100%",
                      justifyContent: "center",
                      // alignItems: "center",
                    }}
                  >
                    <Text style={styles.nameProduct}>
                      {product.name_product}
                    </Text>
                    <Text style={styles.priceProduct}>
                      {formatPrice(product.price)}
                    </Text>
                    <Text style={styles.priceProductSold}>
                      Bắt đầu:{" "}
                      {product.tag_start_date &&
                        `${new Date(product.tag_start_date).toLocaleDateString(
                          "vi-VN"
                        )}`}
                    </Text>
                    <Text style={styles.priceProductSold}>
                      Kết thúc:{" "}
                      {product.tag_end_date &&
                        `${new Date(product.tag_end_date).toLocaleDateString(
                          "vi-VN"
                        )}`}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "column",
                      width: "20%",
                      justifyContent: "center",
                      alignItems: "center",
                      // borderWidth: 1,
                      // marginRight: 10,
                      // marginLeft: 5,
                    }}
                  >
                    {product.tag === false && (
                      <TouchableOpacity
                        style={styles.btnUpdate}
                        onPress={() => toggleModal(product.id)}
                      >
                        <Text style={{ color: "#ee4d2d" }}>Thêm tag</Text>
                      </TouchableOpacity>
                    )}
                    {product.tag === true && (
                      <TouchableOpacity
                        style={styles.btnDelete}
                        onPress={() => handleRemoveTag(product.id)}
                      >
                        <Text style={{ color: "white" }}>Xóa tag</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text>Không tìm thấy sản phẩm nào!</Text>
          )}

          {showModal && (
            <DateTimePicker
              testID="dateTimePicker"
              value={endDate}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleEndDateChange}
            />
          )}
        </View>
      </View>
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
    flex: 11.8,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 89,
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
    height: 2,
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

    backgroundColor: "#eeeeee",
    justifyContent: "center",
  },
  productRowContainer: {
    // flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // flexWrap: "wrap",
    width: windownWidth - 15,
    marginLeft: 8,
    marginTop: 5,
    // marginBottom: "26%",
    // height: "100%",
    // borderWidth: 5
    // marginBottom: 5,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent:'center',
    borderColor: "gray",
    height: 110,
    width: "100%",
    backgroundColor: "white",
    position: "relative",
    borderRadius: 5,
    // borderWidth: 0.5,
    // borderWidth: 0.5,
    padding: 5,
    marginBottom: 7,
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
    backgroundColor: "white",
    height: 30,
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ee4d2d",
    marginRight: 10,
  },
  btnDelete: {
    backgroundColor: "#d40000",
    height: 30,
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#d40000",
    marginRight: 10,

    // position: "absolute",
    // top: 5,
    // right: 0,
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
  newTag: {
    width: 45,
    height: 45,
  },
  newTag1: {
    width: 40,
    height: 40,
  },
});
