import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

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
import {
  BarChart,
  LineChart,
  PieChart,
  PopulationPyramid,
} from "react-native-gifted-charts";
import { useRoute } from "@react-navigation/native";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ProductStats = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>Thống kê danh mục</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const route = useRoute();
  const { storeId, categoryId, categoryName } = route.params;
  const [categoryStatsMonth, setCategoryStatsMonth] = useState([]);
  const [categoryStatsQuarter, setCategoryStatsQuarter] = useState([]);
  const [categoryStatsYears, setCategoryStatsYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  const quarters = ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];
  const years = ["2020", "2021", "2022", "2023", "2024"];

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  //format
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  //color
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  //css
  const lineConfig = {
    initialSpacing: 20,
    // curved: true,
    isAnimated: true,
    delay: 0,
    thickness: 2,
    color: "red",
    hideDataPoints: false,
    dataPointsShape: "circular",
    dataPointsWidth: 18,
    dataPointsHeight: 18,
    dataPointsColor: "#0059ff",
    dataPointsRadius: 4,
    textColor: "red",
    textFontSize: 12,
    textShiftX: 1,
    textShiftY: 0,
    shiftY: 0,
    startIndex: 0,
    // endIndex: barDataMonth.length - 1,
  };

  //data
  const barDataMonth = months.map((month, index) => {
    const monthData = categoryStatsMonth[index] || { total_revenue: 0 };
    return {
      value: monthData.total_revenue,
      label: month,
      frontColor: getRandomColor(),
    };
  });

  const barDataQuarter = quarters.map((quarter, index) => {
    const quarterData = categoryStatsQuarter[index] || { total_revenue: 0 };
    return {
      value: quarterData.total_revenue,
      label: quarter,
      frontColor: getRandomColor(),
    };
  });

  const barDataYear = categoryStatsYears.map((yearData, index) => ({
    value: yearData.total_revenue,
    label: `${parseInt(selectedYear) + index}`,
    frontColor: getRandomColor(),
  }));

  const barDataNull = [
    { value: 0, label: "", frontColor: getRandomColor() },
    { value: 0, label: "", frontColor: getRandomColor() },
    { value: 0, label: "", frontColor: getRandomColor() },
    { value: 0, label: "", frontColor: getRandomColor() },
  ];

  //product stats
  useEffect(() => {
    const fetchData = async () => {
      //month
      try {
        if (selectedYear) {
          const response = await axios.get(
            endpoints.category_revenue_in_month(storeId),
            {
              params: {
                category_id: categoryId,
                year: selectedYear,
              },
            }
          );
          setCategoryStatsMonth(response.data);
          console.log("========month", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      //quarter
      try {
        if (selectedYear) {
          const response = await axios.get(
            endpoints.category_revenue_in_quarter(storeId),
            {
              params: {
                category_id: categoryId,
                year: selectedYear,
              },
            }
          );
          setCategoryStatsQuarter(response.data);
          // console.log("========", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      //year
      try {
        if (selectedYear) {
          const response = await axios.get(
            endpoints.category_revenue_in_year(storeId),
            {
              params: {
                category_id: categoryId,
                year: selectedYear,
              },
            }
          );
          setCategoryStatsYears(response.data);
          // console.log("========", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedYear]);

  // console.log(selectedYear);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ width: windownWidth - 30, marginLeft: 15 }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text
            style={{
              color: "#d40000",
              fontWeight: "500",
              fontSize: 15,
              marginTop: 15,
            }}
          >
            Danh mục: [{categoryName}]
          </Text>
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              marginTop: 25,
            }}
          >
            Chọn năm:
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => handleYearChange(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn" value="" />
              {years.map((year) => (
                <Picker.Item key={year} label={year} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.customBarChartStyle}>
          <View style={styles.tableColumn}>
            <Text
              style={{
                color: "white",
                fontWeight: "500",
                marginLeft: 5,
                fontSize: 15,
              }}
            >
              Tổng cộng doanh thu năm [ {selectedYear} ]:
            </Text>
            <Text
              style={{
                color: "white",
                fontWeight: "500",
                marginLeft: 5,
                fontSize: 15,
              }}
            >
              {selectedYear
                ? formatPrice(
                    categoryStatsMonth.reduce(
                      (sum, monthData) => sum + (monthData?.total_revenue || 0),
                      0
                    )
                  )
                : "0 ₫"}
            </Text>
          </View>
          {/*month*/}
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              // marginTop: 25,
              marginBottom: 10,
            }}
          >
            Thống kê 12 tháng năm [ {selectedYear} ]
          </Text>
          <BarChart
            showFractionalValue
            showYAxisIndices
            barWidth={50}
            noOfSections={5}
            maxValue={100000000}
            data={barDataMonth}
            isAnimated
            width={300}
            height={250}
            showLine
            lineConfig={lineConfig}
          />
          <View style={{ flexDirection: "row" }}>
            <Text
              style={{
                color: "black",
                fontWeight: "500",
                fontSize: 14,
                marginTop: 40,
                // marginBottom: 10,
              }}
            >
              Số lượng bán được năm [ {selectedYear} ]:
            </Text>
            <Text
              style={{
                color: "black",
                fontWeight: "500",
                fontSize: 14,
                marginTop: 40,
                marginLeft: 5,
                // marginBottom: 10,
              }}
            >
              {categoryStatsMonth.reduce(
                (sum, monthData) => sum + (monthData?.total_quantity || 0),
                0
              )}
              sản phẩm
            </Text>
          </View>
          {/* table month */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tableContainer}
          >
            <View
              // style={styles.tableColumn}
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
            >
              {months.map((month, index) => (
                <View
                  key={index}
                  style={{
                    borderWidth: 0.8,
                    padding: 10,
                    borderRadius: 5,
                    height: 100,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5,
                    marginLeft: 5,
                    borderColor: "#a0a0a0",
                  }}
                >
                  <Text style={{ color: "#EE4D2D", marginBottom: 5 }}>
                    {month}
                  </Text>
                  <Text style={{ fontWeight: "500" }}>
                    {categoryStatsMonth[index]?.total_quantity || 0}sp
                  </Text>

                  <Text style={{ fontSize: 13, marginTop: 10 }}>
                    [
                    {formatPrice(categoryStatsMonth[index]?.total_revenue || 0)}
                    ]
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          {/* quarter */}
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              marginTop: 50,
              marginBottom: 10,
            }}
          >
            Thống kê 4 quý năm [ {selectedYear} ]
          </Text>
          <BarChart
            showFractionalValue
            showYAxisIndices
            barWidth={50}
            noOfSections={5}
            maxValue={100000000}
            data={barDataQuarter}
            isAnimated
            width={300}
            height={250}
            showLine
            lineConfig={lineConfig}
          />
          {/* table quarter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tableContainer}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                marginTop: 20,
              }}
            >
              {quarters.map((quarter, index) => (
                <View
                  key={index}
                  style={{
                    borderWidth: 0.8,
                    padding: 10,
                    borderRadius: 5,
                    height: 100,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 5,
                    marginLeft: 5,
                    borderColor: "#a0a0a0",
                  }}
                >
                  <Text style={{ color: "#EE4D2D", marginBottom: 5 }}>
                    {quarter}
                  </Text>
                  <Text style={{ fontWeight: "500" }}>
                    {categoryStatsQuarter[index]?.total_quantity || 0}sp
                  </Text>
                  <Text style={{ fontSize: 13, marginTop: 10 }}>
                    [
                    {formatPrice(
                      categoryStatsQuarter[index]?.total_revenue || 0
                    )}
                    ]
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
          {/* year */}
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              marginTop: 50,
              marginBottom: 10,
            }}
          >
            Thống kê năm [ {selectedYear} ] đến năm [ 2024 ]
          </Text>
          {barDataYear.length > 0 ? (
            <BarChart
              showFractionalValue
              showYAxisIndices
              barWidth={50}
              noOfSections={5}
              maxValue={100000000}
              data={barDataYear}
              isAnimated
              width={300}
              height={250}
              showLine
              lineConfig={lineConfig}
            />
          ) : (
            <BarChart
              showFractionalValue
              showYAxisIndices
              barWidth={50}
              noOfSections={5}
              maxValue={100000000}
              data={barDataNull}
              isAnimated
              width={300}
              height={250}
              showLine
              lineConfig={lineConfig}
            />
          )}

          {/* table year */}
          <View
            style={{
              marginTop: 30,
              flexDirection: "column",
              backgroundColor: "#EE4D2D",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 40,
              // height: 20,
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "400",
                marginLeft: 5,
                fontSize: 15,
              }}
            >
              Tổng doanh thu từ năm [ {selectedYear} ] đến [ 2024 ]:
            </Text>
            <Text
              style={{
                color: "white",
                fontWeight: "500",
                marginLeft: 5,
                fontSize: 16,
                marginTop: 5,
              }}
            >
              {formatPrice(
                categoryStatsYears.reduce((sum, yearData) => {
                  const year = parseInt(yearData.year);
                  if (year >= parseInt(selectedYear) && year <= 2024) {
                    return sum + (yearData?.total_revenue || 0);
                  }
                  return sum;
                }, 0)
              )}
            </Text>
          </View>
        </View>
      </ScrollView>
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
    flex: 88,
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
  },
  brButton66: {
    height: 2,
    width: "100%",
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
  },
  // brButton666: {
  //   height: 2,
  //   width: "100%",
  //   backgroundColor: "white",
  //   marginTop: 30,
  //   marginBottom: 30,
  // },
  bgButton: {
    height: 45,
    width: "90%",
    textAlign: "center",
    backgroundColor: "#ee4d2d",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    marginBottom: 27,
  },
  customBarChartStyle: {
    // height: 300,
    // marginRight: 50,
    // fontSize: 10,
    // width: 300, // Set your desired width
    // height: 200,
    marginTop: 10,
    // width: "200%",
    // borderWidth: 1,
    marginBottom: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBgOptionGender: {
    marginLeft: 25,
    borderWidth: 0,
    borderRadius: 5,
    marginTop: 13.2,
    // marginBottom: 10,
    borderBottomWidth: 2,
    borderColor: "#999999",
  },
  pickerContainer: {
    width: 200,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 7,
    marginVertical: 10,
    // padding: 5,
    justifyContent: "center",
    // alignItems: "center",
    // marginLeft: 20,
    // marginRight: 20,
  },
  picker: {
    height: 35,
  },
  tableColumn: {
    marginTop: 10,
    flexDirection: "row",
    backgroundColor: "#EE4D2D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    // height: 20,
    padding: 10,
    borderRadius: 10,
  },
  tableContainer: {
    marginTop: 15,
  },
});
