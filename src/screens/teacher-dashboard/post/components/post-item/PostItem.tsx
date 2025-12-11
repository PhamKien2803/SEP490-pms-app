import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Card as RNECard, Icon, Button, Image } from "react-native-elements";
import RNModal from "react-native-modal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import {
  Menu,
  MenuTrigger,
  MenuOptions,
  MenuOption,
} from "react-native-popup-menu";
import Video from "react-native-video";
import Toast from "react-native-toast-message";
import ImageViewing from "react-native-image-viewing";

import { Post } from "../../../../../types/post";
import { usePagePermission } from "../../../../../hooks/usePagePermission";
import { postApis } from "../../../../../services/apiServices";

dayjs.extend(relativeTime);
dayjs.locale("vi");

interface PostItemProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDeleteSuccess: () => void;
}

const Card = RNECard as any;
const { width } = Dimensions.get("window");

const PostItem: React.FC<PostItemProps> = ({
  post,
  onEdit,
  onDeleteSuccess,
}) => {
  const timeAgo = dayjs(post?.createdAt).locale("vi").fromNow();
  const detailedDate = dayjs(post?.createdAt).format("HH:mm, DD/MM/YYYY");

  const [isShowConfirmDelete, setIsShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [previewInitialIndex, setPreviewInitialIndex] = useState(0);

  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const MAX_LINES = 3;

  const mediaFiles = post.files.filter(
    (f) => f.fileType === "image" || f.fileType === "video"
  );

  const previewImages = mediaFiles
    .filter((f) => f.fileType === "image")
    .map((f) => ({ uri: f.fileUrl }));

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setIsShowConfirmDelete(false);
    try {
      await postApis.deletePost(post?.postId);
      Toast.show({
        type: "success",
        text1: "Xóa bài viết thành công!",
      });
      onDeleteSuccess();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Xóa bài viết thất bại.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const menuItems = (
    <MenuOptions>
      <MenuOption onSelect={() => onEdit(post)}>
        <View style={styles.menuItem}>
          <Icon
            name="edit"
            type="font-awesome"
            size={18}
            color="#007AFF"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.menuItemText}>Chỉnh Sửa Bài Viết</Text>
        </View>
      </MenuOption>
      <MenuOption onSelect={() => setIsShowConfirmDelete(true)}>
        <View style={styles.menuItem}>
          <Icon
            name="trash"
            type="font-awesome"
            size={18}
            color="#FF3B30"
            style={{ marginRight: 10 }}
          />
          <Text style={[styles.menuItemText, { color: "#FF3B30" }]}>
            Xóa Bài Viết
          </Text>
        </View>
      </MenuOption>
    </MenuOptions>
  );

  const renderMediaItem = ({ item, index }: { item: any; index: number }) => {
    const isImage = item.fileType === "image";
    const mediaWidth = width - 32;
    const mediaHeight = 300;

    const imageIndexInPreview = previewImages.findIndex(
      (img) => img.uri === item.fileUrl
    );

    return (
      <View
        key={index}
        style={[
          styles.mediaContainer,
          { width: mediaWidth, height: mediaHeight },
        ]}
      >
        {isImage ? (
          <TouchableOpacity
            onPress={() => {
              if (imageIndexInPreview !== -1) {
                setPreviewInitialIndex(imageIndexInPreview);
                setIsPreviewVisible(true);
              }
            }}
          >
            <Image
              source={{ uri: item.fileUrl }}
              style={{
                width: mediaWidth,
                height: mediaHeight,
                resizeMode: "cover",
              }}
              PlaceholderContent={<ActivityIndicator color="#999" />}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ height: mediaHeight, backgroundColor: "#000" }}>
            <Video
              source={{ uri: item.fileUrl }}
              style={styles.videoStyle}
              controls={true}
              resizeMode="contain"
              paused={true}
            />
            <View style={styles.videoTag}>
              <Icon
                name="video-camera"
                type="font-awesome"
                color="#fff"
                size={12}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.videoTagText}>Video</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const isContentLong =
    post.content.split("\n").length > MAX_LINES || post.content.length > 200;

  return (
    <Card containerStyle={styles.cardContainer}>
      <View style={styles.header}>
        <View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.teacherName}>{post.teacher.fullName}</Text>
            <View style={styles.classTag}>
              <Text style={styles.classTagText}>{post.class.className}</Text>
            </View>
          </View>
          <View style={styles.timeContainer}>
            <Icon
              name="clock-o"
              type="font-awesome"
              size={12}
              color="#999"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.timeText} accessibilityLabel={detailedDate}>
              {timeAgo}
            </Text>
          </View>
        </View>
        <Menu>
          <MenuTrigger
            customStyles={{
              triggerWrapper: styles.menuTriggerWrapper,
            }}
          >
            <Icon
              name="ellipsis-v"
              type="font-awesome"
              size={20}
              color="#666"
            />
          </MenuTrigger>
          {menuItems}
        </Menu>
      </View>

      <Text style={styles.title}>{post.title}</Text>

      <Text
        style={styles.content}
        numberOfLines={isContentExpanded ? undefined : MAX_LINES}
      >
        {post.content}
      </Text>

      {isContentLong && (
        <TouchableOpacity
          onPress={() => setIsContentExpanded(!isContentExpanded)}
          style={styles.readMoreButton}
        >
          <Text style={styles.readMoreText}>
            {isContentExpanded ? "Thu gọn" : "Xem thêm"}
          </Text>
        </TouchableOpacity>
      )}

      {mediaFiles?.length > 0 && (
        <View style={styles.mediaGallery}>
          <FlatList
            data={mediaFiles}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.fileUrl}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: mediaFiles.length * (width - 32) }}
            snapToInterval={width - 32}
            decelerationRate="fast"
          />
          {mediaFiles.length > 1 && (
            <Text style={styles.carouselIndicatorText}>
              {mediaFiles.length} files
            </Text>
          )}
        </View>
      )}

      <ImageViewing
        images={previewImages}
        imageIndex={previewInitialIndex}
        visible={isPreviewVisible}
        onRequestClose={() => setIsPreviewVisible(false)}
      />

      <RNModal
        isVisible={isShowConfirmDelete}
        onBackdropPress={() => setIsShowConfirmDelete(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Xác nhận xóa</Text>
          <Text style={styles.modalBody}>
            Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không
            thể hoàn tác.
          </Text>
          <View style={styles.modalActions}>
            <Button
              title="Hủy"
              type="outline"
              containerStyle={styles.modalButtonContainer}
              buttonStyle={styles.modalCancelButton}
              onPress={() => setIsShowConfirmDelete(false)}
              disabled={isDeleting}
            />
            <Button
              title="Xóa"
              loading={isDeleting}
              buttonStyle={styles.modalDeleteButton}
              containerStyle={styles.modalButtonContainer}
              onPress={handleConfirmDelete}
            />
          </View>
        </View>
      </RNModal>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 16,
    borderRadius: 12,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 0,
  },
  menuTriggerWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginRight: -10,
    marginTop: -10,
  },
  teacherName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  classTag: {
    marginLeft: 8,
    backgroundColor: "#2db7f5",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  classTagText: {
    color: "white",
    fontSize: 12,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0050b3",
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
  },
  content: {
    fontSize: 14,
    color: "#454545",
    paddingHorizontal: 16,
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreButton: {
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 0,
  },
  readMoreText: {
    color: "#1890ff",
    fontWeight: "600",
    fontSize: 14,
  },
  mediaGallery: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  mediaContainer: {
    height: 300,
    backgroundColor: "#000",
  },
  videoStyle: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  videoTag: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fa541c",
    padding: 5,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  videoTagText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 5,
  },
  carouselIndicatorText: {
    position: "absolute",
    bottom: 10,
    right: 10,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 12,
    zIndex: 1,
  },
  modalContent: {
    backgroundColor: "white",
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  modalButtonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  modalCancelButton: {
    borderColor: "#999",
  },
  modalDeleteButton: {
    backgroundColor: "#FF3B30",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default PostItem;
