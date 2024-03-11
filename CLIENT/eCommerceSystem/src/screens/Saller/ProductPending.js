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
import { useRoute } from "@react-navigation/native";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ProductPending = ({ navigation }) => {
  const [countProduct, setCountProduct] = useState(0);
  const [products, setProducts] = useState([]);
  const route = useRoute();
  const { storeId } = route.params;
  // console.log("=====>", storeId);
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent navigation={navigation} countProduct={countProduct} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          setCountProduct={setCountProduct}
          products={products}
          setProducts={setProducts}
          storeId={storeId}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} />
      </View>
    </View>
  );
};

const HeaderComponent = ({ countProduct, navigation }) => {
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
            <Text style={styles.textSignIn}>
              Sản phẩm chờ duyệt ({countProduct})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({
  navigation,
  products,
  storeId,
  setCountProduct,
}) => {
  const [productList, setProductList] = useState([]);

  //call api product
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          endpoints.get_products_by_store_false(storeId[0].id)
        );
        setProductList(response.data);

        const numberOfProducts = response.data.length;

        setCountProduct((count) => {
          if (count !== numberOfProducts) {
            return numberOfProducts;
          }
          return count;
        });
        console.log("========", response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  //handle update
  // const handleUpdateProduct = (product) => {
  //   navigation.navigate("UpdateProduct", { product });
  // };

  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          {productList && productList.length > 0 ? (
            productList.map((product) => {
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
                    {product.images.length > 0 && (
                      <Image
                        style={{ width: "95%", height: "95%" }}
                        source={{ uri: product.images[0].thumbnail }}
                      />
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
                      Số lượng: {product.quantity}
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
                    <View
                      style={styles.btnUpdate}
                      // onPress={() => {
                      //   navigation.navigate("ProductStats", {
                      //     productId: product.id,
                      //     productName: product.name_product,
                      //     productImage: product.images[0].thumbnail,
                      //     storeId: storeId,
                      //   });
                      // }}
                    >
                      <Text style={{ color: "white" }}>Đang chờ</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text>Không tìm thấy sản phẩm nào!</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const FooterComponent = ({ navigation, storeData }) => {
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
    padding: 5,
    marginBottom: 7,
  },
  nameProduct: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
    width: "90%",
    // padding: 10,
    // paddingBottom: 15,
    // marginTop: 15,
  },
  btnUpdate: {
    backgroundColor: "#919191",
    height: 30,
    width: 75,
    justifyContent: "center",
    alignItems: "center",
    // marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#919191",
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
});
