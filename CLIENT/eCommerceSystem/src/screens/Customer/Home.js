import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios, { endpoints } from "../../config/API";
import * as Animatable from "react-native-animatable";
import { useCart } from "../../context/CartContext";
import { useRefreshData } from "../../context/RefreshDataContext";

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

const imageBanner = [
  // require("../images/banner1.png"),
  require("../../images/banner2.png"),
  require("../../images/banner3.png"),
  // require("../images/banner4.png"),
  // require("../images/banner5.png"),
  require("../../images/banner6.png"),
  // require("../images/banner7.png"),
  // require("../images/banner8.png"),
  // require("../images/banner9.png"),
];

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default Home = ({ navigation }) => {
  // useEffect(() => {
  //   console.log("Home render");
  // });
  const [products, setProducts] = useState([]);
  return (
    // stickyHeaderIndices={[0]}
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent
          navigation={navigation}
          products={products}
          setProducts={setProducts}
        />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          products={products}
          setProducts={setProducts}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent />
      </View>
    </View>
  );
};

const HeaderComponent = ({ navigation, products }) => {
  const [search, setSearch] = useState("");
  const [{ cartItems }, dispatchCart] = useCart();
  const itemCount = cartItems.length;

  //handle search product
  const handleSearch = () => {
    navigation.navigate("SearchProducts", {
      kw: search,
    });
  };

  return (
    <View style={styles.containerHeader}>
      <StatusBar barStyle="light-content" />
      <View style={styles.signIn}>
        <View style={styles.backgroundSignIn}>
          <Image
            source={require("../../images/search.png")}
            style={styles.iconSearch}
          ></Image>
          <TextInput
            style={styles.textInputTK}
            placeholder="Nhập sản phẩm cần tìm..."
            autoCapitalize="none"
            placeholderTextColor="gray"
            onChangeText={(text) => setSearch(text)}
            onSubmitEditing={handleSearch}
          />
        </View>

        <TouchableOpacity
          style={styles.backgroundCart}
          onPress={() => {
            navigation.navigate("Cart");
          }}
        >
          <View>
            <Image
              source={require("../../images/cart.png")}
              style={styles.iconFB}
            ></Image>
            <Text
              style={{
                position: "absolute",
                top: -12,
                right: -4,
                color: "white",
                paddingTop: 2,
                paddingBottom: 1,
                paddingLeft: 6,
                paddingRight: 6,
                borderRadius: 100,
                backgroundColor: "#c20302",
                fontSize: 12,
                borderWidth: 1,
                borderColor: "white",
                textAlign: "center",
                alignItems: "center",
                fontWeight: "500",
              }}
            >
              {itemCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backgroundMess}>
          <Image
            source={require("../../images/mess.png")}
            style={styles.iconGG}
          ></Image>
        </TouchableOpacity>
      </View>
    </View>
    // </View>
  );
};

