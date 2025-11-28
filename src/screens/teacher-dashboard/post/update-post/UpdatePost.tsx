import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import Toast from "react-native-toast-message";
import { StackScreenProps } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

import { FileInfo, Post } from "../../../../types/post";
import { postApis } from "../../../../services/apiServices";

const MAX_PHOTOS = 10;
const { width } = Dimensions.get("window");

interface NewPickedFile {
  uri: string;
  name: string;
  type: string;
  isNew?: boolean;
}

type RootStackParamList = {
  ListPostScreen: undefined;
  CreatePostScreen: { onPostSuccess: () => void };
  EditPostScreen: { post: Post; onEditSuccess: () => void };
};

type EditPostScreenProps = StackScreenProps<
  RootStackParamList,
  "EditPostScreen"
>;

// Component nhỏ để xử lý tải ảnh và ActivityIndicator
const ImageWithLoader: React.FC<{ uri: string; style: any }> = ({
  uri,
  style,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [uri]);

  if (error) {
    return (
      <View style={[style, styles.errorPlaceholder]}>
        <Icon name="warning" type="antdesign" size={30} color="#ff4d4f" />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={{ uri: uri }}
        style={style}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        resizeMode="cover"
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#1890ff" size="small" />
        </View>
      )}
    </View>
  );
};

