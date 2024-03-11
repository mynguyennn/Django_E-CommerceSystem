import { StatusBar } from "expo-status-bar";
import React, { useContext, useState, useEffect } from "react";
import { Image, ScrollView, FlatList, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios, { endpoints, authApi } from "../../config/API";
import { useRefreshData } from "../../context/RefreshDataContext";

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
import { AirbnbRating, Rating } from "react-native-ratings";

const windownWidth = Dimensions.get("window").width;
const windownHeight = Dimensions.get("window").height;

export default ProductListComments = ({ navigation }) => {
  const [countProduct, setCountProduct] = useState(0);
  const [products, setProducts] = useState([]);
  const route = useRoute();
  const { productId, countCmt, avgRating } = route.params;
  // const productId = 8;
  // const countCmt = 2;
  // const avgRating = 2.5;
  // console.log("=====>", storeId);
  return (
    <View style={styles.viewContainer}>
      <View style={styles.viewHeader}>
        <HeaderComponent
          countCmt={countCmt}
          navigation={navigation}
          countProduct={countProduct}
        />
      </View>

      <View style={styles.viewContent}>
        <ContentComponent
          navigation={navigation}
          setCountProduct={setCountProduct}
          products={products}
          setProducts={setProducts}
          productId={productId}
          avgRating={avgRating}
          countCmt={countCmt}
        />
      </View>

      <View style={styles.viewFooter}>
        <FooterComponent navigation={navigation} />
      </View>
    </View>
  );
};

const HeaderComponent = ({ countCmt, countProduct, navigation }) => {
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
            <Text style={styles.textSignIn}>Đánh giá ({countCmt})</Text>
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
  productId,
  setCountProduct,
  avgRating,
  countCmt,
}) => {
  const { dispatch, state: refreshState } = useRefreshData();

  const [productList, setProductList] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const [replyText, setReplyText] = useState("");

  //call api comment by product
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          endpoints.get_comments_for_product(productId)
        );
        setProductList(response.data);

        const numberOfProducts = response.data.comments.length;

        setCountProduct((count) => {
          if (count !== numberOfProducts) {
            return numberOfProducts;
          }
          return count;
        });
        // console.log("========cmt", response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [refreshState]);

  //handle reply cmt
  const handleReply = (comment) => {
    setSelectedComment((prevSelectedComment) => {
      return prevSelectedComment === comment ? null : comment;
    });
    setReplyText("");
  };

  const handleSubmitReply = async () => {
    if (!selectedComment) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("reply_content", replyText);

      const response = await axios.post(
        endpoints.reply_to_comment(selectedComment.id),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newReply = response.data;

      setProductList((prevProductList) => {
        const updatedComments = prevProductList.comments.map((comment) => {
          if (comment.id === selectedComment.id) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
          return comment;
        });

        return {
          ...prevProductList,
          comments: updatedComments,
        };
      });

      setReplyText("");
      setSelectedComment(null);
      dispatch({ type: "REFRESH_DATA_UPDATECMT" });
    } catch (error) {
      console.error("Error replying to comment:", error);
    }
  };

  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");

  const handleEditComment = (reply) => {
    setEditingCommentId(reply.id);
    setEditedCommentContent(reply.content);
  };

  //handle update cmt
  const handleUpdateComment = async (reply) => {
    try {
      const newContent = editedCommentContent;
      const api = await authApi();
      const response = await api.patch(endpoints.update_comment(reply.id), {
        new_content: newContent,
      });

      // console.log("Comment updated:", response.data);

      setEditingCommentId(null);
      setEditedCommentContent("");
      dispatch({ type: "REFRESH_DATA_UPDATECMT" });
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  // handle delete cmt
  const handleDeleteComment = async (reply) => {
    try {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc muốn xóa bình luận?",
        [
          {
            text: "Hủy",
            style: "cancel",
          },
          {
            text: "Xác nhận",
            onPress: async () => {
              try {
                const api = await authApi();
                const response = await api.delete(
                  endpoints.delete_comment(reply.id)
                );

                // console.log("Comment deleted:", response.data);
                dispatch({ type: "REFRESH_DATA_UPDATECMT" });
              } catch (error) {
                console.error("Lỗi khi xóa bình luận:", error);
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Lỗi khi hiển thị cảnh báo xác nhận:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditedCommentContent("");
  };

  return (
    <ScrollView>
      <View style={styles.containerContent}>
        <View style={styles.productRowContainer}>
          <View style={styles.productContainer}>
            <View style={styles.bgRating1}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={styles.textReviewPr}>{avgRating}</Text>
                <Text style={styles.textReviewPr111}>/5</Text>
              </View>
              <Rating
                type="star"
                ratingCount={5}
                fractions={1}
                jumpValue={1}
                startingValue={avgRating}
                imageSize={13}
                readonly={true}
              />
              <Text style={styles.textReviewPr1}>({countCmt} đánh giá)</Text>
            </View>
          </View>

          {productList.product && (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
                marginTop: 10,
                marginBottom: 10,
                //   borderWidth: 1,
              }}
            >
              <Image
                source={{ uri: productList.product.images[0].thumbnail }}
                style={{ width: 80, height: 80, borderRadius: 5 }}
              />
              <Text
                style={{
                  color: "#d40000",
                  fontWeight: "500",
                  fontSize: 13,
                  marginLeft: 20,
                  width: 170,
                  // marginTop: 15,
                }}
              >
                {productList.product.name_product}
              </Text>
            </View>
          )}
          <View style={styles.brButton6}></View>

          {/* comment */}
          <View>
            {productList.comments &&
              productList.comments.map((comment, index) => (
                <View key={index}>
                  <View
                    style={{
                      // flexDirection: "row",
                      marginTop: 20,
                      // marginBottom: 20,
                      width: windownWidth - 30,
                      marginLeft: 15,
                      // borderWidth: 1,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        marginTop: 0,
                        marginBottom: 20,
                        height: 120,
                        // borderWidth: 1,
                      }}
                    >
                      <View>
                        <Image
                          source={{ uri: comment.account_info.avt }}
                          style={styles.iconShop}
                        ></Image>
                      </View>
                      <View
                        style={{
                          alignItems: "flex-start",
                          justifyContent: "flex-start",
                        }}
                      >
                        <Text style={styles.textShop}>
                          {comment.account_info.full_name} - [ Customer ]
                        </Text>
                        <Rating
                          type="star"
                          ratingCount={5}
                          fractions={1}
                          jumpValue={1}
                          startingValue={comment.rating}
                          imageSize={13}
                          readonly={true}
                        />
                        <Text
                          style={{
                            color: "#636363",
                            fontSize: 14,
                            marginTop: 10,
                            marginBottom: 20,
                            width: 330,
                          }}
                        >
                          [{comment.id}] - {comment.content}
                        </Text>
                        <Text
                          style={{
                            color: "#636363",
                            fontSize: 11,
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                          }}
                        >
                          {comment.created_at}
                        </Text>
                      </View>
                    </View>
                    {/* rep cmt */}
                    <TouchableOpacity
                      style={{
                        position: "absolute",
                        top: "0%",
                        right: 0,
                        // marginTop: 10,
                        padding: 6,
                        backgroundColor: "#9e9e9e",
                        width: 70,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: 5,
                        // borderWidth: 1,
                      }}
                      onPress={() => handleReply(comment)}
                    >
                      <Text
                        style={{
                          color: "white",
                          fontWeight: "500",
                          fontSize: 13,
                        }}
                      >
                        Trả lời
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* open input cmt reply */}
                  {selectedComment && selectedComment.id === comment.id && (
                    <View
                      style={{
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "row",
                        marginBottom: 15,
                      }}
                    >
                      <TextInput
                        placeholder="Vui lòng nhập nội dung ..."
                        placeholderTextColor="#9e9e9e"
                        value={replyText}
                        onChangeText={(text) => setReplyText(text)}
                        // multiline
                        style={{
                          borderWidth: 0.5,
                          padding: 3,
                          width: 250,
                          borderColor: "gray",
                          borderRadius: 5,
                          paddingRight: 10,
                          paddingLeft: 10,
                        }}
                      />
                      <TouchableOpacity
                        style={{
                          padding: 7,
                          backgroundColor: "#ee4d2d",
                          width: 90,
                          marginLeft: 10,
                          justifyContent: "center",
                          alignItems: "center",
                          borderRadius: 5,
                          // borderWidth: 1,
                        }}
                        onPress={handleSubmitReply}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "500",
                            fontSize: 13,
                          }}
                        >
                          Bình luận
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* list cmt reply */}
                  {comment.replies &&
                    comment.replies.map((reply, replyIndex) => (
                      <View key={replyIndex} style={{ marginLeft: 50 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            marginTop: 10,
                            marginBottom: 10,
                            height: 120,
                            width: 330,
                            padding: 10,
                            borderRadius: 10,
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          <View>
                            <Image
                              source={{
                                uri: productList.product.store_info.avt,
                              }}
                              style={styles.iconShop}
                            />
                          </View>
                          <View
                            style={{
                              alignItems: "flex-start",
                              justifyContent: "flex-start",
                              width: "100%",
                            }}
                          >
                            <Text style={styles.textShop}>
                              {productList.product.store_info.name_store} - [
                              Store ]
                            </Text>
                            {editingCommentId === reply.id ? (
                              // edit cmt
                              <TextInput
                                style={{
                                  borderWidth: 1,
                                  borderColor: "#ccc",
                                  borderRadius: 5,
                                  padding: 5,
                                  paddingLeft: 10,
                                  width: 200,
                                }}
                                value={editedCommentContent}
                                onChangeText={(text) =>
                                  setEditedCommentContent(text)
                                }
                              />
                            ) : (
                              <Text
                                style={{
                                  color: "#636363",
                                  fontSize: 14,
                                  marginTop: 5,
                                  marginBottom: 5,
                                  width: 330,
                                }}
                              >
                                [{reply.id}] - {reply.content}
                              </Text>
                            )}
                            <Text
                              style={{
                                color: "#636363",
                                fontSize: 11,
                                position: "absolute",
                                bottom: 0,
                                right: 30,
                              }}
                            >
                              {reply.created_at}
                            </Text>
                          </View>

                          {editingCommentId === reply.id ? (
                            <>
                              {/* save cmt update */}
                              <TouchableOpacity
                                onPress={() => handleUpdateComment(reply)}
                                style={{
                                  position: "absolute",
                                  top: 45,
                                  right: 37,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Image
                                  source={require("../../images/v.png")}
                                  style={styles.iconShop1111}
                                ></Image>
                              </TouchableOpacity>

                              {/* cancel cmt update */}
                              <TouchableOpacity
                                onPress={() => handleCancelEdit()}
                                style={{
                                  position: "absolute",
                                  top: 46.5,
                                  right: 5,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                              >
                                <Image
                                  source={require("../../images/x.png")}
                                  style={styles.iconShop11111}
                                ></Image>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              {/* btn update */}
                              <TouchableOpacity
                                style={{
                                  position: "absolute",
                                  top: 20,
                                  right: 5,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                                onPress={() => handleEditComment(reply)}
                              >
                                <Image
                                  source={require("../../images/edit.png")}
                                  style={styles.iconShop111}
                                ></Image>
                              </TouchableOpacity>

                              {/* btn delete */}
                              <TouchableOpacity
                                style={{
                                  position: "absolute",
                                  top: 60,
                                  right: 5,
                                  justifyContent: "center",
                                  alignItems: "center",
                                }}
                                onPress={() => handleDeleteComment(reply)}
                              >
                                <Image
                                  source={require("../../images/deletecmt.png")}
                                  style={styles.iconShop111}
                                ></Image>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                    ))}

                  {/* submit cmt reply */}
                  {comment.newlySubmittedReply && (
                    <View style={{ marginLeft: 20 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          marginTop: 10,
                          marginBottom: 10,
                        }}
                      >
                        <View>
                          <Image
                            source={{
                              uri: comment.newlySubmittedReply.account_info.avt,
                            }}
                            style={styles.iconShop}
                          />
                        </View>
                        <View
                          style={{
                            alignItems: "flex-start",
                            justifyContent: "flex-start",
                          }}
                        >
                          <Text style={styles.textShop}>
                            {comment.newlySubmittedReply.account_info.full_name}
                          </Text>
                          <Text
                            style={{
                              color: "#636363",
                              fontSize: 14,
                              marginTop: 5,
                              marginBottom: 5,
                              width: 330,
                            }}
                          >
                            [{comment.newlySubmittedReply.id}] -{" "}
                            {comment.newlySubmittedReply.content}
                          </Text>
                          <Text
                            style={{
                              color: "#636363",
                              fontSize: 11,
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                            }}
                          >
                            {comment.newlySubmittedReply.created_at}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.brButton6666}></View>
                </View>
              ))}
          </View>
          {/* <View style={styles.brButton666}></View> */}
        </View>
      </View>
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
  brButton6666: {
    height: 2,
    width: "100%",
    backgroundColor: "#F2F2F2",
    marginTop: 20,
    // paddingBottom: 10
  },
  brButton666: {
    height: 10,
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
    // backgroundColor: "#eeeeee",
    // justifyContent: "center",
  },
  productRowContainer: {
    // flexDirection: "row",
    // justifyContent: "center",
    // alignItems: "center",
    // flexWrap: "wrap",
    // width: windownWidth - 15,
    // marginLeft: 8,
    // marginTop: 5,
    // marginBottom: "26%",
    // height: "100%",
    // borderWidth: 1
    // marginBottom: 5,
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent:'center',
    borderColor: "#eeeeee",
    // height: 50,
    width: "100%",
    backgroundColor: "white",
    // position: "relative",
    // borderRadius: 5,
    borderWidth: 10,
    padding: 10,
    // marginBottom: 7,
  },
  nameProduct: {
    color: "#444444",
    fontSize: 13,
    fontWeight: "500",
    width: "95%",
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
  bgRating1: {
    // marginTop: 5,
    alignItems: "center",
    flexDirection: "row",
  },
  textReviewPr: {
    // color: "",
    marginLeft: 10,
    fontWeight: "400",
    fontWeight: "500",
    fontSize: 18,
  },
  textReviewPr1: {
    color: "#575757",
    marginLeft: 10,
    fontWeight: "400",
    fontSize: 12,
  },
  textReviewPr111: {
    color: "gray",
    // marginLeft: 5,
    marginRight: 10,
    fontWeight: "400",
    fontSize: 13,
  },
  iconShop: {
    height: 20,
    width: 20,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconShop111: {
    height: 23,
    width: 23,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconShop1111: {
    height: 26,
    width: 26,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  iconShop11111: {
    height: 23,
    width: 23,
    marginRight: 10,
    borderRadius: 50,
    borderWidth: 1,
  },
  textShop: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 10,
  },
});
