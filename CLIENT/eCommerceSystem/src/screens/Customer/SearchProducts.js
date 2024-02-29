import { StatusBar } from "expo-status-bar";
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useLayoutEffect,
} from "react";
import axios, { endpoints } from "../../config/API";
import { AirbnbRating, Rating } from "react-native-ratings";
import { useRoute } from "@react-navigation/native";

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import FilterModal from "../../modal/FilterProducts";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default SearchProducts = ({ navigation }) => {
  const route = useRoute();
  const { productAll, categoryId, kw } = route.params;
  const [filterProducts, setFilterProducts] = useState([]);

  // console.log("==========", kw);
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent
          navigation={navigation}
          productAll={productAll}
          filterProducts={filterProducts}
          setFilterProducts={setFilterProducts}
        />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          productAll={productAll}
          categoryId={categoryId}
          kw={kw}
          filterProducts={filterProducts}
          setFilterProducts={setFilterProducts}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent />
      </View>
    </View>
  );
};

const HeaderComponent = ({
  navigation,
  productAll,
  filterProducts,
  setFilterProducts,
}) => {
  const [search, setSearch] = useState("");

  const [filterModal, setFilterModal] = useState(false);

  const searchProducts = () => {
    navigation.navigate("SearchProducts", {
      kw: search,
    });
  };

  return (
    <View style={styles.containerHeader}>
      <StatusBar barStyle="light-content" />
      <View style={styles.signIn}>
        <TouchableOpacity style={styles.backgroundCart}>
          <Image
            source={require("../../images/back2.png")}
            style={styles.iconFB}
          ></Image>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backgroundSignIn}>
          <Image
            source={require("../../images/search.png")}
            style={styles.iconSearch}
          ></Image>
          <TextInput
            style={styles.textInputTK}
            placeholder="Nhập sản phẩm cần tìm..."
            autoCapitalize="none"
            placeholderTextColor="#7a7a7a"
            onChangeText={(text) => setSearch(text)}
            onSubmitEditing={searchProducts}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backgroundCart}
          onPress={() => setFilterModal(true)}
        >
          <Image
            source={require("../../images/filter2.png")}
            style={styles.iconFB}
          ></Image>
          <Text style={{ color: "#ee4d2d" }}>Lọc</Text>
        </TouchableOpacity>

        <FilterModal
          visible={filterModal}
          onClose={() => setFilterModal(false)}
        />
      </View>
    </View>
  );
};

