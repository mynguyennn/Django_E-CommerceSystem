import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList, Modal } from "react-native";
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

export default StoreListStats = ({ navigation }) => {
  // const [countStore, setCountStore] = useState(0);
  const [stores, setStores] = useState([]);
  const route = useRoute();
  // const { storeId } = route.params;
  // console.log("=====>", storeId);
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          storess={stores}
          setStores={setStores}
          // storeId={storeId}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} />
      </View>
    </View>
  );
};

const HeaderComponent = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>Thống kê cửa hàng</Text>
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
  // storeId,
  setCountProduct,
}) => {
  const [storeList, setStoreList] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const [selectedStatsType, setSelectedStatsType] = useState("frequency");

  //call api
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoints.get_list_store_stats);
        setStoreList(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const openConfirmationModal = (store) => {
    setSelectedStore(store);
    setIsModal(true);
  };

  const handleConfirmStats = () => {
    // console.log("Selected Stats Type:", selectedStatsType);

    let screenParams = {};

    switch (selectedStatsType) {
      case "frequency":
        screenParams = { storeId: selectedStore };
        navigation.navigate("StatsFrequencySale", screenParams);
        break;
      case "product":
        screenParams = { storeId: selectedStore };
        navigation.navigate("StatsTotalProduct", screenParams);
        break;

      default:
        break;
    }

    setIsModal(false);
  };

  // console.log(selectedStore);
  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          {storeList && storeList.length > 0 ? (
            storeList.map((store) => {
              return (
                <TouchableOpacity
                  key={store.id}
                  style={styles.productContainer}
                  onPress={() => openConfirmationModal(store)}
                >
                  <View
                    style={{
                      width: "25%",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                      borderWidth: 1,
                      borderRadius: 5,
                      borderColor: "#cecece",
                    }}
                  >
                    <Image
                      style={{ width: "80%", height: "80%" }}
                      source={
                        store.avt
                          ? { uri: store.avt }
                          : require("../../images/chualogin.png")
                      }
                    />
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      width: "71%",
                      // borderWidth: 1,
                      marginLeft: 15,
                      height: "100%",
                      // justifyContent: "center",
                      // alignItems: "center",
                    }}
                  >
                    <Text style={styles.nameProduct}>
                      Tên cửa hàng: {store.name_store}
                    </Text>
                    <Text style={styles.nameProduct}>
                      Địa chỉ: {store.address}
                    </Text>
                    <Text style={styles.nameProduct1}>
                      Trạng thái: Đã xác nhận
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "column",
                      width: "20%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {/* <TouchableOpacity
                      style={styles.btnUpdate}
                      onPress={() => Confirm(store.id)}
                    >
                      <Text style={{ color: "white" }}>Xác Nhận</Text>
                    </TouchableOpacity> */}
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text>Không có cửa hàng nào cần xác nhận!</Text>
          )}
        </View>
      </View>

      {/* Modal */}
      <Modal visible={isModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Chọn loại thống kê cửa hàng [{selectedStore?.name_store}]
            </Text>

            <View style={{ marginBottom: 25 }}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  selectedStatsType === "frequency" &&
                    styles.selectedRadioButtonFrequency,
                ]}
                onPress={() => setSelectedStatsType("frequency")}
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    selectedStatsType === "frequency" && {
                      color: "white",
                      fontWeight: "500",
                    },
                  ]}
                >
                  Thống kê tần suất bán hàng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioButton,
                  selectedStatsType === "product" &&
                    styles.selectedRadioButtonProduct,
                ]}
                onPress={() => setSelectedStatsType("product")}
              >
                <Text
                  style={[
                    styles.radioButtonText,
                    selectedStatsType === "product" && {
                      color: "white",
                      fontWeight: "500",
                    },
                  ]}
                >
                  Thống kê tổng sản phẩm kinh doanh
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <TouchableOpacity
                style={styles.modalButtonConfirm}
                onPress={handleConfirmStats}
              >
                <Text style={{ color: "white" }}>Xác Nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setIsModal(false)}
              >
                <Text style={{ color: "white" }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const FooterComponent = ({ navigation, storeData }) => {
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
    marginLeft: 8,
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
    height: 100,
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
    fontSize: 13.5,
    fontWeight: "500",
    width: "95%",
    // padding: 10,
    paddingBottom: 9,
    // marginTop: 15,
  },
  nameProduct1: {
    color: "#00da00",
    fontSize: 12.5,
    fontWeight: "500",
    width: "90%",
    position: "absolute",
    bottom: 0,
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
    marginRight: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  modalContent: {
    width: "90%",
    paddingBottom: 20,
    paddingTop: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#d4d4d4",
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    color: "#aa0000",
    marginBottom: 20,
    fontWeight: "500",
  },
  modalButtonConfirm: {
    backgroundColor: "#9b9b9b",
    padding: 9,
    width: 100,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
    // flexDirection:'row'
    // borderWidth: 1,
  },
  modalButtonCancel: {
    marginLeft: 30,
    backgroundColor: "#9b9b9b",
    padding: 9,
    width: 100,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  radioButton: {
    // flexDirection: "row",
    alignItems: "center",
    // marginVertical: 5,
    paddingBottom: 10,
    paddingTop: 10,
  },
  selectedRadioButton: {
    // backgroundColor: "#cecece",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#f55939",
    padding: 10,
  },
  radioButtonText: {
    // fontWeight: "5F00",
    // color:'red'
  },

  selectedRadioButtonFrequency: {
    width: 300,
    backgroundColor: "#f55939",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "white",
    padding: 10,
  },

  selectedRadioButtonProduct: {
    width: 300,
    backgroundColor: "#f55939",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "white",
    padding: 10,
  },
});
