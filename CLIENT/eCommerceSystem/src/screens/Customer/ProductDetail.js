import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useContext } from "react";
import axios, { endpoints } from "../../config/API";

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
import Swiper from "react-native-swiper";
import { AirbnbRating, Rating } from "react-native-ratings";
import { useNavigation } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { useCart } from "../../context/CartContext";
import { LoginContext } from "../../../App";

const { width } = Dimensions.get("window");
const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ProductDetail = ({ navigation }) => {
  const route = useRoute();
  const { productId } = route.params;
  // const productId = 8;
  // console.log(productId);

  const [user, dispatch] = useContext(LoginContext);

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent navigation={navigation} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent navigation={navigation} productId={productId} />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent
          navigation={navigation}
          productId={productId}
          user={user}
        />
      </View>
    </View>
  );
};

const HeaderComponent = ({ navigation }) => {
  return (
    <View style={styles.containerHeader}>
      <View style={styles.signIn}>
        <TouchableOpacity style={styles.backgroundSignIn}>
          <Image
            source={require("../../images/111.png")}
            style={styles.iconSearch}
          ></Image>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backgroundCart}
          onPress={() => {
            navigation.navigate("Cart");
          }}
        >
          <Image
            source={require("../../images/222.png")}
            style={styles.iconFB}
          ></Image>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backgroundMess}>
          <Image
            source={require("../../images/333.png")}
            style={styles.iconGG}
          ></Image>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ContentComponent = ({ productId, navigation }) => {
  // const [raTing, setRaTing] = useState(4.5);
  // const [sold, setSold] = useState(255);
  const [isLiked, setIsLiked] = useState(false);
  const [ship, setShip] = useState(0);
  const [totalProduct, setTotalProduct] = useState(0);
  const [raTingStore, setRaTingStore] = useState(0);
  const [productList, setProductList] = useState([]);

  //product more
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  //product detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProduct = await axios.get(
          endpoints.products_id(productId)
        );
        setProducts([responseProduct.data]);
        // console.log(responseProduct.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setTimeout(() => {
          setIsLoadingProducts(false);
        }, 2000);
      }
    };

    fetchData();
  }, [productId]);

  //comment by product
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          endpoints.get_comments_for_product(productId)
        );
        setProductList(response.data);
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

  const [expanded, setExpanded] = useState(false);

  const handleToggleExpansion = () => {
    setExpanded(!expanded);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  //img product
  const renderPagination = (index, total, context) => {
    return (
      <View style={styles.paginationStyle}>
        <Text style={{ color: "#3d3d3d", fontWeight: "500", fontSize: 14.5 }}>
          <Text style={styles.paginationText}>{index + 1}</Text>/{total}
        </Text>
      </View>
    );
  };

  // console.log(products);

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.slideW}>
        <Swiper
          renderPagination={renderPagination}
          loop={false}
          style={styles.slideWW}
        >
          {products.length > 0 &&
            products[0].images.map((image, imageIndex) => (
              <Image
                key={imageIndex}
                style={styles.image}
                source={{ uri: image.thumbnail }}
                resizeMode="contain"
              />
            ))}
        </Swiper>
      </View>

      {/* <View style={styles.slideW}> */}

      {/* </View> */}
      {products.length > 0 && (
        <View style={styles.otherContent}>
          <View style={styles.bgContent}>
            <View style={styles.bgTextNamePr}>
              <Text style={styles.textNamePr}>{products[0].name_product}</Text>
            </View>

            <View style={styles.bgTextPriceNamePr}>
              <Text style={styles.textPricePr}>
                {formatPrice(products[0].price)}
              </Text>
            </View>

            <View style={styles.bgRating}>
              <Rating
                type="star"
                ratingCount={5}
                // showRating={true}
                // ratingTextColor="black"
                fractions={1}
                jumpValue={1}
                startingValue={products[0].avg_rating}
                imageSize={15}
                readonly={true}
              />
              <Text style={styles.textRating}>{products[0].avg_rating}</Text>
              <View style={styles.brIconLoginFB}></View>
              <Text style={styles.textRating}>
                Đã bán {products[0].quantity_sold}
              </Text>

              <View style={styles.bgIconProduct}>
                <TouchableOpacity onPress={handleLike}>
                  <Image
                    style={styles.iconMess}
                    source={
                      isLiked
                        ? require("../../images/heart2.png")
                        : require("../../images/heart1.png")
                    }
                  />
                </TouchableOpacity>

                <TouchableOpacity>
                  <Image
                    style={styles.iconInbox}
                    source={require("../../images/inbox.png")}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.brContent}></View>
          <View style={styles.bgShip}>
            <Image
              style={styles.iconShip}
              source={require("../../images/ship.png")}
            />
            <Text style={styles.textIconShip}> Phí vận chuyển: đ{ship}</Text>
          </View>
          <View style={styles.brContent1}></View>
          {products.length > 0 && products[0].store_info && (
            <View style={styles.bgStore}>
              <View>
                <Image
                  style={styles.avtShop}
                  source={
                    products[0].store_info.avt
                      ? { uri: products[0].store_info.avt }
                      : require("../../images/chualogin.png")
                  }
                />
              </View>
              <View>
                <Text style={styles.textStore}>
                  {products[0].store_info.name_store}
                </Text>

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
                    {products[0].store_info.address.length > 30
                      ? `${products[0].store_info.address.substring(0, 30)}...`
                      : products[0].store_info.address}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("ProfileStore", {
                    storeID: products[0].store_info.id,
                  });
                }}
                style={styles.viewShop}
              >
                <Text style={styles.textViewShop}>Xem Shop</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* <View style={styles.bgInfoShop}>
            <Text style={styles.textArStore}>{totalProduct}</Text>
            <Text style={styles.textInfoShop}> Sản phẩm</Text>

            <Text style={styles.textArStore}>{raTingStore}</Text>
            <Text style={styles.textInfoShop}> Đánh giá</Text>
          </View> */}
          <View style={styles.brContent1}></View>
          <View style={styles.bgTextInfoPr}>
            <Text style={styles.textInfoPr}>Danh mục</Text>
            {products.length > 0 && products[0].category_info && (
              <Text>{products[0].category_info.name_category}</Text>
            )}
          </View>
          <View style={styles.brContent2}></View>
          <View style={styles.bgTextInfoPr}>
            <Text style={styles.textInfoPr}>Mô tả sản phẩm</Text>
          </View>

          <View style={styles.bgTextDetailPr}>
            <Text
              style={styles.textDetailPr}
              numberOfLines={expanded ? undefined : 2}
            >
              {products[0].description}
            </Text>

            {/* <View style={styles.brContent2}></View> */}
            {!expanded && (
              <TouchableOpacity
                onPress={handleToggleExpansion}
                style={styles.bgReadMore}
              >
                <Text style={styles.readMore}>Xem thêm</Text>
                <Image
                  style={styles.iconReadMore}
                  source={require("../../images/readmore.png")}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.brContent2}></View>

          <View style={styles.bgTextInfoPr1}>
            <Text style={styles.textInfoPr1}>Chi tiết sản phẩm</Text>
            {products.length > 0 && products[0].product_attributes && (
              <View>
                {products[0].product_attributes.map((attribute) => (
                  <Text key={attribute.id} style={styles.textDetailPr}>
                    {attribute.name_at}: {attribute.value}
                  </Text>
                ))}
              </View>
            )}
          </View>
          <View style={styles.brContent1}></View>
          <View style={styles.bgTextInfoPr}>
            <View>
              <Text style={styles.textInfoPr}>Đánh Giá Sản Phẩm</Text>

              <View style={styles.bgRating1}>
                <Rating
                  type="star"
                  ratingCount={5}
                  fractions={1}
                  jumpValue={1}
                  startingValue={products[0].avg_rating}
                  imageSize={15}
                  readonly={true}
                />
                <Text style={styles.textReviewPr}>
                  {products[0].avg_rating}/5
                </Text>
                <Text style={styles.textReviewPr1}>
                  ({products[0].count_cmtProduct} đánh giá)
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.brContent222222}></View>

          {/* comment detail */}
          <View style={styles.containerContent}>
            {/* <View>
              <Text
                style={{
                  color: "#ee4d2d",
                  fontWeight: 500,
                  fontSize: 14,
                  marginTop: 15,
                }}
              >
                Đánh giá từ người mua
              </Text>
            </View> */}
            <View style={styles.productRowContainer}>
              {/* comment */}
              <View>
                {productList.comments &&
                  productList.comments.map((comment, index) => (
                    <View key={index}>
                      <View
                        style={{
                          // flexDirection: "row",
                          marginTop: 20,
                          // marginBottom: 20,
                          // width: windownWidth - 30,
                          // marginLeft: 15,
                          // borderWidth: 1,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: 0,
                            marginBottom: 20,
                            height: 90,
                            // borderWidth: 1,
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
                                width: 330,
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

                      {/* list cmt reply */}
                      {comment.replies &&
                        comment.replies.map((reply, replyIndex) => (
                          <View key={replyIndex} style={{ marginLeft: 50 }}>
                            <View
                              style={{
                                flexDirection: "row",
                                marginTop: 10,
                                marginBottom: 10,
                                height: 100,
                                width: 320,
                                padding: 10,
                                borderRadius: 10,
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <View>
                                <Image
                                  source={{
                                    uri: productList.product.store_info.avt,
                                  }}
                                  style={styles.iconShop}
                                />
                              </View>
                              <View
                                style={{
                                  alignItems: "flex-start",
                                  justifyContent: "flex-start",
                                  width: "100%",
                                }}
                              >
                                <Text style={styles.textShop}>
                                  {productList.product.store_info.name_store} -
                                  [ Store ]
                                </Text>

                                <Text
                                  style={{
                                    color: "#636363",
                                    fontSize: 14,
                                    marginTop: 5,
                                    marginBottom: 5,
                                    width: 330,
                                  }}
                                >
                                  [{reply.id}] - {reply.content}
                                </Text>

                                <Text
                                  style={{
                                    color: "#636363",
                                    fontSize: 11,
                                    position: "absolute",
                                    bottom: 0,
                                    right: 30,
                                  }}
                                >
                                  {reply.created_at}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}

                      {/* submit cmt reply */}
                      {comment.newlySubmittedReply && (
                        <View style={{ marginLeft: 20 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              marginTop: 10,
                              marginBottom: 10,
                            }}
                          >
                            <View>
                              <Image
                                source={{
                                  uri: comment.newlySubmittedReply.account_info
                                    .avt,
                                }}
                                style={styles.iconShop}
                              />
                            </View>
                            <View
                              style={{
                                alignItems: "flex-start",
                                justifyContent: "flex-start",
                              }}
                            >
                              <Text style={styles.textShop}>
                                {
                                  comment.newlySubmittedReply.account_info
                                    .full_name
                                }
                              </Text>
                              <Text
                                style={{
                                  color: "#636363",
                                  fontSize: 14,
                                  marginTop: 5,
                                  marginBottom: 5,
                                  width: 330,
                                }}
                              >
                                [{comment.newlySubmittedReply.id}] -{" "}
                                {comment.newlySubmittedReply.content}
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
                                {comment.newlySubmittedReply.created_at}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      <View style={styles.brButton6666}></View>
                    </View>
                  ))}
              </View>
            </View>
          </View>

          {/* <View style={styles.brContent222222}></View> */}

          <View style={styles.brContent3}>
            <View style={styles.bgFooter}>
              <View style={styles.brFooter}></View>
              <Text style={styles.textOR}> Có thể bạn cũng thích </Text>
              <View style={styles.brFooter}></View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const FooterComponent = ({ navigation, productId, user }) => {
  //add to cart
  const [{ cartItems }, dispatchCart] = useCart();
  const [products, setProducts] = useState();

  const handleAddToCart = () => {
    if (user) {
      dispatchCart({ type: "ADD_TO_CART", payload: products });
    } else {
      navigation.navigate("Login");
    }
  };

  //product detail
  const getProductDetails = async (productId) => {
    try {
      const response = await axios.get(`/products/${productId}`);
      const productDetails = response.data;
      setProducts(productDetails);
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  useEffect(() => {
    getProductDetails(productId);
  }, [productId]);

  // console.log("====>", products);

  const handleChat = () => {
    if (user) {
    } else {
      navigation.navigate("Login");
    }
  };

  const handlePay = () => {
    if (user) {
      // navigation.navigate("Cart");
    } else {
      navigation.navigate("Login");
    }
  };

  return (
    <View style={styles.bgPayProduct}>
      <TouchableOpacity style={styles.bgIconChat} onPress={handleChat}>
        <Image
          source={require("../../images/mess.png")}
          style={styles.iconChat}
        ></Image>
        <Text style={styles.textIconChat}>Chat ngay</Text>
      </TouchableOpacity>

      <View style={styles.brFooterPay}></View>

      <TouchableOpacity style={styles.bgIconChat} onPress={handleAddToCart}>
        <Image
          source={require("../../images/addcart.png")}
          style={styles.iconChat}
        ></Image>
        <Text style={styles.textIconChat}>Thêm giỏ hàng</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bgPayProduct1} onPress={handlePay}>
        <Text style={styles.textPayProduct}>Mua ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  viewContainer: {
    flex: 1,
  },
  viewHeader: {
    flex: 11.5,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    flex: 82.5,
    backgroundColor: "white",

    // borderWidth: 2,
  },
  viewFooter: {
    // flex: 1,
    // // borderWidth: 1,
    // width: "100%",
    // height: "8%",
    // backgroundColor: "gray",

    flex: 6,
    // backgroundColor: "#EE4D2D",
  },
  slideWW: {
    height: 350,
    // backgroundColor: "gray",
    // width: '100%'
  },
  slideW: {
    // position: "relative",
    width: "100%",
    flex: 20,
    borderBottomWidth: 8,
    borderBottomColor: "#f0efef",
  },
  slide: {
    justifyContent: "center",
    width: "100%",
    backgroundColor: "transparent",
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  image: {
    maxWidth: "100%",
    height: "100%",
    // flex: 1,
  },
  paginationStyle: {
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: "white",
    borderRadius: 10,
    position: "absolute",
    top: 320,
    right: 10,
    // borderWidth: 0.5,
    // borderColor: "gray",
  },
  paginationText: {
    color: "#3d3d3d",
    fontSize: 14.5,
    fontWeight: "500",
  },

  bgContent: {
    width: windownWidth - 20,
    marginLeft: 10,
    marginTop: 10,
    // borderWidth: 1,
  },
  textNamePr: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    color: "#111111",
  },
  textPricePr: {
    fontSize: 17,
    fontWeight: "500",
    color: "#EE4D2D",
    // marginBottom: 15
  },
  customFont: {
    fontSize: 20,
  },
  bgTextNamePr: {
    marginTop: 3,
  },
  bgTextPriceNamePr: {
    marginTop: 0,
  },
  bgRating: {
    // borderWidth: 1,
    marginTop: 15,
    alignItems: "center",
    flexDirection: "row",
  },
  bgRating1: {
    marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  textRating: {
    marginLeft: 10,
    fontWeight: "400",
  },
  brIconLoginFB: {
    height: "100%",
    width: 1,
    backgroundColor: "#ebebeb",
    // marginRight: 10,
    marginLeft: 10,
  },
  bgIconProduct: {
    flexDirection: "row",
    marginLeft: 98,
  },
  iconMess: {
    height: 24,
    width: 24,
    marginLeft: 15,
  },
  iconInbox: {
    height: 23,
    width: 23,
    marginLeft: 15,
  },
  brContent: {
    marginTop: 15,
    height: 7,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginRight: 10,
  },
  brContent1: {
    height: 7,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginRight: 10,
  },
  bgShip: {
    width: windownWidth - 20,
    marginLeft: 10,
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    // borderWidth: 1,
    margin: 10,
  },
  iconShip: {
    height: 30,
    width: 30,
    marginRight: 10,
  },
  textIconShip: {
    fontSize: 14,
    fontWeight: "400",
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
    fontSize: 14,
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
    maxWidth: 170,
  },
  viewShop: {
    borderWidth: 1,
    borderColor: "#EE4D2D",
    padding: 5,
    width: 100,
    borderRadius: 5,
    position: "absolute",
    right: 5,
  },
  textViewShop: {
    color: "#EE4D2D",
    textAlign: "center",
  },
  bgInfoShop: {
    width: windownWidth - 20,
    marginLeft: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  textInfoShop: {
    marginRight: 20,
    fontSize: 13,
  },
  textArStore: {
    color: "#EE4D2D",
    fontSize: 13,
  },
  bgTextInfoPr: {
    width: windownWidth - 20,
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 12,
  },
  bgTextInfoPr1: {
    width: windownWidth - 20,
    marginLeft: 10,
    // flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "space-between",
    paddingTop: 12,
    paddingBottom: 12,
  },
  textInfoPr: {
    fontWeight: "500",
    fontSize: 14,
  },
  textInfoPr1: {
    fontWeight: "500",
    fontSize: 14,
    marginBottom: 10,
  },
  brContent2: {
    height: 2,
    width: "100%",
    backgroundColor: "#f0efef",
  },
  brContent222222: {
    height: 2,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginBottom: 10,
    // marginTop: 10,
  },
  bgTextDetailPr: {
    width: windownWidth - 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  textDetailPr: {
    lineHeight: 22,
    color: "#4b4b4b",
    textAlign: "justify",
  },
  bgReadMore: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  iconReadMore: {
    marginTop: 10,
    height: 14,
    width: 14,
  },
  readMore: {
    marginTop: 10,
    padding: 10,
    color: "#EE4D2D",
  },

  // ádads
  containerHeader: {
    marginTop: 40,
    // borderWidth: 1,
    width: windownWidth - 20,
    marginLeft: 10,
    // width: "100%",
    // height: "100%",
    backgroundColor: "white",
  },
  signIn: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  backgroundSignIn: {
    flexDirection: "row",
    width: "10%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#BCBCBC",
    borderRadius: 100,
    marginRight: 250,
    // elevation: 10,
  },

  iconSearch: {
    width: 26,
    height: 26,
  },
  textInputTK: {
    height: "100%",
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    marginRight: 15,
    color: "black",
  },
  backgroundCart: {
    flexDirection: "row",
    width: "10%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "black",
    borderRadius: 100,
    marginRight: 10,
  },
  backgroundMess: {
    flexDirection: "row",
    width: "10%",
    height: "60%",
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "#BCBCBC",
    borderRadius: 50,
  },
  iconFB: {
    marginLeft: 10,
    width: 29,
    height: 29,
  },
  iconGG: {
    width: 26,
    height: 26,
  },
  otherContent: {
    flex: 80,
  },
  textReviewPr: {
    color: "#EE4D2D",
    marginLeft: 10,
    fontWeight: "400",
  },
  textReviewPr1: {
    color: "#575757",
    marginLeft: 10,
    fontWeight: "400",
    fontSize: 13,
  },
  brContent3: {
    height: 50,
    width: "100%",
    backgroundColor: "#f0efef",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  bgFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 20,
  },
  brFooter: {
    height: 1,
    width: "15%",
    backgroundColor: "#999999",
  },
  textOR: {
    marginLeft: 15,
    marginRight: 15,
    fontWeight: "500",
    fontSize: 14,
    color: "#888888",
  },
  containerContent: {
    // borderWidth: 1,
    // height: "80%",
    // width: "100%",
    // backgroundColor: "#eeeeee",
    width: windownWidth - 20,
    marginLeft: 10,
    // justifyContent: "center",
  },
  productRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    // width: windownWidth - 15,
    // marginLeft: 8,
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
    height: 270,
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
  bgPayProduct: {
    flex: 1,
    // borderWidth: 2,
    flexDirection: "row",
  },
  bgIconChat: {
    width: "28%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#29A898",
  },

  iconChat: {
    marginTop: 5,
    width: 21,
    height: 21,
  },
  textIconChat: {
    marginTop: 2,
    color: "white",
    fontSize: 11,
  },
  bgPayProduct1: {
    width: "44%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EE4D2D",
  },
  textPayProduct: {
    color: "white",
  },
  brFooterPay: {
    width: 1,
    backgroundColor: "#ebebeb",
    // marginRight: 10,
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
