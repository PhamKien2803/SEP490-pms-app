import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Dimensions,
  TouchableOpacity, // Import TouchableOpacity để dùng cho nút đóng Modal
} from "react-native";
import { Button, Icon } from "react-native-elements";
import RNModal from "react-native-modal";
import { Post } from "../../../types/post";
import { usePagePermission } from "../../../hooks/usePagePermission";
import EditPost from "./update-post/UpdatePost";
import PostItem from "./components/post-item/PostItem";
import CreatePost from "./create-post/CreatePost";

interface ListPostProps {
  dataPosts: Post[];
  fetchApi: () => void;
  loading: boolean;
}

const { width } = Dimensions.get("window");

const ListPostScreen: React.FC<ListPostProps> = (props) => {
  const { dataPosts, loading, fetchApi } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const { canCreate } = usePagePermission(); // Giữ nguyên usePagePermission

  const handlePostCreated = () => {
    setIsModalVisible(false);
    fetchApi();
  };

  const handleEditPost = (postToEdit: Post) => {
    setEditingPost(postToEdit);
  };

  const handleEditCompleted = () => {
    setEditingPost(null);
    fetchApi();
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (editingPost) {
    return (
      <EditPost
        post={editingPost}
        onEditSuccess={handleEditCompleted}
        onCancel={handleEditCompleted}
      />
    );
  }

  const renderListHeader = () => (
    <View>
      {/* {canCreate && ( */}
      <View style={styles.createPostCard}>
        <View style={styles.createPostRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GV</Text>
          </View>
          <Button
            title="Bạn muốn chia sẻ điều gì hôm nay?"
            type="outline"
            buttonStyle={styles.createPostButton}
            titleStyle={styles.createPostButtonTitle}
            onPress={showModal}
          />
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
            onPress={showModal}
          />

          <Button
            icon={
              <Icon name="file-text" type="feather" size={18} color="#fa8c16" />
            }
            title="Tài liệu"
            type="clear"
            titleStyle={styles.optionButtonTitle}
            buttonStyle={styles.optionButton}
            onPress={showModal}
          />
        </View>
      </View>
      {/* )} */}
    </View>
  );

  const renderListEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải bài viết...</Text>
        </View>
      );
    }
    if (dataPosts?.length === 0) {
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
      />

      <RNModal
        isVisible={isModalVisible}
        onBackdropPress={handleCancel}
        style={styles.modal}
        propagateSwipe={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tạo Bài Viết Mới</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Icon name="close" type="antdesign" size={24} color="#555" />
            </TouchableOpacity>
          </View>
          <CreatePost
            onPostSuccess={handlePostCreated}
            onCancel={handleCancel}
          />
        </View>
      </RNModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: width * 0.05,
  },
  // ... (Giữ nguyên styles cho ListHeaderComponent và ListEmptyComponent)
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
    height: 50,
    borderColor: "#e0e0e0",
    justifyContent: "flex-start",
    paddingLeft: 20,
  },
  createPostButtonTitle: {
    color: "#606060",
    fontWeight: "normal",
    textAlign: "left",
    flex: 1,
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
  // STYLES MỚI CHO MODAL
  modal: {
    margin: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: Dimensions.get("window").height * 0.9, // Chiều cao tối đa 90% màn hình
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalContentWrapper: {
    // flex: 1,
    backgroundColor: "red",
  },
});

export default ListPostScreen;
