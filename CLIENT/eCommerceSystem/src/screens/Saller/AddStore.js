import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";

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
import axios, { endpoints, authApi } from "../../config/API";
import { LoginContext } from "../../../App";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default AddStore = ({ navigation }) => {
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
          <TouchableOpacity style={styles.bgIconMess}>
            <Image
              source={require("../../images/111.png")}
              style={styles.iconBack}
            ></Image>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.textSignIn}>Thêm cửa hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const [nameStore, setNameStore] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [user, dispatch] = useContext(LoginContext);

  //upload avt
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
      setAvatar(localUri);
    } else {
      console.log("User canceled image picker");
    }
  };
  // console.log(user.id);
  //create store
  const registerStore = async () => {
    try {
      const filename = avatar.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `avatar/${match[1]}` : `avatar`;
      const formData = new FormData();
      formData.append("name_store", nameStore);
      formData.append("address", address);
      formData.append("user", user.id);
      formData.append("avt", { uri: avatar, name: filename, type });

      console.log(user.id);
      const api = await authApi();

      const response = await api.post(endpoints.create_store, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        console.log("Đăng ký cửa hàng thành công:", data);
        navigation.navigate("Profile", { refreshData: true });
      } else {
        console.log("Đăng ký cửa hàng không thành công:");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  return (
    <View style={{ height: "100%" }}>
      {/* <View style={styles.bgAddImg}>
        <TouchableOpacity style={styles.btnAddImg}>
          <Text style={styles.textAddImg}>Thêm ảnh</Text>
        </TouchableOpacity>
      </View> */}

      {/* avt */}
      <TouchableOpacity style={styles.bgInputAVT} onPress={pickImage}>
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            style={{
              width: 250,
              height: 150,
              resizeMode: "contain",
              // marginTop: 30,
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Image
              source={require("../../images/upload.png")}
              style={{ width: 30, height: 30 }}
            />
            <Text style={styles.textInputAVT}>Tải ảnh đại diện</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.brContent}></View>

      <View style={styles.bgAddName1}>
        <View style={styles.btnAddName}>
          <Text style={styles.textAddName1}>
            Chủ cửa hàng <Text>[ {user.full_name} ]</Text>
          </Text>

          {/* <TextInput
            style={styles.textName}
            placeholder="Nhập tên cửa hàng"
            autoCapitalize="none"
            placeholderTextColor="#aaa9a9"
            onChangeText={(text) => setNameStore(text)}
          /> */}
        </View>
      </View>
      <View style={styles.brContent}></View>

      <View style={styles.bgAddName}>
        <View style={styles.btnAddName}>
          <Text style={styles.textAddName}>
            Tên cửa hàng <Text style={{ color: "#ee4d2d" }}>*</Text>
          </Text>
          <TextInput
            style={styles.textName}
            placeholder="Nhập tên cửa hàng"
            autoCapitalize="none"
            placeholderTextColor="#aaa9a9"
            onChangeText={(text) => setNameStore(text)}
          />
        </View>
      </View>
      <View style={styles.brContent}></View>

      <View style={styles.bgAddName}>
        <View style={styles.btnAddName}>
          <Text style={styles.textAddName}>
            Địa chỉ <Text style={{ color: "#ee4d2d" }}>*</Text>
          </Text>
          <TextInput
            style={styles.textName}
            placeholder="Nhập địa chỉ"
            autoCapitalize="none"
            placeholderTextColor="#aaa9a9"
            onChangeText={(text) => setAddress(text)}
          />
        </View>
      </View>
      <View style={styles.brContent}></View>

      <TouchableOpacity
        style={{
          width: "100%",
          height: 50,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ee4d2d",
          borderRadius: 5,
          width: windownWidth - 30,
          marginLeft: 15,
          marginTop: 30,
        }}
        onPress={registerStore}
      >
        <Text
          style={{
            fontSize: 16,
            color: "white",
            fontWeight: "500",
          }}
        >
          Lưu thông tin
        </Text>
      </TouchableOpacity>
    </View>
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
    flex: 83,
    // marginTop: 1,

    backgroundColor: "white",
    // borderWidth: 1,
  },
  viewFooter: {
    // borderWidth: 1,
    width: "100%",
    flex: 6.5,
    // backgroundColor: "#ee4d2d",
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
    height: 10,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginRight: 10,
  },
  bgAddImg: {
    width: windownWidth - 30,
    marginLeft: 15,
    height: 120,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  btnAddImg: {
    backgroundColor: "white",
    height: 85,
    width: 95,
    // paddingTop: 30,
    // paddingBottom: 30,
    // paddingLeft: 20,
    // paddingRight: 20,
    borderWidth: 1,
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
    width: windownWidth - 30,
    marginLeft: 15,
    height: 50,
    backgroundColor: "white",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  textAddName: {
    fontSize: 14.5,
  },
  textAddName1: {
    color: "#ee4d2d",
    fontSize: 14.5,
  },
  textName: {
    marginTop: 10,
    fontSize: 13.5,
  },
  textName1: {
    width: 150,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    fontSize: 13.5,
    // borderWidth: 1,
    // marginLeft: 200,
  },
  textName2: {
    width: 150,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    fontSize: 13.5,
    // borderWidth: 1,
    marginLeft: 62,
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
  textInputAVT: {
    color: "#969696",
    marginTop: 5,
    fontWeight: "400",
    fontSize: 14.5,
  },
  bgInputAVT: {
    width: windownWidth - 60,
    marginLeft: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});
