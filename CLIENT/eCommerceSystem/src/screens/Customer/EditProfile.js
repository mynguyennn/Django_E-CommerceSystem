import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Alert } from "react-native";

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
import { useLogin } from "../../context/LoginContext";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default EditProfile = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>Thông tin tài khoản</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const [user, dispatch] = useLogin();

  // console.log("user========>", user);

  const [passHidden, setPassHidden] = useState(true);

  const [isOpenRole, setIsOpenRole] = useState(false);
  const [isOpenGender, setIsOpenGender] = useState(false);
  const [roleOptions, setRoleOptions] = useState([]);
  // const [selectedImageUri, setSelectedImageUri] = useState(null);

  const [date, setDate] = useState(new Date());
  const [show, setShow] = useState(false);

  //update
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState(user.full_name);
  const [dateOfBirth, setDateOfBirth] = useState(user.date_of_birth);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [address, setAddress] = useState(user.address);
  const [avatar, setAvatar] = useState(user.avt);
  const [currentValue, setCurrentValue] = useState();

  // select gender
  const [genderOptions, setGenderOptions] = useState([
    { label: "Nam", value: true },
    { label: "Nữ", value: false },
  ]);

  const [selectedGender, setSelectedGender] = useState(
    user.gender ? "Nam" : "Nữ"
  );

  //select dateOfbirth
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
    setDateOfBirth(currentDate.toLocaleDateString());

    const formattedDateOfBirth = currentDate.toISOString().split("T")[0];
    setDateOfBirth(formattedDateOfBirth);
  };

  const showDatepicker = () => {
    setShow(true);
  };

  //pick avatar
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

  //handle update profile
  const handleUpdateProfile = async () => {
    try {
      if (!selectedGender || !gender) {
        Alert.alert("Thông báo:", "Vui lòng nhập đầy đủ thông tin!");
      } else {
      }
      const filename = avatar.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `avatar/${match[1]}` : `avatar`;
      const formData = new FormData();
      formData.append("full_name", fullName);
      formData.append("date_of_birth", dateOfBirth);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("gender", selectedGender);
      formData.append("avt", { uri: avatar, name: filename, type });

      const response = await axios.patch(
        endpoints.update_account(user.id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Profile updated successfully", response.data);

      dispatch({
        type: "login",
        payload: {
          ...user,
          full_name: fullName,
          date_of_birth: dateOfBirth,
          email: email,
          phone: phone,
          address: address,
          avt: avatar,
          gender: selectedGender,
        },
      });
      Alert.alert(
        "Success",
        "Cập nhật thông tin thành công!",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Profile");
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("Error updating profile", error);

      Alert.alert(
        "Error",
        "Cập nhật thông tin không thành công!",
        [{ text: "OK", onPress: () => {} }],
        { cancelable: false }
      );
    }
  };

  //render item
  const renderItem = ({ item }) => {
    switch (item) {
      case 1:
        return (
          <View>
            <View style={styles.bgAddImg}>
              <View style={styles.btnAddImg}>
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    marginTop: 15,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderStyle: "dashed",
                      borderColor: "#ee4d2d",
                      padding: 5,
                      // marginRight: 15,
                    }}
                  >
                    <Image
                      source={{ uri: avatar }}
                      style={{
                        width: 130,
                        height: 130,
                        resizeMode: "cover",
                      }}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  marginTop: 25,
                  marginBottom: 15,
                  width: 100,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={pickImage}
              >
                <Text style={styles.textAdd}>Sửa ảnh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.brContent}></View>
            {/* 
            <View style={styles.textInfoPerson}>
              <Text style={styles.textInfoAC}>*Thông tin cá nhân</Text>
            </View> */}

            {/* full name */}
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View style={[styles.bgInputTK, { width: 200 }]}>
                <Image
                  source={require("../../images/fullname.png")}
                  style={styles.iconFullname}
                ></Image>
                <TextInput
                  style={styles.textInputTK}
                  placeholder="Họ và tên"
                  autoCapitalize="none"
                  placeholderTextColor="#969696"
                  onChangeText={(text) => setFullName(text)}
                  value={fullName}
                />
              </View>

              {/* gender */}
              <View>
                <DropDown
                  style={[styles.inputBgOptionGender, { width: 110 }]}
                  items={genderOptions}
                  open={isOpenGender}
                  setOpen={() => setIsOpenGender(!isOpenGender)}
                  value={selectedGender}
                  setValue={(val) => setSelectedGender(val)}
                  maxHeight={80}
                  placeholder="Giới tính"
                  dropDownContainerStyle={{
                    width: 110,
                    marginLeft: 25,
                    height: 100,
                  }}
                />
              </View>
            </View>

            {/* birthday */}
            <View style={styles.bgInputTK}>
              <Image
                source={require("../../images/birthday.png")}
                style={styles.iconBirth}
              />
              <TextInput
                style={styles.textInputTK}
                placeholder={dateOfBirth || "Ngày sinh"}
                editable={false}
                placeholderTextColor={dateOfBirth ? "black" : "gray"}
              />
              <View>
                <TouchableOpacity
                  style={styles.btnDateOfBirth}
                  onPress={showDatepicker}
                >
                  <Image
                    source={require("../../images/drop.png")}
                    style={styles.iconBirthChoose}
                  />
                </TouchableOpacity>
                {show && (
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                  />
                )}
              </View>
            </View>

            {/* email */}
            <View style={styles.bgInputTK}>
              <Image
                source={require("../../images/mail.png")}
                style={styles.iconMail}
              ></Image>
              <TextInput
                style={styles.textInputTK}
                placeholder="E-mail"
                autoCapitalize="none"
                placeholderTextColor="#969696"
                onChangeText={(text) => setEmail(text)}
                value={email}
              />
            </View>

            {/* phone */}
            <View style={styles.bgInputTK}>
              <Image
                source={require("../../images/phone.png")}
                style={styles.iconPass}
              ></Image>
              <TextInput
                style={styles.textInputTK}
                placeholder="Số điện thoại"
                autoCapitalize="none"
                placeholderTextColor="#969696"
                onChangeText={(text) => setPhone(text)}
                value={phone}
              />
            </View>

            {/* address */}
            <View style={styles.bgInputTK}>
              <Image
                source={require("../../images/address.png")}
                style={styles.iconAddress}
              ></Image>
              <TextInput
                style={styles.textInputTK}
                placeholder="Địa chỉ"
                autoCapitalize="none"
                placeholderTextColor="#969696"
                onChangeText={(text) => setAddress(text)}
                value={address}
              />
            </View>

            {/* btn update */}
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 50,
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
                onPress={handleUpdateProfile}
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
          </View>
        );
      default:
        return null;
    }
  };
  return (
    <FlatList
      style={styles.containerContent}
      data={[1]}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
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
    marginTop: 10,
    height: 10,
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
    // height: 200,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    // justifyContent: "flex-start",
    // flexDirection: "row",
    marginTop: 10,
    // marginBottom: 10,
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

  bgAddName2: {
    width: windownWidth - 30,
    marginLeft: 15,
    height: 150,
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
  btnDateOfBirth: {
    backgroundColor: "white",
    color: "white",
    width: 50,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBirthChoose: {
    marginTop: 10,
    height: 13,
    width: 13,
    marginLeft: 10,
  },
  textInfoPerson: {
    width: windownWidth - 60,
    marginLeft: 30,
    marginTop: 30,
    marginBottom: 10,
    // borderWidth: 1,
  },
  textInfoAC: {
    color: "#EE4D2D",
    fontSize: 15,
    fontWeight: "500",
  },
  bgInputTK: {
    width: windownWidth - 60,
    marginLeft: 30,
    marginTop: 25,
    backgroundColor: "white",
    height: 53,
    // borderRadius: 10,\
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#EE4D2D",
    // elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
  },
  iconBirth: {
    height: 24,
    width: 24,
    marginLeft: 9,
  },
  iconUser: {
    height: 22,
    width: 22,
    marginLeft: 12,
  },
  iconPass: {
    height: 24,
    width: 24,
    marginLeft: 10,
  },
  iconAddress: {
    height: 27,
    width: 27,
    marginLeft: 9,
  },
  iconAvt: {
    height: 24,
    width: 24,
    marginLeft: 10,
  },
  iconMail: {
    height: 24,
    width: 24,
    marginLeft: 10,
  },
  textInputTK: {
    height: "100%",
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    marginRight: 15,
    // color: 'red'
  },
  iconFullname: {
    height: 25,
    width: 25,
    marginLeft: 9,
  },
  inputBgOptionGender: {
    marginLeft: 25,
    borderWidth: 0,
    borderRadius: 5,
    marginTop: 28.6,
    // marginBottom: 10,
    borderBottomWidth: 1.2,
    borderColor: "#dddddd",
  },
});
