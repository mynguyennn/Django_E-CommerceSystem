import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect, useRef } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRoute } from "@react-navigation/native";

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

export default FollowList = ({ navigation }) => {
  const [followedStores, setFollowedStores] = useState([]);

  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent followedStores={followedStores} />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          followedStores={followedStores}
          setFollowedStores={setFollowedStores}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} />
      </View>
    </View>
  );
};

const HeaderComponent = ({ followedStores }) => {
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
              Shop đang theo dõi ({followedStores.length})
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
  followedStores,
  setFollowedStores,
}) => {
  const [user, dispatch] = useLogin();

  useEffect(() => {
    getFollowedStores();
  }, []);

  const getFollowedStores = async () => {
    try {
      const response = await axios.post(endpoints.get_list_follow_byUser, {
        account_id: user.id,
      });

      setFollowedStores(response.data);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };
  return (
    <ScrollView style={{ height: "100%" }}>
      {followedStores.map((store) => (
        <View key={store.id}>
          <TouchableOpacity
            style={styles.bgStore}
            onPress={() => {
              navigation.navigate("ProfileStore", {
                storeID: store.store_info.id,
              });
            }}
          >
            <View
              style={{
                borderWidth: 1,
                borderColor: "#b4b4b4",
                borderRadius: 100,
                padding: 5,
              }}
            >
              <Image
                style={styles.avtShop}
                source={{ uri: store.store_info.avt }}
              />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.textStore}>
                {store.store_info.name_store}
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
                  {store.store_info.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.brButton2}></View>
        </View>
      ))}
      {/* <View style={styles.brContent}></View> */}
    </ScrollView>
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
  bgStore: {
    width: windownWidth - 20,
    marginLeft: 10,
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    // borderWidth: 1,
    margin: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  avtShop: {
    height: 45,
    width: 45,
    // marginRight: 10,
    borderRadius: 100,
    // borderWidth: 1,
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
    fontSize: 12.5,
    color: "#575757",
    // borderWidth: 1,
    // width: 150
  },
  viewShop: {
    borderWidth: 1,
    borderColor: "#EE4D2D",
    padding: 5,
    width: 100,
    borderRadius: 5,
    position: "absolute",
    right: 5,
    // marginLeft: 105,
  },
  textViewShop: {
    color: "#EE4D2D",
    textAlign: "center",
  },
  imageContainer: {
    // height: 200,
    // borderRadius: 20,
    overflow: "visible",
    marginHorizontal: 5,
    width: windownWidth - 10,
    // marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  imageInScrollView: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
    // marginTop: 10
    // justifyContent: "center",
    // alignItems: "center",
  },
  bgAddName: {
    width: windownWidth - 30,
    marginLeft: 15,
  },
  btnAddName: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 10,
    position: "relative",
  },
  textAddName: {
    fontSize: 14,
    fontWeight: "500",
  },
  textAddName1: {
    fontSize: 13,
    color: "#777777",
  },
  iconNext: {
    // position: "absolute",
    height: 19,
    width: 19,
    marginBottom: -2,
    marginLeft: 3,
    // right: 0,
  },
  bgItem: {
    justifyContent: "space-evenly",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 20,
    width: windownWidth - 30,
    marginLeft: 5,
  },
  bgItem1: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 15,
    width: windownWidth - 40,
    marginLeft: 20,
  },
  bgItem11: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 0,
    marginBottom: 15,
    width: windownWidth - 40,
    marginLeft: 20,
  },
  btnItem: {
    // borderWidth: 1,
    height: 75,
    width: 85,
    marginRight: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  iconItem: {
    height: 22,
    width: 22,
  },
  btnItem1: {
    height: 85,
    width: 100,
    // marginLeft: 30,
    marginRight: 30,
    // backgroundColor: "#f2f2f2",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});
