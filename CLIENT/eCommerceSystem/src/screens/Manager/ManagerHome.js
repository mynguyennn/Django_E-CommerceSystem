import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios, { endpoints } from "../../config/API";
import { useRoute } from "@react-navigation/native";

import { LoginContext } from "../../../App";
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, } from "react-native";

export default ManagerProfile = ({ navigation }) => {
    const [user, dispatch] = useContext(LoginContext);
    return (
        <SafeAreaView style={styles.viewContainer}>
          <View style={styles.viewHeader}>
            <HeaderComponent user={user} navigation={navigation} />
          </View>
    
          <View style={styles.viewContent}>
            <ContentComponent
              navigation={navigation}
              dispatch={dispatch}
              user={user}
            />
          </View>
    
          <View style={styles.viewFooter}>
            <FooterComponent />
          </View>
        </SafeAreaView>
        
      );
  };

  const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

const imageBanner = [
  require("../../images/banner1.png"),
  // require("../images/banner2.png"),
  // require("../images/banner3.png"),
  require("../../images/banner4.png"),
  require("../../images/banner5.png"),
  require("../../images/banner6.png"),
  require("../../images/banner7.png"),
  require("../../images/banner8.png"),
  require("../../images/banner9.png"),
];

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
              <Text style={styles.textSignIn}>Quản lý sàn giao dịch</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.brButton6}></View>
      </View>
    );
  };

  const ContentComponent = ({ navigation, route, user }) => {
      const [imgActive, setImgActive] = useState(0);
      const [counts, setCounts] = useState({ count_orders: 0, count_comments: 0 });
    
      const onChange = (event) => {
        const slideWidth = Dimensions.get("window").width;
        const offset = event.nativeEvent.contentOffset.x;
        const activeImage = Math.floor(offset / slideWidth);
        setImgActive(activeImage);
      };
      //banner
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
    
      const scrollViewRef = useRef();
    return (
      <View>
        
        {/* user info */}
       <View style={styles.bgUser}>
        
       
            <View
              
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View>
                <Image
                  style={styles.avtUser}
                  source={
                    user.avt
                      ? { uri: user.avt }
                      : require("../../images/chualogin.png")
                  }
                />
              </View>

              <View>
                <Text style={styles.textUser}>{user.full_name}</Text>
                
              </View>
            </View>
          </View>  
        <View
            style={{
              height: 150,
              backgroundColor: "white",
              marginTop:10,
              marginBottom: 6,
            }}
          >
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
          </View>

          <View style={styles.bgAddName}>
          <View style={styles.bgItem1}>
            <TouchableOpacity
              style={styles.btnItem1}
              onPress={() => {
                navigation.navigate("", {
                  storeId: storeData[0].id,
                  storeData: storeData,
                });
              }}
            >
              <View
                style={{
                  backgroundColor: "#EBA41E",
                  padding: 5,
                  borderRadius: 8,
                }}
              >
                <Image
                  source={require("../../images/card.png")}
                  style={styles.iconItem}
                ></Image>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: "#222222",
                  marginTop: 10,
                  fontWeight: "500",
                }}
              >
                Thêm danh mục
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnItem1}
              onPress={() => {
                navigation.navigate("StoreStats")
              }}
            >
              <View
                style={{
                  backgroundColor: "#0046AB",
                  padding: 5,
                  borderRadius: 8,
                }}
              >
                <Image
                  source={require("../../images/stats.png")}
                  style={styles.iconItem}
                ></Image>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: "#222222",
                  marginTop: 10,
                  fontWeight: "500",
                }}
              >
                Thống kê
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnItem1}
              onPress={() => {
                navigation.navigate("ConfirmStore");
              }}
            >
              <View
                style={{
                  backgroundColor: "#0046AB",
                  padding: 5,
                  borderRadius: 8,
                }}
              >
                <Image
                  source={require("../../images/verified.png")}
                  style={styles.iconItem}
                ></Image>
              </View>

              <Text
                style={{
                  fontSize: 13,
                  color: "#222222",
                  marginTop: 10,
                  fontWeight: "500",
                }}
              >
                Xác nhận cửa hàng
              </Text>
            </TouchableOpacity>
          </View>
        
        </View>
      
      </View>
        
       
    )} 


  const FooterComponent = () => {
    return;
  };

  const styles = StyleSheet.create({

    containerHeader: {
      marginTop: 40,
      // width: "100%",
      // height: "100%",
    },
    viewHeader: {
      width: "100%",
      flex: 25,
      // backgroundColor: "#EE4D2D",
      // backgroundColor: "white",
      // borderWidth: 4,
    },
    viewContent: {
      width: "100%",
      flex: 75,
      // marginTop: 1,
      // alignItems: "center",
      // justifyContent: "center",
      backgroundColor: "white",
      // borderWidth: 1,
    },
    viewFooter: {
      flex: 0,
      // borderWidth: 1,
      backgroundColor: "white",
      width: "100%",
      height: "0%",
    },
     signIn: {
    height: 55,
    flexDirection: "row",
    backgroundColor: "#FEFEFE",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    // borderWidth: 1
  },bgIconMess: {
    position: "absolute",
    left: 20,
  },
  textSignIn: {
    fontSize: 19,
    color: "black",
    fontWeight: "400",
  },
  iconBack: {
    height: 25,
    width: 25,
    // marginLeft: 200,
  },
  brButton6: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
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
    // justifyContent: "center",
    // alignItems: "center",
  },
  bgUser: {
    width: windownWidth - 20,
    height:100,
    marginLeft: 10,
    flexDirection: "row",
    // justifyContent: 'center',
    alignItems: "center",
    marginTop:'20%'
    // borderWidth: 1,
  },
 
  avtUser: {
    height:55,
    width: 55,
    marginRight: 10,
    borderRadius: 100,
  },
  textUser: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c2c2c",
  },
  iconItem: {
    height: 22,
    width: 22,
  },
  bgItem1: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 50,
    marginBottom: 15,
    width: windownWidth - 40,
    marginLeft: 20,
  },
  bgAddName: {
    width: windownWidth - 30,
    marginLeft: 15,
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
  brContent: {
    // marginTop: 15,
    height: 10,
    width: "100%",
    backgroundColor: "#f0efef",
    // marginRight: 10,
  },
});