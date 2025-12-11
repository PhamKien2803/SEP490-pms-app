import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import { StackScreenProps } from "@react-navigation/stack";
import { Post } from "../../../types/post";
import PostItem from "./components/post-item/PostItem";
import { useNavigation } from "@react-navigation/native";

type RootStackParamList = {
  ListPostScreen: undefined;
  CreatePostScreen: { onPostSuccess: () => void };
  EditPostScreen: { post: Post; onEditSuccess: () => void };
};

type ListPostScreenProps = StackScreenProps<
  RootStackParamList,
  "ListPostScreen"
>;

interface ListPostProps extends ListPostScreenProps {
  dataPosts: Post[];
  fetchApi: () => void;
  loading: boolean;
}

const { width } = Dimensions.get("window");

const ListPostScreen: React.FC<ListPostProps> = (props) => {
  const { dataPosts, loading, fetchApi } = props;
  const navigation = useNavigation<any>();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePostCreated = () => {
    fetchApi();
  };

  const handleEditPost = (postToEdit: Post) => {
    navigation.navigate("EditPost", {
      post: postToEdit,
      onEditSuccess: fetchApi,
    });
  };

  const handleNavigateToCreatePost = () => {
    navigation.navigate("CreatePost", {
      onPostSuccess: handlePostCreated,
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);

    await fetchApi();

    setIsRefreshing(false);
  };

  const renderListHeader = () => (
    <View>
      <View style={styles.createPostCard}>
        <View style={styles.createPostRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GV</Text>
          </View>
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={handleNavigateToCreatePost}
          >
            <Text>Bạn muốn chia sẻ điều gì hôm nay?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentDivider} />

        <View style={styles.optionsRow}>
          <Button
            icon={
              <Icon name="image" type="feather" size={18} color="#49aa19" />
            }
            title="Ảnh/Video"
            type="clear"
            titleStyle={styles.optionButtonTitle}
            buttonStyle={styles.optionButton}
            onPress={handleNavigateToCreatePost}
          />

          <Button
            icon={
              <Icon name="file-text" type="feather" size={18} color="#fa8c16" />
            }
            title="Tài liệu"
            type="clear"
            titleStyle={styles.optionButtonTitle}
            buttonStyle={styles.optionButton}
            onPress={handleNavigateToCreatePost}
          />
        </View>
      </View>
    </View>
  );

  const renderListEmpty = () => {
    if (loading && !isRefreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      );
    }
    if (!loading && dataPosts?.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chưa có bài viết nào được đăng.</Text>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dataPosts}
        keyExtractor={(item) => item.postId}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            onEdit={handleEditPost}
            onDeleteSuccess={fetchApi}
          />
        )}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#1890ff"]}
            tintColor={"#1890ff"}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: width * 0.05,
  },
  createPostCard: {
    marginHorizontal: 0,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: "#fff",
  },
  createPostRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1890ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createPostButton: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    height: 38,
    borderColor: "#e0e0e0",
    paddingLeft: 20,
    justifyContent: "center",
  },
  contentDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 10,
    marginHorizontal: -16,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 5,
  },
  optionButton: {
    paddingHorizontal: 10,
    flex: 1,
    justifyContent: "center",
  },
  optionButtonTitle: {
    color: "#606060",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  loadingContainer: {
    padding: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#999",
  },
  emptyCard: {
    marginHorizontal: 0,
    marginTop: 16,
    borderRadius: 12,
    padding: 50,
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    fontWeight: "bold",
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default ListPostScreen;
