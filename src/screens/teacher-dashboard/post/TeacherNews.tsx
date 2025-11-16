import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Icon } from "react-native-elements";
import Toast from "react-native-toast-message";
import ListPostScreen from "./ListPost";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { Post, PostsResponse } from "../../../types/post";
import { postApis } from "../../../services/apiServices";

function TeacherNews() {
  const user = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const teacherId = user?.staff;

  const fetchPosts = useCallback(async () => {
    if (!teacherId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response: PostsResponse = await postApis.getListPost(teacherId);
      setPosts(response.posts);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: error?.message || "Không thể tải danh sách bài viết.",
      });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <ListPostScreen
        fetchApi={fetchPosts}
        dataPosts={posts}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },
  icon: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0050b3",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 0,
  },
});

export default TeacherNews;
