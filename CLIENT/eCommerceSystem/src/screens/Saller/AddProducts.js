import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import { useRefreshData } from "../../context/RefreshDataContext";

import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import DropDown from "react-native-dropdown-picker";
import axios, { endpoints } from "../../config/API";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default AddProducts = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>Thêm sản phẩm</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const { dispatch } = useRefreshData();
  const route = useRoute();
  const { storeData } = route.params;
  const idStore = storeData[0].id;

  // console.log(idStore);

  const [isOpenCategory, setIsOpenCategory] = useState(false);

  const [nameProduct, setNameProduct] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [attributeFields, setAttributeFields] = useState([]);
  const [images, setImages] = useState([]);
  const [isAddingAttribute, setIsAddingAttribute] = useState(false);

  //category
  const fetchCategories = async () => {
    try {
      const response = await axios.get(endpoints.categories);
      const data = response.data;

      const formattedCategories = data.map((category) => ({
        label: category.name_category,
        value: category.id,
      }));

      setCategories(formattedCategories);
    } catch (error) {
      console.error("Lỗi: ", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addAttributeField = () => {
    setIsAddingAttribute(true);
    setAttributeFields([...attributeFields, { name_at: "", value: "" }]);
  };

  const removeAttributeField = (index) => {
    const updatedAttributeFields = [...attributeFields];
    updatedAttributeFields.splice(index, 1);
    setAttributeFields(updatedAttributeFields);
  };

  const handleAttributeChange = (index, key, text) => {
    const updatedAttributeFields = [...attributeFields];
    updatedAttributeFields[index][key] = text;
    setAttributeFields(updatedAttributeFields);
  };

  //create product
  const handleCreateProduct = async () => {
    try {
      if (
        !nameProduct ||
        !description ||
        !price ||
        !quantity ||
        !selectedCategory ||
        !attributeFields ||
        !images
      ) {
        Alert.alert("Thông báo:", "Vui lòng nhập đầy đủ thông tin!");
      } else {
        const productData = {
          name_product: nameProduct,
          description: description,
          price: parseFloat(price),
          quantity: parseInt(quantity),
          category_id: selectedCategory,
        };

        const response = await axios.post(
          endpoints.create_product(idStore),
          productData
        );

        const productId = response.data.id;

        console.log(idStore);

        await uploadProductImages(productId);
        await createAttribute(productId);

        navigation.navigate("ProductList", {
          storeData: storeData,
          refreshData: true,
        });

        dispatch({ type: "REFRESH_DATA" });

        console.log("Product created successfully!");
      }
    } catch (error) {
      console.error("Error creating product:", error);
    }
  };

  //create image
  const uploadProductImages = async (productId) => {
    try {
      if (images.length === 0) {
        console.log("Không có ảnh để tải lên!");
        return;
      }

      const imagePromises = images.map(async (image) => {
        const filename = image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `images/${match[1]}` : `images`;

        const formData = new FormData();
        formData.append("thumbnail", { uri: image, name: filename, type });

        await axios.post(endpoints.add_image(productId), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      });

      await Promise.all(imagePromises);

      console.log("Images uploaded successfully!");
    } catch (error) {
      console.error("Error uploading images:", error);
      // console.log(images);
      // console.log(productId);
    }
  };

  //create attribute
  const createAttribute = async (productId) => {
    try {
      const formData = new FormData();

      attributeFields.forEach((attribute, index) => {
        formData.append(`name_at[]`, attribute.name_at);
        formData.append(`value[]`, attribute.value);
      });

      formData.append("product_id", productId);

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      await axios.post(endpoints.add_attribute(productId), formData, config);

      console.log("Attribute created successfully!");
      // console.log(attributeFields);
    } catch (error) {
      console.error("Error creating attribute:", error);
      // console.log(attributeFields);
      // console.log(productId);
    }
  };

  //upload img
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      console.log("Permission not granted");
      return;
    }

    const options = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    };

    let result;
    if (Platform.OS !== "web") {
      result = await ImagePicker.launchImageLibraryAsync(options);
    } else {
      result = await ImagePicker.launchImageLibraryAsync();
    }

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setImages((prevImages) => [...prevImages, localUri]);
    } else {
      console.log("User canceled image picker");
    }
    // console.log(images);
  };

  const addMoreImages = () => {
    pickImage();
  };

  //render item
  const renderItem = ({ item }) => {
    switch (item) {
      case 1:
        return (
          <View style={{ height: "100%" }}>
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              style={styles.bgAddImg}
            >
              <View style={styles.btnAddImg} onPress={pickImage}>
                {images.length > 0 ? (
                  <View
                    style={{
                      width: "100%",
                      flexDirection: "row",
                    }}
                  >
                    {images.map((image, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          borderWidth: 1,
                          borderStyle: "dashed",
                          borderColor: "#ee4d2d",
                          padding: 5,
                          marginRight: 15,
                        }}
                      >
                        <Image
                          source={{ uri: image }}
                          style={{
                            width: 100,
                            height: 100,
                            resizeMode: "cover",
                          }}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <></>
                )}
              </View>

              <TouchableOpacity
                style={{ marginTop: 40 }}
                onPress={addMoreImages}
              >
                <Text style={styles.textAdd}>Thêm ảnh</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.brContent}></View>

            <View style={styles.bgAddName}>
              <View style={styles.btnAddName}>
                <Text style={styles.textAddName}>
                  Tên sản phẩm <Text style={{ color: "#ee4d2d" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textName}
                  placeholder="Nhập tên sản phẩm"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa9a9"
                  onChangeText={(text) => setNameProduct(text)}
                />
              </View>
            </View>
            <View style={styles.brContent}></View>

            <View style={styles.bgAddName}>
              <View style={styles.btnAddName}>
                <Text style={styles.textAddName}>
                  Mô tả sản phẩm <Text style={{ color: "#ee4d2d" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textName}
                  placeholder="Nhập mô tả sản phẩm"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa9a9"
                  onChangeText={(text) => setDescription(text)}
                />
              </View>
            </View>
            <View style={styles.brContent}></View>

            <View style={styles.bgAddPrice}>
              <View style={styles.btnAddPrice}>
                <Image
                  source={require("../../images/iconprice.png")}
                  style={styles.ImgPrice}
                ></Image>

                <Text style={styles.textAddPrice}>
                  Giá <Text style={{ color: "#ee4d2d" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textNamePrice}
                  placeholder="Nhập giá"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa9a9"
                  onChangeText={(text) => setPrice(text)}
                />
              </View>
            </View>
            <View style={styles.brButton6}></View>

            <View style={styles.bgAddPrice}>
              <View style={styles.btnAddPrice}>
                <Image
                  source={require("../../images/quantity.png")}
                  style={styles.ImgPrice}
                ></Image>

                <Text style={styles.textAddPrice}>
                  Kho hàng <Text style={{ color: "#ee4d2d" }}>*</Text>
                </Text>
                <TextInput
                  style={styles.textNamePrice}
                  placeholder="Nhập số lượng"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa9a9"
                  onChangeText={(text) => setQuantity(text)}
                />
              </View>
            </View>
            <View style={styles.brButton6}></View>

            <View style={styles.bgAddCategory}>
              <View style={styles.btnAddCategory}>
                <View
                  style={{
                    flexDirection: "row",
                    // borderWidth: 1,
                    width: 100,
                    // paddingRight: 250,
                    marginRight: 95,
                    // marginLeft: 20
                  }}
                >
                  <Image
                    source={require("../../images/list.png")}
                    style={styles.ImgList}
                  ></Image>

                  <Text style={styles.textAddPrice}>
                    Ngành hàng <Text style={{ color: "#ee4d2d" }}>*</Text>
                  </Text>
                </View>

                <DropDown
                  style={styles.inputBgOption}
                  items={categories}
                  open={isOpenCategory}
                  setOpen={() => setIsOpenCategory(!isOpenCategory)}
                  value={selectedCategory}
                  setValue={(val) => setSelectedCategory(val)}
                  maxHeight={450}
                  textStyle={{ color: "black" }}
                  placeholder="Chọn"
                  scrollViewProps={{
                    keyboardShouldPersistTaps: "handled",
                    // contentContainerStyle: { paddingBottom: 20 },
                  }}
                />
              </View>
            </View>

            <View style={styles.brContent}></View>

            <View style={styles.bgAddName1}>
              <View style={{ width: "100%", marginLeft: 10 }}>
                <Text style={styles.textAddName}>
                  Thông tin sản phẩm <Text style={{ color: "#ee4d2d" }}>*</Text>
                </Text>
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    // borderWidth: 1,
                    marginTop: 10,
                    // borderColor: "#c2c2c2",
                    marginBottom: 5,
                    padding: 5,
                    // borderRadius: 5,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      backgroundColor: "white",
                      // position: "absolute",
                      // top: -10,
                      // right: -10,
                    }}
                    // onPress={() => handleRemoveField(index)}
                  >
                    {/* <Image
                        source={require("../images/delete.png")}
                        style={styles.iconDelete}
                      ></Image> */}
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={{ marginTop: 16, marginBottom: 5 }}
                  onPress={addAttributeField}
                >
                  <Text style={styles.textAdd}>Thêm thuộc tính</Text>
                </TouchableOpacity>
              </View>
            </View>

            {attributeFields.map((field, index) => (
              <View
                key={index}
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 5,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      borderWidth: 1,
                      marginTop: 10,
                      borderColor: "#c2c2c2",
                      marginBottom: 5,
                      padding: 5,
                      borderRadius: 5,
                    }}
                  >
                    <TextInput
                      style={styles.textName1}
                      placeholder="vd: Màu sắc"
                      autoCapitalize="none"
                      placeholderTextColor="#aaa9a9"
                      value={field.name_at}
                      onChangeText={(text) =>
                        handleAttributeChange(index, "name_at", text)
                      }
                    />
                    <TextInput
                      style={styles.textName2}
                      placeholder="vd: Đen bóng"
                      autoCapitalize="none"
                      placeholderTextColor="#aaa9a9"
                      value={field.value}
                      onChangeText={(text) =>
                        handleAttributeChange(index, "value", text)
                      }
                    />
                    <TouchableOpacity
                      style={{
                        backgroundColor: "white",
                        position: "absolute",
                        top: -10,
                        right: -10,
                      }}
                      onPress={() => removeAttributeField(index)}
                    >
                      <Image
                        source={require("../../images/delete.png")}
                        style={styles.iconDelete}
                      ></Image>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.brContent1111}></View>

            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
                marginBottom: 30,
              }}
            >
              <TouchableOpacity
                style={{
                  width: 250,
                  height: 45,
                  backgroundColor: "#ee4d2d",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 7,
                }}
                onPress={() => {
                  console.log("Button pressed");
                  handleCreateProduct();
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "white",
                    fontWeight: "500",
                  }}
                >
                  Lưu sản phẩm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <FlatList
      // style={styles.containerContent}
      data={[1]}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      // ListFooterComponent={
      //   <FooterComponent handleCreateProduct={handleCreateProduct} />
      // }
    />
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
    flex: 12,
    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewContent: {
    width: "100%",
    flex: 88,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 0,
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
  brButton6: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
  },
  brButton2: {
    height: 1.5,
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
    left: 20,
  },
  brContent: {
    // marginTop: 15,
    height: 13,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginRight: 10,
  },
  brContent1: {
    height: 13,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginBottom: 20,
    marginTop: 10,
  },
  brContent1111: {
    height: 13,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginBottom: 20,
    marginTop: 15,
    // marginTop: 10
  },
  bgAddImg: {
    width: windownWidth - 30,
    marginLeft: 15,
    height: 120,
    backgroundColor: "white",
    // alignItems: "center",
    // justifyContent: "flex-start",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
  },
  btnAddImg: {
    backgroundColor: "white",
    // height: 85,
    // width: "100%",
    // paddingTop: 30,
    // paddingBottom: 30,
    // paddingLeft: 20,
    // paddingRight: 20,

    alignItems: "center",
    justifyContent: "center",
  },
  textAddImg: {
    color: "#ee4d2d",
    fontSize: 13,
  },

  bgAddName: {
    width: windownWidth - 30,
    marginLeft: 15,
    height: 80,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "center",
  },

  bgAddName1: {
    width: windownWidth - 20,
    marginTop: 10,
    marginLeft: 10,
    // height: 100,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  textAddName: {
    // marginTop: 10,
    fontSize: 14.5,
  },
  textName: {
    marginTop: 10,
    fontSize: 13.5,
  },
  textName1: {
    width: 140,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 2,
    marginLeft: 10,
    fontSize: 13.5,
    // borderWidth: 1,
    // marginLeft: 200,
  },
  textName2: {
    paddingRight: 10,
    width: 140,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 2,
    // marginBottom: 5,
    fontSize: 13.5,
    // borderWidth: 1,
    marginLeft: 30,
  },
  bgAddPrice: {
    width: windownWidth - 30,
    marginLeft: 15,
    height: 50,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  btnAddPrice: {
    // borderWidth: 1,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    // position: 'relative',
  },
  ImgPrice: {
    height: 20,
    width: 20,
    marginRight: 8,
  },
  ImgList: {
    height: 19,
    width: 19,
    marginRight: 7,
  },
  textNamePrice: {
    position: "absolute",
    right: 0,
    textAlign: "right",
  },
  bgOption: {
    width: windownWidth - 60,
    marginLeft: 30,
    marginTop: 10,
    // backgroundColor: "red",
    // height: 53,
  },
  textBgOption: {
    marginTop: 10,
    fontSize: 15,
    color: "#4b4b4b",
    fontWeight: "500",
    marginBottom: 0,
  },
  inputBgOption: {
    borderWidth: 0,
    borderRadius: 5,
    marginLeft: 15,
    // marginTop: 10,
    // marginBottom: 10,
    zIndex: 2,
    // width: 150
    // borderBottomWidth: 1,
    // borderColor: "#dddddd",
    // marginLeft: 100
    // position: 'absolute',
    // right: 0
  },
  bgAddCategory: {
    width: windownWidth - 60,
    marginLeft: 30,
    height: 50,
    // borderWidth: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },
  btnAddCategory: {
    // borderWidth: 1,
    width: "49%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    // marginLeft: 25
    // position: 'relative',
  },
  iconDelete: {
    height: 22,
    width: 22,
  },
  textAdd: {
    borderWidth: 1,
    borderColor: "#ee4d2d",
    paddingTop: 7,
    paddingBottom: 7,
    paddingLeft: 17,
    paddingRight: 17,
    // marginLeft: 20,
    fontWeight: "400",
    color: "#ee4d2d",
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ee4d2d",
  },
});
