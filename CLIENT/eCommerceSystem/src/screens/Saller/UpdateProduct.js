import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
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
import axios, { endpoints } from "../../config/API";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRefreshData } from "../../context/RefreshDataContext";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default UpdateProduct = ({ navigation }) => {
  const route = useRoute();
  const { product, storeData } = route.params;
  // console.log("---------------", product);
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          product={product}
          storeData={storeData}
          navigation={navigation}
        />
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
            <Text style={styles.textSignIn}>Cập nhật sản phẩm</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ product, storeData, navigation }) => {
  const { dispatch } = useRefreshData();

  const [categories, setCategories] = useState([]);
  const [additionalFields, setAdditionalFields] = useState(
    (product.product_attributes || [{}]).map(({ id, ...rest }) => ({
      attribute_id: id,
      ...rest,
    }))
  );
  const [additionalImages, setAdditionalImages] = useState(
    (product.images || [{}]).map(({ id, ...rest }) => ({
      image_id: id,
      ...rest,
    }))
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [productName, setProductName] = useState(product.name_product);
  const [productDescription, setProductDescription] = useState(
    product.description
  );
  const [productPrice, setProductPrice] = useState(product.price.toString());
  const [productQuantity, setProductQuantity] = useState(
    product.quantity.toString()
  );

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
  }, [product]);

  //chage image
  const handleImagePress = (index) => {
    if (index >= 0 && index < additionalImages.length) {
      pickImage(index);
    } else {
      console.warn("Invalid image index");
    }
  };
  //image product
  const pickImage = async (indexToUpdate) => {
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

      if (indexToUpdate !== null && indexToUpdate !== undefined) {
        if (indexToUpdate >= 0 && indexToUpdate < additionalImages.length) {
          const updatedImages = [...additionalImages];
          updatedImages[indexToUpdate] = {
            ...updatedImages[indexToUpdate],
            thumbnail: localUri,
          };
          setAdditionalImages(updatedImages);
        } else {
          console.warn("Invalid image index to update");
        }
      } else {
        setAdditionalImages((prevImages) => [
          ...prevImages,
          {
            // image_id: maxImageId + 1,
            // product: product.id,
            thumbnail: localUri,
          },
        ]);
      }
    } else {
      console.log("User canceled image picker");
    }
  };

  const addMoreImages = () => {
    pickImage();
  };

  const handleRemoveImage = (index, imageId) => {
    if (imageId) {
      handleDeleteImages(imageId);
    }
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    setAdditionalImages(updatedImages);
  };

  //attribute product
  const handleAddField = () => {
    setAdditionalFields([...additionalFields, {}]);
  };

  const handleRemoveField = (index, attributeId) => {
    if (attributeId) {
      handleDeleteAttribute(attributeId);
    }

    const updatedFields = [...additionalFields];
    updatedFields.splice(index, 1);
    setAdditionalFields(updatedFields);
  };

  //update product
  const handleSaveProduct = async () => {
    try {
      const formData = new FormData();

      formData.append("name_product", productName);
      formData.append("description", productDescription);
      formData.append("price", parseFloat(productPrice));
      formData.append("quantity", productQuantity);
      // console.log("so luongg", productQuantity);
      formData.append("category_id", selectedCategory);

      additionalFields.forEach((attribute, index) => {
        formData.append(`attribute_id`, attribute.attribute_id);
        formData.append(`name_at`, attribute.name_at);
        formData.append(`value`, attribute.value);
      });

      additionalImages.forEach((image, index) => {
        const filename = image.thumbnail.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `images/${match[1]}` : `images`;

        formData.append(`image_id`, image.image_id);
        formData.append(`thumbnail`, {
          uri: image.thumbnail,
          name: filename,
          type,
        });
      });

      await axios.patch(endpoints.update_product(product.id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Product updated successfully!");
      navigation.navigate("ProductList", {
        storeData: storeData,
        refreshData: true,
      });
      dispatch({ type: "REFRESH_DATA" });
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  //delete attribute
  const handleDeleteAttribute = async (attributeId) => {
    try {
      await axios.delete(`/attribute/${attributeId}/`);
      console.log(`Thuộc tính ${attributeId} đã được xóa thành công!`);
    } catch (error) {
      console.error(`Lỗi khi xóa thuộc tính ${attributeId}:`, error);
    }
  };
  //delete images
  const handleDeleteImages = async (imageID) => {
    try {
      await axios.delete(`/images/${imageID}/`);
      console.log(`Ảnh ${imageID} đã được xóa thành công!`);
    } catch (error) {
      console.error(`Lỗi khi xóa ảnh ${imageID}:`, error);
    }
  };

  // console.log("image===========", additionalImages);

  //render item
  const renderItem = ({ item }) => {
    switch (item) {
      case 1:
        return (
          <View style={{ height: "100%" }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.bgAddImg}
            >
              {additionalImages.length > 0 ? (
                additionalImages.map((image, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.btnAddImg}
                    onPress={() => handleImagePress(i)}
                  >
                    <Image
                      style={styles.image}
                      source={{ uri: image.thumbnail }}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={{
                        backgroundColor: "white",
                        position: "absolute",
                        top: -10,
                        right: -10,
                      }}
                      onPress={() => handleRemoveImage(i, image.image_id)}
                    >
                      <Image
                        source={require("../../images/delete.png")}
                        style={styles.iconDelete}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              ) : (
                <Text>Không có ảnh</Text>
              )}

              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  style={styles.btnAddImg1}
                  onPress={addMoreImages}
                >
                  <Text style={{ fontWeight: "500", color: "#ee4d2d" }}>
                    Thêm ảnh
                  </Text>
                </TouchableOpacity>
              </View>
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
                  defaultValue={product.name_product}
                  value={productName}
                  onChangeText={(text) => setProductName(text)}
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
                  defaultValue={product.description}
                  value={productDescription}
                  onChangeText={(text) => setProductDescription(text)}
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
                  defaultValue={product.price.toString()}
                  value={productPrice}
                  onChangeText={(text) => setProductPrice(text)}
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
                  placeholder="Nhập kho hàng"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa9a9"
                  defaultValue={product.quantity.toString()}
                  value={productQuantity}
                  onChangeText={(text) => setProductQuantity(text)}
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

              {additionalFields.map((field, index) => (
                <View key={index}>
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
                        borderWidth: 1,
                        marginTop: 10,
                        borderColor: "#c2c2c2",
                        marginBottom: 5,
                        padding: 5,
                        borderRadius: 5,
                      }}
                    >
                      <Text style={{ marginRight: 10 }}>{field.id}</Text>
                      <TextInput
                        style={styles.textName1}
                        placeholder="vd: Màu sắc"
                        autoCapitalize="none"
                        placeholderTextColor="#aaa9a9"
                        defaultValue={field.name_at}
                        onChangeText={(text) => {
                          const updatedFields = [...additionalFields];
                          updatedFields[index].name_at = text;
                          setAdditionalFields(updatedFields);
                        }}
                      />
                      <TextInput
                        style={styles.textName2}
                        placeholder="vd: Đen bóng"
                        autoCapitalize="none"
                        placeholderTextColor="#aaa9a9"
                        defaultValue={field.value}
                        onChangeText={(text) => {
                          const updatedFields = [...additionalFields];
                          updatedFields[index].value = text;
                          setAdditionalFields(updatedFields);
                        }}
                      />
                      <TouchableOpacity
                        style={{
                          backgroundColor: "white",
                          position: "absolute",
                          top: -10,
                          right: -10,
                        }}
                        onPress={() =>
                          handleRemoveField(index, field.attribute_id)
                        }
                      >
                        <Image
                          source={require("../../images/delete.png")}
                          style={styles.iconDelete}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
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
                  marginTop: 10,
                  marginBottom: 5,
                  padding: 5,
                }}
              >
                <TouchableOpacity
                  style={{
                    backgroundColor: "white",
                  }}
                ></TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ marginTop: 16, marginBottom: 20 }}
                onPress={handleAddField}
              >
                <Text style={styles.textAdd}>Thêm thuộc tính</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.brContent}></View>

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
                  handleSaveProduct();
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

            {/* <View style={styles.bgAddName11}>
              {additionalFields.map((field, index) => (
                <View key={index}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      // marginRight: 90,
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
                      />
                      <TextInput
                        style={styles.textName2}
                        placeholder="vd: Đen bóng"
                        autoCapitalize="none"
                        placeholderTextColor="#aaa9a9"
                      />
                      <TouchableOpacity
                        style={{
                          backgroundColor: "white",
                          position: "absolute",
                          top: -10,
                          right: -10,
                        }}
                        onPress={() => handleRemoveField(index)}
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
            </View> */}

            {/* <View style={{ justifyContent: "center", alignItems: "center" }}> */}

            {/* </View> */}

            <View style={styles.brContent1}></View>
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
    />
  );
};

const FooterComponent = () => {
  return;
  // <TouchableOpacity
  //   style={{
  //     width: "100%",
  //     height: "100%",
  //     alignItems: "center",
  //     justifyContent: "center",
  //   }}
  //   onPress={handleSaveProduct}
  // >
  //   <Text
  //     style={{
  //       fontSize: 16,
  //       color: "white",
  //       fontWeight: "500",
  //     }}
  //   >
  //     Lưu sản phẩm
  //   </Text>
  // </TouchableOpacity>
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
    backgroundColor: "#ee4d2d",
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
  bgAddImg: {
    // width: windownWidth - 30,
    // marginLeft: 15,
    // height: 120,
    // backgroundColor: "white",
    // // alignItems: "center",
    // // justifyContent: "flex-start",
    // flexDirection: "row",
    // marginTop: 10,
    // marginBottom: 10,
  },
  btnAddImg: {
    backgroundColor: "white",
    // height: 85,
    // width: 95,
    // paddingTop: 30,
    // paddingBottom: 30,
    // paddingLeft: 20,
    // paddingRight: 20,
    margin: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ee4d2d",
    alignItems: "center",
    justifyContent: "center",
  },
  btnAddImg1: {
    backgroundColor: "white",
    // height: 85,
    // width: 95,
    // paddingTop: 30,
    // paddingBottom: 30,
    // paddingLeft: 20,
    // paddingRight: 20,
    height: 40,
    width: 100,
    margin: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderStyle: "dashed",
    borderColor: "#ee4d2d",
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
  bgAddName11: {
    width: windownWidth - 20,
    // marginTop: 10,
    marginLeft: 10,
    // height: 100,
    // borderWidth: 1,
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
    width: 110,
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
    width: 110,
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
  image: {
    width: 110,
    height: 110,
    // margin: 5,
  },
  textAddPrice: {},
});
