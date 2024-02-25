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

export default CategoryListStats = ({ navigation }) => {
  const [countProduct, setCountProduct] = useState(0);
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
          <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.textSignIn}>
              Danh sách danh mục ({countProduct})
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
  const [categorytList, setCategoryList] = useState([]);

  //call api category
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          endpoints.get_categories_by_store(storeId)
        );
        setCategoryList(response.data);

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

  console.log(categorytList);

  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          {categorytList && categorytList.length > 0 ? (
            categorytList.map((category) => {
              return (
                <View key={category.id} style={styles.productContainer}>
                  <View
                    style={{
                      flexDirection: "column",
                      width: "70%",
                      // border/Width: 1,
                      marginLeft: 5,
                      height: "100%",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={styles.nameProduct}>
                      {category.name_category}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "column",
                      width: "30%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.btnUpdate}
                      onPress={() => {
                        navigation.navigate("CategoryStats", {
                          categoryId: category.id,
                          categoryName: category.name_category,
                          storeId: storeId,
                        });
                      }}
                    >
                      <Text style={{ color: "white" }}>Thống kê</Text>
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
    marginLeft: 10,
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
    height: 55,
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
    fontSize: 15,
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
    // marginRight: 10,
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