const ContentComponent = ({
  navigation,
  categoryId,
  kw,
  setFilterProducts,
  filterProducts,
}) => {
  // const [sold, setSold] = useState(255);
  // const [raTing, setRaTing] = useState(4.5);
  const [idProducts, setIdProducts] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  //get product by category
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProduct = await axios.get(
          endpoints.get_product_by_category,
          {
            params: {
              category: categoryId,
            },
          }
        );
        const idPro = responseProduct.data.map((product) => product.id);

        setIdProducts(idPro);
      } catch (error) {
        console.error("Error1:", error);
      }
    };

    fetchData();
  }, [categoryId]);

  useEffect(() => {
    const filterProductsByCategory = async () => {
      try {
        const responseListProduct = await axios.get(endpoints.products);

        const filtered = responseListProduct.data.filter((product) =>
          idProducts.includes(product.product.id)
        );
        setFilterProducts(filtered);
        setInitialProducts(filtered);
      } catch (error) {
        console.error("Error2:", error);
      }
    };

    if (idProducts.length > 0) {
      filterProductsByCategory();
    }
  }, [idProducts]);

  //get product by kw
  useEffect(() => {
    const fetchDataByKW = async () => {
      try {
        if (kw) {
          const responseProductKW = await axios.get(endpoints.get_query, {
            params: {
              kw: kw,
            },
          });
          const idProKW = responseProductKW.data.map(
            (product) => product.product.id
          );

          setIdProducts(idProKW);

          setFilterProducts(responseProductKW.data);
          setInitialProducts(responseProductKW.data);
        }
      } catch (error) {
        console.error("Error3:", error.response);
      }
    };

    fetchDataByKW();
  }, [kw]);

  //handle sort
  const [sort, setSort] = useState("asc");

  //by name
  const handleSortByName = async () => {
    try {
      const formData = new FormData();
      formData.append("product_ids", JSON.stringify(idProducts));

      const response = await axios.post(endpoints.sort_by_name, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFilterProducts(response.data);
    } catch (error) {
      console.error("Error sorting by name:", error);
    }
  };

  //by price
  const handleSortByPrice = async () => {
    try {
      const formData = new FormData();
      formData.append("product_ids", JSON.stringify(idProducts));

      const response = await axios.post(
        sort === "asc"
          ? endpoints.sort_by_price_up
          : endpoints.sort_by_price_down,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFilterProducts(response.data);
      setSort((prevSort) => (prevSort === "asc" ? "desc" : "asc"));
    } catch (error) {
      console.error("Error sorting products by price:", error);
    }
  };

  //by quantity_sold
  const handleSortByQuantitySold = async () => {
    try {
      const formData = new FormData();
      formData.append("product_ids", JSON.stringify(idProducts));

      const response = await axios.post(
        endpoints.sort_by_quantity_sold,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFilterProducts(response.data);
    } catch (error) {
      console.error("Error sorting by quantity_sold:", error);
    }
  };

  //handle tab click
  const [selectedTab, setSelectedTab] = useState("Liên quan");

  const handleTabClick = async (tabName) => {
    try {
      switch (tabName) {
        case "Liên quan":
          setFilterProducts(initialProducts);
          break;

        case "Theo tên":
          await handleSortByName();
          break;

        case "Bán chạy":
          await handleSortByQuantitySold();
          break;

        case "Giá":
          await handleSortByPrice();
          break;

        default:
          break;
      }

      setSelectedTab(tabName);
    } catch (error) {
      console.error("Error handling tab click:", error);
    }
  };

  return (
    <ScrollView stickyHeaderIndices={[0]} style={styles.wrap}>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            backgroundColor: "white",
            // width: windownWidth - 20,
            // marginLeft: 10,
          }}
        >
          <TouchableOpacity
            style={[
              styles.bgItem,
              {
                borderBottomWidth: selectedTab === "Liên quan" ? 1 : 0,
                borderBottomColor: "#ee4d2d",
              },
            ]}
            onPress={() => handleTabClick("Liên quan")}
          >
            <Text
              style={{
                color: selectedTab === "Liên quan" ? "#ee4d2d" : "#4b4a4a",
              }}
            >
              Liên quan
            </Text>
          </TouchableOpacity>
          <View style={styles.brIconLoginFB1}></View>

          <TouchableOpacity
            style={[
              styles.bgItem,
              {
                borderBottomWidth: selectedTab === "Theo tên" ? 1 : 0,
                borderBottomColor: "#ee4d2d",
              },
            ]}
            onPress={() => handleTabClick("Theo tên")}
          >
            <Text
              style={{
                color: selectedTab === "Theo tên" ? "#ee4d2d" : "#4b4a4a",
              }}
            >
              Theo tên
            </Text>
          </TouchableOpacity>
          <View style={styles.brIconLoginFB1}></View>

          <TouchableOpacity
            style={[
              styles.bgItem,
              {
                borderBottomWidth: selectedTab === "Bán chạy" ? 1 : 0,
                borderBottomColor: "#ee4d2d",
              },
            ]}
            onPress={() => handleTabClick("Bán chạy")}
          >
            <Text
              style={{
                color: selectedTab === "Bán chạy" ? "#ee4d2d" : "#4b4a4a",
              }}
            >
              Bán chạy
            </Text>
          </TouchableOpacity>
          <View style={styles.brIconLoginFB1}></View>

          <TouchableOpacity
            style={[
              styles.bgItem1,
              {
                borderBottomWidth: selectedTab === "Giá" ? 1 : 0,
                borderBottomColor: "#ee4d2d",
              },
            ]}
            onPress={() => handleTabClick("Giá")}
          >
            <Text
              style={{ color: selectedTab === "Giá" ? "#ee4d2d" : "#4b4a4a" }}
            >
              Giá
            </Text>
            <Image
              source={require("../../images/updown.png")}
              style={styles.iconUpDown}
            ></Image>
          </TouchableOpacity>
        </View>
      </View>

      {/* product */}
      <View style={styles.containerContent}>
        {/* Product */}
        <View style={styles.productRowContainer}>
          {filterProducts && filterProducts.length > 0 ? (
            filterProducts.map((product) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ProductDetail", {
                    productId: product.product.id,
                  });
                }}
                key={product.product.id}
                style={styles.productContainer}
              >
                {/* {product.images && product.images.length > 0 && ( */}
                <Image
                  style={{ width: "100%", height: 170 }}
                  source={{ uri: product.product.images[0].thumbnail }}
                  resizeMode="cover"
                />
                {/* )} */}
                <Text style={styles.nameProduct}>
                  {product.product.name_product}
                </Text>
                <Text style={styles.priceProduct}>
                  {formatPrice(product.product.price)}
                </Text>
                <View style={styles.bgRating}>
                  <Rating
                    type="star"
                    ratingCount={5}
                    // showRating={true}
                    // ratingTextColor="black"
                    fractions={1}
                    jumpValue={1}
                    startingValue={product.product.avg_rating}
                    imageSize={10}
                    readonly={true}
                  />
                  {/* <Text style={styles.textRating}>{raTing}</Text> */}
                  {/* <View style={styles.brIconLoginFB}></View> */}
                  <Text style={styles.textRating1}>
                    Đã bán {product.product.quantity_sold}
                  </Text>
                </View>

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
                    {product.product.store_info.address.length > 1
                      ? `${product.product.store_info.address.substring(
                          0,
                          25
                        )}...`
                      : product.product.store_info.address.address}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text>Không tìm thấy sản phẩm nào!</Text>
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
    // height: windownHeight * 10,
  },
  viewHeader: {
    width: "100%",
    flex: 13,
    backgroundColor: "white",
    // paddingBottom: 50,
    // zIndex: 100
    // backgroundColor: "white",
    // borderWidth: 4,
  },
  viewContent: {
    width: "100%",
    flex: 87,
    // marginTop: 1,
    // alignItems: "center",
    // justifyContent: "center",
    // backgroundColor: "#EE4D2D",
    backgroundColor: "#F4F4F4",
    // paddingBottom: 10
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 0,
    // backgroundColor: "red",
  },
  containerHeader: {
    paddingTop: 50,
    // width: "100%",
    // height: "100%",
  },
  wrap: {
    // borderWidth: 1,
    width: windownWidth,
    height: windownHeight * 0.2,
    // paddingBottom: 5,
    // marginTop: 50
  },
  signIn: {
    width: windownWidth - 15,
    marginLeft: 10,
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    // marginBottom: 40,
    // marginTop: 10,
    // marginBottom: 10,
    // backgroundColor: "#FEFEFE",
    // borderWidth: 1,
  },
  backgroundSignIn: {
    flexDirection: "row",
    width: "65%",
    height: "73%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    paddingLeft: 5,
    // marginRight: 10,
    backgroundColor: "white",
    borderWidth: 1.3,
    borderColor: "#ee4d2d",

    // elevation: 10,
  },
  backgroundCart: {
    flexDirection: "row",
    // width: "10%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 1
  },
  backgroundMess: {
    flexDirection: "row",
    width: "10%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textSignIn: {
    fontSize: 20,
    color: "black",
    fontWeight: "400",
  },
  brButton: {
    height: 6,
    // justifyContent: 'center',
    // alignItems: 'center',
    width: "110%",
    backgroundColor: "#F4F4F4",
    // #F4F4F4
    position: "absolute",
    bottom: 0,
    shadowColor: "#51A179",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  bgTextTitle: {
    width: windownWidth - 15,
    marginLeft: 8,
    marginTop: 5,
    padding: 10,
    paddingBottom: 10,
    backgroundColor: "white",
    borderRadius: 0,
    // borderWidth: 1
  },
  textContent: {
    fontSize: 15,
    // marginBottom: 6,
    fontWeight: "800",
    color: "#EE4D2D",
    // marginLeft: 10,
    // borderWidth: 1
    // textAlign: 'center'
  },
  bgInputTK: {
    width: windownWidth - 60,
    marginLeft: 30,
    marginTop: 10,
    backgroundColor: "white",
    height: 53,
    // borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#EE4D2D",
    // elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  iconSearch: {
    height: 24,
    width: 24,
    marginLeft: 5,
  },
  textInputTK: {
    height: "100%",
    flex: 1,
    marginLeft: 15,
    fontSize: 14.3,
    marginRight: 15,
    color: "black",
  },
  iconFB: {
    marginRight: 5,
    width: 26,
    height: 26,
  },
  bgStore: {
    width: windownWidth - 20,
    marginLeft: 10,
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    // borderWidth: 1,
    margin: 10,
    marginTop: 20,
  },
  avtShop: {
    height: 55,
    width: 55,
    marginRight: 10,
    borderRadius: 100,
  },
  locationShop: {
    height: 13,
    width: 13,
    marginRight: 5,
  },
  textStore: {
    fontSize: 16,
    fontWeight: "500",
    color: "white",
  },
  bgLocationSt: {
    // marginTop: 8,
    // borderWidth:1,
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    left: 10,
  },
  textLocation: {
    fontSize: 12,
    color: "#575757",
    // borderWidth: 1,
    // width: 150
  },
  viewShop: {
    borderWidth: 1,
    borderColor: "white",
    padding: 5,
    width: 85,
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginLeft: 40,
    // position: "absolute",
    // right: 5,
    // marginLeft: 105,
  },
  viewShop1: {
    borderWidth: 1,
    borderColor: "white",
    padding: 5,
    width: 85,
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    // marginLeft: 30,
    marginTop: 7,
  },
  textViewShop: {
    fontSize: 13,
    color: "#EE4D2D",
    textAlign: "center",
    color: "white",
  },
  bgRating: {
    // borderWidth: 1,
    position: "absolute",
    bottom: 35,
    left: 10,
    alignItems: "center",
    flexDirection: "row",
    // backgroundColor:
  },
  textRating1: {
    // position: "absolute",
    // right: 100,
    marginLeft: 5,
    fontSize: 11,
    fontWeight: "400",
  },
  bgRating1: {
    marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  bgRating1: {
    marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  textRating: {
    fontSize: 12,
    marginLeft: 8,
    fontWeight: "400",
    color: "white",
  },
  brIconLoginFB: {
    height: "95%",
    width: 1,
    backgroundColor: "#acacac",
    // marginRight: 10,
    marginLeft: 10,
  },
  iconStar: {
    height: 15,
    width: 15,
  },
  iconPlus: {
    height: 9,
    width: 9,
    marginRight: 4,
  },
  iconChat: {
    height: 12.5,
    width: 12.5,
    marginRight: 4,
  },
  bgItem: {
    // width: "100%",
    padding: 15,
    // borderWidth: 1,
  },
  bgItem1: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  brIconLoginFB1: {
    height: "50%",
    width: 1.5,
    backgroundColor: "#d6d6d6",
    // marginRight: 10,
    // marginLeft: 10,
  },
  iconUpDown: {
    height: 15,
    width: 16,
    marginLeft: 5,
  },
  containerContent: {
    // borderWidth: 1,
    // height: "100%",
    // width: "100%",
    // marginBottom: 5,
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
    height: 310,
    width: "49.2%",
    backgroundColor: "white",
    // paddingBottom: 10,
    // elevation: 2
    position: "relative",
    // borderRadius: 5,
    // borderWidth: 5
  },
  nameProduct: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
    paddingBottom: 15,
    marginTop: 15,
  },
  priceProduct: {
    color: "#EE4D2D",
    fontWeight: "400",
    fontSize: 14,
    // borderWidth: 5,
    position: "absolute",
    bottom: 55,
    left: 10,
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
    padding: 20,
    size: "large",
    transform: [{ scale: 1.5 }],
    // backgroundColor: "white",
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
  // productContainer: {
  //   flexDirection: "column",
  //   alignItems: "flex-start",
  //   paddingLeft: 10,
  //   borderColor: "#ddd",
  //   padding: 5,
  //   marginTop: 5,
  //   height: 270,
  //   width: "49.2%",
  //   backgroundColor: "white",
  //   // paddingBottom: 10,
  //   // elevation: 2
  //   position: "relative",
  //   // borderRadius: 5,
  //   // borderWidth: 5
  // },
  nameProduct: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
    paddingBottom: 15,
    marginTop: 15,
  },
  // priceProduct: {
  //   color: "#EE4D2D",
  //   fontWeight: "400",
  //   fontSize: 14,
  //   // borderWidth: 5,
  //   position: "absolute",
  //   bottom: 33,
  //   left: 10,
  // },
  priceProductSold: {
    color: "#252525",
    fontWeight: "400",
    fontSize: 12,
    // borderWidth: 5,
    position: "absolute",
    bottom: 8,
    right: 10,
  },
});
