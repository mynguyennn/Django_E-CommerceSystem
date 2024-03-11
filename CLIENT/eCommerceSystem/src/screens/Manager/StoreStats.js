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

export default StoretStats = ({ navigation }) => {
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
            <Text style={styles.textSignIn}>
              Thống kê doanh thu các cửa hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.brButton6}></View>
    </View>
  );
};

const ContentComponent = ({ navigation }) => {
  const route = useRoute();
  // const { storeData } = route.params;
  const [StoreStatsMonth, setStoreStatsMonth] = useState([]);
  const [StoreStatsQuarter, setStoreStatsQuarter] = useState([]);
  const [StoreStatsYears, setStoreStatsYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
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

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    // console.log(month);
  };
  const handleQuarterChange = (quarter) => {
    setSelectedQuarter(quarter);
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
  const barDataMonth = StoreStatsMonth.map((monthData, index) => {
    // const monthData = StoreStatsMonth[index] || { order_counts: 0 };
    return {
      value: monthData.order_count,
      label: monthData.name_store,
      frontColor: getRandomColor(),
    };
  });

  const barDataQuarter = StoreStatsQuarter.map((quarterData, index) => {
    // const quarterData = StoreStatsQuarter[index] || { order_counts: 0 };
    return {
      value: quarterData.order_count,
      label: quarterData.name_store,
      frontColor: getRandomColor(),
    };
  });

  const barDataYear = StoreStatsYears.map((yearData, index) => ({
    value: yearData.order_count,
    label: yearData.name_store,
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
      //year
      try {
        if (selectedYear) {
          const response = await axios.get(endpoints.get_order_count_in_year, {
            params: {
              // category_id: categoryId,
              year: selectedYear,
            },
          });
          setStoreStatsYears(response.data);
          // console.log("========", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const fetchDataMonth = async () => {
      //month
      try {
        if (selectedMonth) {
          const response = await axios.get(endpoints.get_order_count_in_month, {
            params: {
              // category_id: categoryId,
              month: selectedMonth,
            },
          });
          setStoreStatsMonth(response.data);
          console.log("========", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataMonth();

    const fetchDataQuarter = async () => {
      //quarter
      try {
        if (selectedQuarter) {
          const response = await axios.get(
            endpoints.get_order_count_in_quarter,
            {
              params: {
                // category_id: categoryId,
                quarter: selectedQuarter,
              },
            }
          );
          setStoreStatsQuarter(response.data);
          // console.log("========", response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataQuarter();
  }, [selectedYear, selectedMonth, selectedQuarter]);

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
            Thống kê năm [ {selectedYear} ]
          </Text>
          {barDataYear.length > 0 ? (
            <BarChart
              showFractionalValue
              showYAxisIndices
              barWidth={50}
              noOfSections={5}
              maxValue={100}
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
        </View>

        <View>
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              marginTop: 25,
            }}
          >
            Chọn tháng:
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => handleMonthChange(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn" value="" />
              {months.map((month, index) => (
                <Picker.Item key={index} label={month} value={index + 1} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.customBarChartStyle}>
          {/* month */}
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              marginTop: 50,
              marginBottom: 10,
            }}
          >
            Thống kê tháng [ {selectedMonth} ]
          </Text>
          {barDataMonth.length > 0 ? (
            <BarChart
              showFractionalValue
              showYAxisIndices
              barWidth={50}
              noOfSections={5}
              maxValue={100}
              data={barDataMonth}
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
        </View>

        <View>
          <Text
            style={{
              color: "black",
              fontWeight: "500",
              fontSize: 14,
              marginTop: 25,
            }}
          >
            Chọn quý:
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedQuarter}
              onValueChange={(itemValue) => handleQuarterChange(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Chọn" value="" />
              {quarters.map((quarter, index) => (
                <Picker.Item key={index} label={quarter} value={index + 1} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.customBarChartStyle}>
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
            Thống kê quý [ {selectedQuarter} ]
          </Text>
          {barDataQuarter.length > 0 ? (
            <BarChart
              showFractionalValue
              showYAxisIndices
              barWidth={50}
              noOfSections={5}
              maxValue={100}
              data={barDataQuarter}
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
