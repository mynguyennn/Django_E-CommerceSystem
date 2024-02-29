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
import { useLogin } from "../../context/LoginContext";
import { useRoute } from "@react-navigation/native";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ProductList = ({ navigation }) => {
  const [user, dispatch] = useLogin();
  const [countProduct, setCountProduct] = useState(0);
  const [products, setProducts] = useState([]);
  const route = useRoute();
  const { storeData } = route.params;
  // console.log(storeData)
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent navigation={navigation} countProduct={countProduct} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          user={user}
          setCountProduct={setCountProduct}
          products={products}
          setProducts={setProducts}
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

const HeaderComponent = ({ countProduct, navigation }) => {
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
            <Text style={styles.textSignIn}>
              Sản phẩm còn hàng ({countProduct})
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
  user,
  setCountProduct,
  products,
  setProducts,
  route,
  storeData,
}) => {
  //call api product
  useEffect(() => {
    const fetchData = async () => {
      try {
        // const responseProducts = await axios.get(endpoints.products);
        // const filteredProducts = responseProducts.data.filter((product) => {
        //   return product.store_info && product.store_info.account === user.id;
        // });

        const filteredProducts = await axios.get(
          endpoints.get_products_by_store_true(storeData[0].id)
        );

        // console.log(filteredProducts)
        setProducts(filteredProducts.data);
        // console.log(storeData[0].id);

        const numberOfProducts = filteredProducts.data.length;

        setCountProduct((count) => {
          if (count !== numberOfProducts) {
            return numberOfProducts;
          }
          return count;
        });
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, [route.params?.refreshData]);

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  //handle update
  const handleUpdateProduct = (product) => {
    navigation.navigate("UpdateProduct", { product, storeData: storeData });
  };

  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          {products && products.length > 0 ? (
            products.map((product) => {
              return (
                <View key={product.product.id} style={styles.productContainer}>
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
                      source={{ uri: product.product.images[0].thumbnail }}
                    />
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
                      {product.product.name_product}
                    </Text>
                    <Text style={styles.priceProduct}>
                      {formatPrice(product.product.price)}
                    </Text>
                    <Text style={styles.priceProductSold}>
                      Đã bán: {product.quantity_sold}
                    </Text>
                    <Text style={styles.priceProductSold}>
                      Tồn kho: {product.product.quantity}
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
                    <TouchableOpacity
                      style={styles.btnUpdate}
                      onPress={() => handleUpdateProduct(product.product)}
                    >
                      <Text style={{ color: "#ee4d2d" }}>Sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnDelete}>
                      <Text style={{ color: "white" }}>Xóa</Text>
                    </TouchableOpacity>
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
  // console.log("+=========",products)
  return (
    <View
      style={{ width: "100%", justifyContent: "center", alignItems: "center" }}
    >
      <View style={styles.brButton66}></View>

      <TouchableOpacity
        style={styles.bgButton}
        onPress={() => {
          navigation.navigate("AddProducts", {
            storeData: storeData,
          });
        }}
      >
        <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
          Thêm sản phẩm mới
        </Text>
      </TouchableOpacity>
    </View>
  );
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
    flex: 78,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 10,
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
    width: "95%",
    // padding: 10,
    // paddingBottom: 15,
    // marginTop: 15,
  },
  btnUpdate: {
    backgroundColor: "white",
    height: 30,
    width: 57,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ee4d2d",
    marginRight: 10,
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
