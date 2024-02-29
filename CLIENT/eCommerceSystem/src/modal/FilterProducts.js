import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useContext } from "react";
import axios, { endpoints } from "../config/API";
import { AirbnbRating, Rating } from "react-native-ratings";
import { useRoute } from "@react-navigation/native";

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
import Modal from "react-native-modal";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

const FilterModal = ({ visible, onClose }) => {
  return (
    <Modal
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
      isVisible={visible}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      useNativeDriver={true}
      // style={{
      //   borderWidth: 5,
      //   // borderRadius: 150
      // }}
    >
      <View style={styles.filterModalContainer}>
        <View style={styles.bgOpa}></View>
        <View style={styles.filterModalContent}>
          <Text
            style={{
              padding: 20,
              backgroundColor: "#ebebeb",
              fontWeight: 500,
              fontSize: 15,
              color: "#3d3d3d",
              textAlign: "center",
            }}
          >
            Bộ lọc tìm kiếm
          </Text>

          {/* noi ban */}
          <View
            style={{
              width: windownWidth - 20,
              marginLeft: 17,
              marginTop: 25,
              marginBottom: 15,
            }}
          >
            <Text style={{ marginBottom: 10 }}>Nơi bán</Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={styles.item}>
                <Text>Hồ Chí Minh</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text>Hà Nội</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity style={styles.item}>
                <Text>Thái Nguyên</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text>Vĩnh Phúc</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* gia */}
          <View
            style={{
              width: windownWidth - 20,
              marginLeft: 17,
              marginTop: 15,
              marginBottom: 15,
            }}
          >
            <Text style={{ marginBottom: 10 }}>Khoảng giá (đ)</Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={styles.item}>
                <Text>0-100k</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text>100k-200k</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity style={styles.item}>
                <Text>200k-300k</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text>300k-500k</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* danh gias */}
          <View
            style={{
              width: windownWidth - 20,
              marginLeft: 17,
              marginTop: 15,
              marginBottom: 15,
            }}
          >
            <Text style={{ marginBottom: 10 }}>Đánh giá</Text>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity style={styles.item}>
                <Text>5 sao</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text>Từ 4 sao</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity style={styles.item}>
                <Text>Từ 3 sao</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item}>
                <Text>Từ 2 sao</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row", marginTop: 5 }}>
              <TouchableOpacity style={styles.item}>
                <Text>Từ 1 sao</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* button */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-evenly",
              marginTop: 30,
              // alignItems: "center",
              // borderWidth: 1
            }}
          >
            <TouchableOpacity onPress={onClose} style={styles.btnHuy}>
              <Text style={{ color: "#ee4d2d", fontWeight: "500" }}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.btnApDung}>
              <Text style={{ color: "white", fontWeight: "500" }}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;

const styles = StyleSheet.create({
  filterModalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    flexDirection: "row",
    // borderRadius: 10
  },
  bgOpa: {
    // borderWidth: 1
    // opacity: 0.5,
    width: "10%",
    // backgroundColor: "#666666",
    // opacity: 0.7,
  },
  filterModalContent: {
    width: "85%",
    height: "100%",
    backgroundColor: "white",
    // paddingLeft: 7
    // marginLeft: 15
    // borderRadius: 10,
    // elevation: 5,
  },
  item: {
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#ebebeb",
    width: 145,
    marginRight: 10,
    marginTop: 5,
  },
  btnHuy: {
    // textAlign: 'center',
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 40,
    // padding: 10,
    borderWidth: 1,
    borderColor: "#ee4d2d",
    borderRadius: 5,
    // marginRight: 20
  },
  btnApDung: {
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 40,
    backgroundColor: "#ee4d2d",
    borderWidth: 1,
    borderColor: "#ee4d2d",
    borderRadius: 5,
  },
});