const ContentComponent = ({ navigation, products, setProducts }) => {
  const { state: refreshState } = useRefreshData();
  //banner
  const [imgActive, setImgActive] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const onChange = (event) => {
    const slideWidth = Dimensions.get("window").width;
    const offset = event.nativeEvent.contentOffset.x;
    const activeImage = Math.floor(offset / slideWidth);
    setImgActive(activeImage);
  };
  const scrollViewRef = useRef();

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

  const [categorys, setCategorys] = useState([]);

  //call data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProducts = await axios.get(endpoints.products);
        setProducts(responseProducts.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setTimeout(() => {
          setIsLoadingProducts(false);
        }, 1000);
      }

      try {
        const responseCategories = await axios.get(endpoints.categories);
        setCategorys(responseCategories.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setTimeout(() => {
          setIsLoadingCategories(false);
        }, 1000);
      }
    };

    fetchData();

    console.log("load data");
  }, [refreshState]);

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  //Imgcategory
  const imgCategory = [
    { image: require("../../images/dienthoai.png") },
    { image: require("../../images/thoitrang.png") },
    { image: require("../../images/giaydep.png") },
    { image: require("../../images/trangsuc.png") },
    { image: require("../../images/laptop.png") },
    { image: require("../../images/badminton.png") },
    { image: require("../../images/dienthoai.png") },
    { image: require("../../images/thoitrang.png") },
    { image: require("../../images/giaydep.png") },
    { image: require("../../images/trangsuc.png") },
    { image: require("../../images/laptop.png") },
    { image: require("../../images/badminton.png") },
  ];

  return (
    <ScrollView style={styles.wrap}>
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

      <View style={styles.containerContent}>
        {/* Category */}
        {isLoadingCategories ? (
          <ActivityIndicator style={styles.ActivityIndicator} />
        ) : (
          <View style={styles.bgViewCategory}>
            <ScrollView
              horizontal
              contentContainerStyle={styles.containerCategory}
              showsHorizontalScrollIndicator={false}
            >
              {categorys.map((category, index) => (
                <View key={index}>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("SearchProducts", {
                        categoryId: category.id,
                      });
                    }}
                    style={[
                      styles.bgCategory,
                      index === categorys.length - 1
                        ? { marginRight: 10 }
                        : { marginRight: 36, marginLeft: 10 },
                    ]}
                  >
                    <View key={index} style={styles.categoryItem}>
                      <Image
                        source={imgCategory[index].image}
                        style={styles.categoryImage}
                      />
                    </View>
                    <Text style={styles.textCategoryItem}>
                      {category.name_category}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Banner Image */}
        <View>
          <Image
            resizeMode="stretch"
            style={styles.ImgBanner2}
            source={require("../../images/banner11.png")}
          />
        </View>

        {/* Product */}
        <View style={styles.bgTextTitle}>
          <Text style={styles.textContent}>GỢI Ý HÔM NAY</Text>
        </View>

        {isLoadingProducts ? (
          <ActivityIndicator style={styles.ActivityIndicator} />
        ) : (
          <View style={styles.productRowContainer}>
            {products && products.length > 0 ? (
              products.map((product) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ProductDetail", {
                        productId: product.product.id,
                      });
                    }}
                    key={product.product.id}
                    style={styles.productContainer}
                  >
                    {/* tag */}
                    {product.product.tag === true && (
                      <View
                        style={{
                          position: "absolute",
                          top: -10,
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

                    <Image
                      style={{ width: "100%", height: 170 }}
                      source={{ uri: product.product.images[0].thumbnail }}
                      resizeMode="cover"
                    />
                    <Text style={styles.nameProduct}>
                      {product.product.name_product}
                    </Text>
                    <Text style={styles.priceProduct}>
                      {formatPrice(product.product.price)}
                    </Text>
                    <Text style={styles.priceProductSold}>
                      Đã bán {product.product.quantity_sold}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text>Không tìm thấy sản phẩm nào!</Text>
            )}
          </View>
        )}
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
    height: "15%",
    backgroundColor: "#EE4D2D",
    paddingBottom: 110,
    // backgroundColor: "white",
    // borderWidth: 4,
  },
  viewContent: {
    width: "100%",
    // height: "85%",
    height: "85%",
    // marginTop: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EE4D2D",
    // backgroundColor: "black",
    // paddingBottom: 10
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    height: "0%",
    // backgroundColor: "red",
  },
  containerHeader: {
    marginTop: 50,
    // width: "100%",
    // height: "100%",
  },
  header: {
    width: "100%",
    flex: 1,
    // backgroundColor: "#EE4D2D",
    justifyContent: "center",
    alignItems: "center",
  },
  productRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    width: windownWidth - 15,
    marginLeft: 8,
    // marginBottom: "26%",
    // height: "100%",
    // borderWidth: 5,
    marginBottom: 5,
  },
  productContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingLeft: 10,
    borderColor: "#ddd",
    padding: 5,
    marginTop: 5,
    height: 270,
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
    paddingBottom: 15,
    marginTop: 15,
  },
  priceProduct: {
    color: "#EE4D2D",
    fontWeight: "400",
    fontSize: 14,
    // borderWidth: 5,
    position: "absolute",
    bottom: 7,
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
  iconShopee: {
    marginTop: 0,
    width: 75,
    height: 75,
  },
  signIn: {
    width: windownWidth - 15,
    marginLeft: 10,
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginTop: 10,
    // marginBottom: 10,
    // backgroundColor: "#FEFEFE",
    // borderWidth: 3,
  },
  backgroundSignIn: {
    flexDirection: "row",
    width: "75%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    backgroundColor: "white",
    // elevation: 10,
  },
  backgroundCart: {
    flexDirection: "row",
    width: "10%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
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
  containerContent: {
    // borderWidth: 1,
    // height: "80%",
    // width: "100%",

    backgroundColor: "#eeeeee",
    justifyContent: "center",
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
    fontSize: 15,
    marginRight: 15,
    color: "black",
  },
  bgForgetPass: {
    height: 30,
    width: windownWidth - 60,
    marginLeft: 30,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  textForgetPass: {
    position: "absolute",
    right: 0,
  },
  textForgetPassChild: {
    color: "#1A76EC",
  },
  bgButtonLogin: {
    height: 48,
    borderRadius: 5,
    width: windownWidth - 60,
    marginLeft: 30,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EE4D2D",
    // marginBottom: 20,
  },
  textBtnLogin: {
    color: "white",
    fontSize: 17,
    fontWeight: "bold",
  },
  bgFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: windownWidth - 60,
    marginLeft: 30,
    height: 20,
  },
  brFooter: {
    height: 1,
    width: "30%",
    backgroundColor: "#999999",
  },
  textOR: {
    marginLeft: 15,
    marginRight: 15,
  },
  brIconLoginGG: {
    height: "100%",
    width: 2,
    backgroundColor: "#b4b4b4",
    marginRight: 30,
  },
  typeLoginGG: {
    flexDirection: "row",
    height: 45,
    width: windownWidth - 60,
    marginLeft: 30,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ececec",
  },
  iconGG: {
    marginRight: 0,
    width: 25,
    height: 25,
  },
  textIconGG: {
    color: "black",
    fontWeight: "400",
    fontSize: 15,
    paddingRight: 15,
  },
  brIconLoginFB: {
    height: "100%",
    width: 2,
    backgroundColor: "#b4b4b4",
    marginRight: 30,
  },
  typeLoginFB: {
    flexDirection: "row",
    height: 45,
    width: windownWidth - 60,
    marginLeft: 30,
    borderRadius: 5,
    padding: 10,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ececec",
  },
  iconFB: {
    marginRight: 5,
    width: 26,
    height: 26,
  },
  textIconFB: {
    color: "black",
    fontWeight: "400",
    fontSize: 15,
  },
  bgTextSignInFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#f8f8f8",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  textSignInFooter: {
    color: "#414141",
  },
  clickTextSignIn: {
    marginLeft: 10,
    color: "#1A76EC",
  },
  //banner
  wrap: {
    // borderWidth: 1,
    width: windownWidth,
    height: windownHeight * 0.2,
    paddingBottom: 5,
  },
  imageContainer: {
    borderRadius: 20,
    overflow: "visible",
    marginHorizontal: 5,
    width: windownWidth - 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageInScrollView: {
    width: "95%",
    height: "90%",
    // borderRadius: 10,
    // justifyContent: "center",
    // alignItems: "center",
  },
  containerCategory: {
    flexDirection: "row",
    // paddingLeft: 5,
    // paddingRight: 5,
    paddingTop: 15,
    paddingBottom: 5,
    alignItems: "center",
    backgroundColor: "#c20302",

    // borderWidth: 19
  },
  containerCategory2: {
    flexDirection: "row",
    // paddingLeft: 5,
    // paddingRight: 5,
    paddingTop: 0,
    paddingBottom: 15,
    alignItems: "center",
    backgroundColor: "white",
  },
  categoryItem: {
    width: 50,
    padding: 5,
    // marginRight: 20,
    // marginLeft: 10,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    // elevation: 4,
    borderWidth: 1.5,
    borderColor: "#e9e7e7",
  },
  categoryImage: {
    // padding: 50,
    width: 33,
    height: 33,
    borderRadius: 25,
  },
  textCategoryItem: {
    fontWeight: "500",
    fontSize: 12,
    color: "white",
  },
  bgCategory: {
    marginRight: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  bgViewCategory: {
    // width: windownWidth - 15,
    // marginLeft: 8,
    // marginTop: 5,
    padding: 10,
    backgroundColor: "#c20302",
    paddingTop: 15,
    paddingBottom: 17,
    // elevation: 10
    // borderRadius: 10,
  },
  ImgBanner2: {
    width: "100%",
    height: 150,
    // marginBottom: 1
    marginBottom: 2,
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
});
