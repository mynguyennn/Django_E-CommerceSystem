import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView } from "react-native";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { useLogin } from "../../context/LoginContext";
import axios, { endpoints } from "../../config/API";
import * as Animatable from "react-native-animatable";
import { AirbnbRating, Rating } from "react-native-ratings";
import { useProductContext } from "../../context/CompareProductContext";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default CompareProduct = ({ navigation }) => {
  const [user, dispatch] = useLogin();
  const { state } = useProductContext();
  const { selectedProducts, productCount } = state;

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent productCount={productCount} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          user={user}
          selectedProducts={selectedProducts}
          productCount={productCount}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent user={user} />
      </View>
    </View>
  );
};

const HeaderComponent = ({ productCount }) => {
  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      {/* Component Header */}
      <View style={styles.containerHeader}>
        <View style={styles.signIn}>
          <TouchableOpacity>
            <Text style={styles.textSignIn}>
              So sánh sản phẩm ({productCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/333.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation, selectedProducts, productCount }) => {
  const [comparedProducts, setComparedProducts] = useState([]);
  const [hasProductsToCompare, setHasProductsToCompare] = useState(false);

  const { dispatch } = useProductContext();

  useEffect(() => {
    if (selectedProducts.length === 2) {
      const [id_1, id_2] = selectedProducts;
      if (id_1 && id_2) {
        console.log("ID 1:", id_1.id);
        console.log("ID 2:", id_2.id);
        compareProducts(id_1.id, id_2.id);
        setHasProductsToCompare(true);
      }
    }
  }, [selectedProducts]);

  //compare products
  const compareProducts = async (id_1, id_2) => {
    try {
      const response = await axios.get(endpoints.compare_product, {
        params: {
          id_1,
          id_2,
        },
      });

      const data = response.data;
      console.log("Compared Products:", data);

      const productArray = Object.values(data);

      setComparedProducts(productArray);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  //remove product
  const removeAllProducts = () => {
    dispatch({ type: "REMOVE_ALL_PRODUCTS" });
    setHasProductsToCompare(false);
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
      {productCount >= 2 ? (
        <View style={styles.productRowContainer}>
          {comparedProducts && comparedProducts.length > 0 ? (
            comparedProducts.map((product) => {
              return (
                <View key={product.id} style={styles.productContainer}>
                  <Image
                    style={{ width: "100%", height: 170 }}
                    source={{ uri: product.images[0].thumbnail }}
                  />

                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ProductDetail", {
                        productId: product.id,
                      });
                    }}
                  >
                    <Text style={styles.nameProduct}>
                      {product.name_product}
                    </Text>
                    <Text style={styles.priceProduct}>
                      {formatPrice(product.price)}
                    </Text>
                    <View style={styles.bgRating}>
                      <Rating
                        type="star"
                        ratingCount={5}
                        fractions={1}
                        jumpValue={1}
                        startingValue={product.avg_rating}
                        imageSize={10}
                        readonly={true}
                      />
                      <Text style={styles.textRating1}>
                        Đã bán {product.quantity_sold}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={{ marginTop: 20 }}>
                    <View style={styles.infoColumn}>
                      <Text style={styles.infoLabel}>Mô tả</Text>
                      <Text style={{ marginBottom: 5, height: 70 }}>
                        <Image
                          source={require("../../images/tick1.png")}
                          style={{ width: 12, height: 12 }}
                        ></Image>
                        {"  "}
                        {product.description}
                      </Text>
                    </View>
                    <View style={styles.infoColumn}>
                      <Text style={[styles.infoLabel, { marginTop: 0 }]}>
                        Danh mục
                      </Text>
                      <Text style={{ marginBottom: 5, height: 70 }}>
                        <Image
                          source={require("../../images/tick1.png")}
                          style={{ width: 12, height: 12 }}
                        ></Image>
                        {"  "}
                        {product.category_info.name_category}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.additionalInfoContainer}>
                    <View style={styles.infoColumn}>
                      <Text style={[styles.infoLabel, { marginTop: 0 }]}>
                        Chi tiết
                      </Text>
                      {product.product_attributes.map((attribute) => (
                        <Text key={attribute.id} style={{ marginBottom: 5 }}>
                          {attribute.name_at}: {attribute.value}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <Text>No compared products</Text>
          )}
        </View>
      ) : (
        <Text style={{ padding: 10 }}>
          Vui lòng thêm 2 sản phẩm để so sánh!
        </Text>
      )}
      {hasProductsToCompare && (
        <View style={{ alignItems: "center", textAlign: "center" }}>
          <TouchableOpacity style={styles.bgButton} onPress={removeAllProducts}>
            <Text style={{ color: "white", fontSize: 15, fontWeight: "500" }}>
              Tạo mới
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const FooterComponent = ({ user }) => {
  return;
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  viewHeader: {
    width: "100%",
    flex: 9.9,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 65,
    // marginTop: 1,
    backgroundColor: "#eeeeee",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 0,
    // backgroundColor: "gray",
  },
  containerHeader: {
    marginTop: 40,
    // width: "100%",
    // height: "100%",
  },
  signIn: {
    height: 60,
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

  brButton6: {
    height: 2,
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
    right: 20,
  },
  productRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: windownWidth - 15,
    marginLeft: 8,
    // marginBottom: "26%",
    // height: "100%",
    // borderWidth: 5
    marginBottom: 5,
  },
  productContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 10,
    borderColor: "#ddd",
    padding: 5,
    marginTop: 5,
    height: "100%",
    width: "49.2%",
    backgroundColor: "white",
    // paddingBottom: 10,
    // elevation: 2
    // borderWidth: 5,

    position: "relative",
    borderRadius: 5,
    // borderWidth: 5
  },
  nameProduct: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
    paddingBottom: 5,
    marginTop: 15,
  },
  priceProduct: {
    color: "#EE4D2D",
    fontWeight: "400",
    fontSize: 14,
    paddingBottom: 5,
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
    position: "absolute",
    bottom: 8,
    right: 10,
  },
  ActivityIndicator: {
    // marginTop: 30,
    padding: 20,
    size: "large",
    transform: [{ scale: 1.5 }],
    backgroundColor: "white",
  },
  newTag: {
    width: 50,
    height: 50,
  },
  infoLabel: {
    paddingTop: 6,
    paddingBottom: 6,
    // borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#a0a0a0",
    color: "white",
    fontWeight: "500",
    textAlign: "center",
    width: 165,
    alignItems: "center",
    marginBottom: 8,
  },
  bgRating: {
    // borderWidth: 1,
    // position: "absolute",
    // bottom: 35,
    // left: 10,
    alignItems: "center",
    flexDirection: "row",
    // backgroundColor:
    paddingBottom: 10,
  },
  textRating1: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: "400",
  },
  bgButton: {
    // zIndex: 2,
    height: 43,
    width: "35%",
    textAlign: "center",
    backgroundColor: "#f55939",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
    marginBottom: 30,
  },
});
