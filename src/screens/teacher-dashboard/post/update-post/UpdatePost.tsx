import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import Toast from "react-native-toast-message";
import Image from "react-native-elements/dist/image/Image";
import { FileInfo, Post } from "../../../../types/post";
import { postApis } from "../../../../services/apiServices";

const MAX_PHOTOS = 10;

// Kiểu dữ liệu cho file được chọn trong React Native
interface NewPickedFile {
  uri: string;
  name: string;
  type: string;
  isNew?: boolean;
}

interface EditPostProps {
  post: Post;
  onEditSuccess: () => void;
  onCancel: () => void;
}

const EditPost: React.FC<EditPostProps> = ({
  post,
  onEditSuccess,
  onCancel,
}) => {
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

  const handlePickFiles = () => {
    // Đây là nơi bạn sẽ gọi thư viện chọn file (ví dụ: react-native-document-picker)
    // và nhận về mảng các đối tượng { uri, name, type }
    const newFiles: NewPickedFile[] = [];

    const totalMedia =
      existingMedia?.length + fileList?.length + newFiles?.length;
    if (totalMedia > MAX_PHOTOS) {
      Toast.show({
        type: "warning",
        text1: `Tổng số media không được vượt quá ${MAX_PHOTOS}.`,
      });
    }

    const maxNewFiles = MAX_PHOTOS - existingMedia?.length - fileList?.length;

    if (maxNewFiles > 0) {
      setFileList((prev) => [...prev, ...newFiles.slice(0, maxNewFiles)]);
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
        await postApis.uploadAlbum(post.postId, newFilesToUpload as any);

        Toast.show({
          type: "success",
          text1: "Cập nhật bài viết và album ảnh thành công!",
        });
      } else {
        Toast.show({ type: "success", text1: "Cập nhật bài viết thành công!" });
      }

      setFileList([]);
      onEditSuccess();
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

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onCancel} disabled={isLoading}>
            <Icon
              name="arrow-left"
              type="font-awesome"
              size={24}
              color="#000"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            <Icon name="edit" type="font-awesome" size={20} color="#faad14" />{" "}
            Chỉnh Sửa
          </Text>
        </View>
        <Text style={styles.teacherText}>
          Bài viết của: {post?.teacher?.fullName}
        </Text>
      </View>

      <View style={styles.formCard}>
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
                    <Image
                      source={{ uri: file.fileUrl }}
                      style={styles.mediaThumbnail}
                      PlaceholderContent={
                        <Icon
                          name="image"
                          type="font-awesome"
                          size={30}
                          color="#999"
                        />
                      }
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
                <Icon
                  name="file-image-o"
                  type="font-awesome"
                  size={30}
                  color="#999"
                />
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
          onPress={onCancel}
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
    paddingVertical: 24,
  },
  headerCard: {
    width: "90%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#faad14",
  },
  teacherText: {
    textAlign: "right",
    color: "#666",
    fontSize: 14,
    marginTop: 5,
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
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
  },
  mediaThumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
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
    top: -5,
    right: -5,
    zIndex: 10,
  },
  removeIconContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 0,
    opacity: 0.85,
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
});

export default EditPost;