const EditPost: React.FC<EditPostScreenProps> = ({ navigation, route }) => {
  const { post, onEditSuccess } = route.params;

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<NewPickedFile[]>([]);
  const [existingMedia, setExistingMedia] = useState<FileInfo[]>(
    post.files || []
  );

  useEffect(() => {
    setTitle(post.title);
    setContent(post.content);
    setExistingMedia(post.files || []);
  }, [post]);

  const handlePickFiles = async () => {
    const availableSlots =
      MAX_PHOTOS - existingMedia?.length - fileList?.length;

    if (availableSlots <= 0) {
      Toast.show({
        type: "info",
        text1: `Bạn đã đạt giới hạn ${MAX_PHOTOS} files. Vui lòng xóa bớt file đã có hoặc file mới thêm.`,
      });
      return;
    }

    try {
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (newStatus !== "granted") {
          Toast.show({
            type: "error",
            text1: "Không có quyền truy cập thư viện ảnh.",
          });
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        selectionLimit: availableSlots,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newFiles: NewPickedFile[] = result.assets.map((asset: any) => {
          const isVideo = asset.mediaType === "video";
          const fileExtension =
            asset.uri.split(".").pop() || (isVideo ? "mp4" : "jpeg");
          const fileType =
            asset.mimeType || `${isVideo ? "video" : "image"}/${fileExtension}`;

          return {
            uri: asset.uri,
            name: asset.fileName || `file.${fileExtension}`,
            type: fileType,
            isNew: true,
          };
        });

        setFileList((prev) => [...prev, ...newFiles]);

        Toast.show({
          type: "success",
          text1: `Đã thêm ${newFiles.length} file mới.`,
        });
      }
    } catch (error) {
      console.error("Lỗi chọn file:", error);
      Toast.show({ type: "error", text1: "Lỗi khi chọn file." });
    }
  };

  const handleRemoveNewFile = (indexToRemove: number) => {
    setFileList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleRemoveExistingMedia = async (mediaId: string) => {
    try {
      setIsLoading(true);
      await postApis.deleteImage(mediaId);
      Toast.show({ type: "success", text1: "Đã xóa media thành công." });
      setExistingMedia((prev) => prev.filter((media) => media._id !== mediaId));
    } catch (error: any) {
      console.error("Lỗi xóa media:", error);
      Toast.show({
        type: "error",
        text1: error?.message || "Xóa media thất bại. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSave = async () => {
    const newFilesToUpload = fileList;
    if (!title.trim() || !content.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng điền đầy đủ Tiêu đề và Nội dung.",
      });
      return;
    }
    if (existingMedia?.length + newFilesToUpload?.length > MAX_PHOTOS) {
      Toast.show({
        type: "error",
        text1: `Tổng số media không được vượt quá ${MAX_PHOTOS}. Vui lòng xóa bớt.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const updateParams = {
        postId: post.postId,
        classId: post?.class?._id,
        teacherId: post?.teacher?._id,
        title,
        content,
      };

      await postApis.updatePost(post.postId, updateParams);

      if (newFilesToUpload?.length > 0) {
        const formData = new FormData();
        formData.append("postId", post.postId);
        newFilesToUpload.forEach((file) => {
          formData.append("album", {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        });
        await postApis.uploadAlbum(post.postId, formData as any);
        Toast.show({
          type: "success",
          text1: "Cập nhật bài viết và album ảnh thành công!",
        });
      } else {
        Toast.show({ type: "success", text1: "Cập nhật bài viết thành công!" });
      }

      setFileList([]);
      onEditSuccess();
      navigation.goBack();
    } catch (error: any) {
      console.error("Lỗi cập nhật bài viết:", error);
      Toast.show({
        type: "error",
        text1: error?.message || "Đã xảy ra lỗi. Vui lòng thử lại",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentTotalMedia = existingMedia?.length + fileList?.length;

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formCard}>
        <Text style={styles.teacherTextTop}>
          Bài viết của:{" "}
          <Text style={styles.teacherNameHighlight}>
            {post?.teacher?.fullName}
          </Text>
        </Text>
        <Text style={styles.label}>Tiêu đề</Text>
        <TextInput
          placeholder="Tiêu đề bài viết..."
          value={title}
          onChangeText={setTitle}
          style={styles.inputTitle}
          editable={!isLoading}
        />
        <Text style={styles.label}>Nội dung</Text>
        <TextInput
          placeholder="Nội dung bài viết"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={6}
          style={styles.textArea}
          editable={!isLoading}
        />
        <Text style={styles.mediaTitle}>
          Quản Lý Ảnh/Video ({currentTotalMedia}/{MAX_PHOTOS})
        </Text>

        {existingMedia?.length > 0 && (
          <View style={styles.existingMediaSection}>
            <Text style={styles.existingMediaLabel}>
              Media đã có ({existingMedia?.length}):
            </Text>
            <View style={styles.mediaRow}>
              {existingMedia.map((file) => (
                <View key={file._id} style={styles.mediaItem}>
                  {file.fileType === "image" ? (
                    <ImageWithLoader
                      uri={file.fileUrl}
                      style={styles.mediaThumbnail}
                    />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <Icon
                        name="video-camera"
                        type="font-awesome"
                        size={30}
                        color="#faad14"
                      />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeFileButton}
                    onPress={() => handleRemoveExistingMedia(file._id)}
                    disabled={isLoading}
                  >
                    <Icon
                      name="times-circle"
                      type="font-awesome"
                      size={20}
                      color="red"
                      containerStyle={styles.removeIconContainer}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.newMediaSection}>
          <Text style={styles.label}>Thêm Ảnh/Video Mới:</Text>
          <View style={styles.mediaRow}>
            {fileList.map((file, index) => (
              <View key={`new-${index}`} style={styles.mediaItem}>
                {file.type.startsWith("image/") ? (
                  <ImageWithLoader
                    uri={file.uri}
                    style={styles.mediaThumbnail}
                  />
                ) : (
                  <Icon
                    name="file-video-o"
                    type="font-awesome"
                    size={30}
                    color="#999"
                  />
                )}
                <TouchableOpacity
                  style={styles.removeFileButton}
                  onPress={() => handleRemoveNewFile(index)}
                  disabled={isLoading}
                >
                  <Icon
                    name="times-circle"
                    type="font-awesome"
                    size={20}
                    color="red"
                    containerStyle={styles.removeIconContainer}
                  />
                </TouchableOpacity>
              </View>
            ))}

            {currentTotalMedia < MAX_PHOTOS && (
              <TouchableOpacity
                style={styles.uploadButtonPlaceholder}
                onPress={handlePickFiles}
                disabled={isLoading}
              >
                <Icon
                  name="plus"
                  type="font-awesome"
                  size={20}
                  color="#1890ff"
                />
                <Text style={styles.uploadButtonText}>Tải lên</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Button
          title={isLoading ? "Đang Cập Nhật..." : "Lưu Thay Đổi"}
          onPress={onSave}
          loading={isLoading}
          disabled={isLoading}
          buttonStyle={styles.submitButton}
          containerStyle={{ marginTop: 40 }}
        />
        <Button
          title="Hủy Bỏ"
          onPress={handleCancel}
          disabled={isLoading}
          type="outline"
          buttonStyle={styles.cancelButton}
          containerStyle={{ marginTop: 10, marginBottom: 20 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  contentContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  // THÊM STYLE MỚI CHO TÊN GV
  teacherTextTop: {
    textAlign: "left",
    color: "#666",
    fontSize: 14,
    marginBottom: 15,
  },
  teacherNameHighlight: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 15,
  },
  formCard: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 10,
  },
  inputTitle: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    padding: 12,
    fontSize: 18,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  mediaTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  existingMediaSection: {
    marginBottom: 20,
  },
  existingMediaLabel: {
    color: "#1890ff",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  newMediaSection: {
    marginTop: 10,
  },
  mediaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  mediaItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 10,
    position: "relative",
    overflow: "visible", // QUAN TRỌNG: Đảm bảo icon xóa nằm ngoài được hiển thị
    backgroundColor: "#f0f0f0",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoPlaceholder: {
    backgroundColor: "#262626",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  removeFileButton: {
    position: "absolute",
    top: -8, // Đẩy lên trên
    right: -8, // Đẩy sang phải
    zIndex: 10, // QUAN TRỌNG: Đảm bảo nó nằm trên tất cả
  },
  removeIconContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 2,
    opacity: 1,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  uploadButtonPlaceholder: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  uploadButtonText: {
    marginTop: 5,
    fontSize: 12,
    color: "#1890ff",
  },
  submitButton: {
    backgroundColor: "#faad14",
    borderRadius: 6,
  },
  cancelButton: {
    borderColor: "#d9d9d9",
    borderRadius: 6,
    color: "#000",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(240, 240, 240, 0.7)",
  },
  errorPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});

export default EditPost;
