import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios, { endpoints } from "../../config/API";
import { AirbnbRating, Rating } from "react-native-ratings";
import { useRoute } from "@react-navigation/native";

import { useLogin } from "../../context/LoginContext";
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

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ProfileStore = ({ navigation }) => {
  const route = useRoute();
  const { storeID } = route.params;
  console.log("-------------------->", storeID);
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent storeID={storeID} navigation={navigation} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent navigation={navigation} storeID={storeID} />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent />
      </View>
    </View>
  );
};

const HeaderComponent = ({ navigation, storeID }) => {
  const [storeInfo, setStoreInfo] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [user, dispatch] = useLogin();
  const [followedStores, setFollowedStores] = useState([]);
  const [followerCount, setFollowerCount] = useState(null);

  //info store
  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await axios.get(endpoints.stores(storeID));
        setStoreInfo(response.data);
      } catch (error) {
        console.error("Error fetching store information:", error);
      }
    };

    fetchStoreInfo();
  }, [storeID]);

  //follow
  const handleFollow = async () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    try {
      await axios.post(endpoints.add_follow(storeID), {
        account_id: user.id,
      });
      setIsFollowing(true);
    } catch (error) {
      console.error("Error following store:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!user) {
      navigation.navigate("Login");
      return;
    }
    try {
      await axios.post(endpoints.add_follow(storeID), {
        account_id: user.id,
      });
      setIsFollowing(false);
    } catch (error) {
      console.error("Error unfollowing store:", error);
    }
  };

  //list follow store
  useEffect(() => {
    const fetchFollowedStores = async () => {
      try {
        const response = await axios.get(endpoints.get_list_follow_byUser);
        setFollowedStores(response.data);
      } catch (error) {
        console.error("Error fetching followed stores:", error);
      }
    };

    if (user) {
      fetchFollowedStores();
    }
  }, [user]);

  //check follow
  useEffect(() => {
    if (user && storeInfo) {
      const isStoreFollowed = followedStores.some(
        (follow) => follow.store === storeID && follow.follower === user.id
      );
      setIsFollowing(isStoreFollowed);
    }
  }, [user, storeInfo, followedStores, storeID]);

  //count follow
  useEffect(() => {
    const fetchFollowerCount = async () => {
      try {
        const response = await axios.get(endpoints.count_follower(storeID));
        setFollowerCount(response.data.count_follower);
      } catch (error) {
        console.error("Error fetching follower count:", error);
      }
    };

    fetchFollowerCount();
  }, [storeID]);

  // console.log("->>", storeInfo);

  return (
    <View style={styles.containerHeader}>
      <StatusBar barStyle="light-content" />
      {/* <View style={styles.signIn}>
        <TouchableOpacity style={styles.backgroundCart}>
          <Image
            source={require("../../images/back.png")}
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
          />
        </TouchableOpacity>
      </View> */}

      <View style={styles.bgStore}>
        {storeInfo && (
          <>
            <View>
              <Image style={styles.avtShop} source={{ uri: storeInfo.avt }} />
            </View>
            <View>
              <Text style={styles.textStore}>{storeInfo.name_store}</Text>

              <View style={styles.bgRating111}>
                <Image
                  source={require("../../images/star1.png")}
                  style={styles.iconStar}
                />
                <Text style={styles.textRating}>0/5.0</Text>
                <View style={styles.brIconLoginFB11}></View>
                <Text style={styles.textRating}>
                  {followerCount} Người theo dõi
                </Text>
              </View>
            </View>

            <View style={{ position: "absolute", right: 3 }}>
              {isFollowing ? (
                <TouchableOpacity
                  style={styles.viewShop}
                  onPress={handleUnfollow}
                >
                  <Image
                    source={require("../../images/plus1.png")}
                    style={styles.iconPlus}
                  />
                  <Text style={styles.textViewShop}>Unfollow</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.viewShop}
                  onPress={handleFollow}
                >
                  <Image
                    source={require("../../images/plus1.png")}
                    style={styles.iconPlus}
                  />
                  <Text style={styles.textViewShop}>Follow</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.viewShop1}>
                <Image
                  source={require("../../images/mess1.png")}
                  style={styles.iconChat}
                />
                <Text style={styles.textViewShop}>Nhắn tin</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const ContentComponent = ({ navigation, storeID }) => {
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsFilter, setProductsFilter] = useState([]);
  const [idProducts, setIdProducts] = useState([]);
  const [initialProducts, setInitialProducts] = useState([]);

  //call data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProducts = await axios.get(
          endpoints.get_products_by_store_true(storeID)
        );
        setInitialProducts(responseProducts.data);
        setProductsFilter(responseProducts.data);
        const idPro = responseProducts.data.map(
          (product) => product.product.id
        );

        setIdProducts(idPro);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setTimeout(() => {
          setIsLoadingProducts(false);
        }, 1000);
      }
    };

    fetchData();
  }, [storeID]);

  //format price
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

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
      setProductsFilter(response.data);
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

      setProductsFilter(response.data);
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

      setProductsFilter(response.data);
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
          setProductsFilter(initialProducts);
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
    <ScrollView stickyHeaderIndices={[0]}>
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            backgroundColor: "white",
          }}
        >
          <TouchableOpacity
            style={styles.bgItem}
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
            style={styles.bgItem}
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
            style={styles.bgItem}
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
            style={styles.bgItem1}
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
        {isLoadingProducts ? (
          <ActivityIndicator style={styles.ActivityIndicator} />
        ) : (
          <View style={styles.productRowContainer}>
            {productsFilter && productsFilter.length > 0 ? (
              productsFilter.map((product) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("ProductDetail", {
                        productId: product.product.id || product.id,
                      });
                    }}
                    key={product.product.id}
                    style={styles.productContainer}
                  >
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

                    <View style={styles.bgRating}>
                      <Rating
                        type="star"
                        ratingCount={5}
                        // showRating={true}
                        // ratingTextColor="black"
                        fractions={1}
                        jumpValue={1}
                        startingValue={
                          product.avg_rating || product.product.avg_rating
                        }
                        imageSize={10}
                        readonly={true}
                      />
                      {/* <Text style={styles.textRating}>{raTing}</Text> */}
                      {/* <View style={styles.brIconLoginFB}></View> */}
                      <Text style={styles.textRating1}>
                        Đã bán{" "}
                        {product.quantity_sold || product.product.quantity_sold}
                      </Text>
                    </View>
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
    flex: 19,
    backgroundColor: "#e92802ec",
    // paddingBottom: 50,
    // zIndex: 100
    // backgroundColor: "white",
    // borderWidth: 4,
  },
  viewContent: {
    width: "100%",
    flex: 75,
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
    marginTop: 50,
    // width: "100%",
    // height: "100%",
  },

  signIn: {
    width: windownWidth - 15,
    marginLeft: 10,
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
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
    fontSize: 14.5,
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
    marginTop: 30,
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
    color: "white",
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
    bottom: 10,
    left: 10,
    alignItems: "center",
    flexDirection: "row",
    // backgroundColor:
  },
  bgRating1: {
    marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  // textRating: {
  //   fontSize: 12,
  //   marginLeft: 8,
  //   fontWeight: "400",
  //   color: "white",
  // },
  brIconLoginFB11: {
    height: "95%",
    width: 1,
    backgroundColor: "#acacac",
    // marginRight: 10,
    marginLeft: 5,
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
    padding: 15,
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
    height: 285,
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
    bottom: 33,
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
  bgRating111: {
    // borderWidth: 1,
    marginTop: 10,
    alignItems: "center",
    flexDirection: "row",
  },
  bgRating1: {
    marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  textRating: {
    color: "white",
    marginLeft: 5,
    fontSize: 12,
    fontWeight: "400",
  },
  textRating1: {
    marginLeft: 10,
    fontSize: 11,
    fontWeight: "400",
  },
  brIconLoginFB: {
    height: "100%",
    width: 1,
    backgroundColor: "#ebebeb",
    // marginRight: 10,
    marginLeft: 10,
  },
});
