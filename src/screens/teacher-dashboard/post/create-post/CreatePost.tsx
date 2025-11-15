import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";

// Import các hooks và types của bạn
import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { postApis } from "../../../../services/apiServices";
import { CreatePostParams } from "../../../../types/post";

const MAX_PHOTOS = 10;
const { width } = Dimensions.get("window");

interface CreatePostProps {
  onPostSuccess: () => void;
  onCancel: () => void;
}

interface RNFile {
  uri: string;
  name: string;
  type: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ onPostSuccess, onCancel }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileList, setFileList] = useState<RNFile[]>([]);
  const user = useCurrentUser();

  const handlePickFiles = async () => {
    const availableSlots = MAX_PHOTOS - fileList.length;

    if (availableSlots <= 0) {
      Toast.show({
        type: "info",
        text1: `Bạn đã chọn đủ ${MAX_PHOTOS} ảnh/video.`,
      });
      return;
    }

    // 1. KIỂM TRA VÀ YÊU CẦU QUYỀN TRUY CẬP
    const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      const { status: newStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (newStatus !== "granted") {
        Alert.alert(
          "Không có quyền",
          "Vui lòng cấp quyền truy cập thư viện ảnh trong cài đặt thiết bị để tiếp tục.",
          [{ text: "OK" }]
        );
        return;
      }
    }

    // 2. CHỌN ẢNH TỪ THƯ VIỆN
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: availableSlots,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newFiles: RNFile[] = result.assets
        .map((asset) => {
          // FIX TS: Sử dụng Type Assertion (as any) để truy cập mediaType
          // và sử dụng thuộc tính mimeType hoặc tạo type dự phòng
          const assetAny = asset as any;

          // Xác định loại file dựa trên mediaType hoặc mimeType
          const isVideo =
            assetAny.mediaType === ImagePicker.MediaType.Video ||
            asset.mimeType?.startsWith("video/");
          const fileType = isVideo ? "video" : "image";
          const fileExtension =
            asset.uri.split(".").pop() || (isVideo ? "mp4" : "jpeg");

          return {
            uri: asset.uri,
            name:
              asset.fileName ||
              asset.uri.split("/").pop() ||
              `file.${fileExtension}`,
            type: asset.mimeType || `${fileType}/${fileExtension}`,
          };
        })
        .filter((file) => file.uri !== "");

      setFileList((prev) => [...prev, ...newFiles]);
      Toast.show({
        type: "success",
        text1: `Đã thêm ${newFiles.length} file vào danh sách.`,
      });
    }
  };
  // ---------------------------------------------------------------------

  const handleRemoveFile = (indexToRemove: number) => {
    setFileList((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const onPost = async () => {
    if (!title.trim() || !content.trim()) {
      Toast.show({
        type: "error",
        text1: "Vui lòng điền đầy đủ Tiêu đề và Nội dung.",
      });
      return;
    }
    if (!user?.staff) {
      Toast.show({
        type: "error",
        text1: "Không tìm thấy thông tin giáo viên.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const classResponse = await postApis.getClass(user.staff);
      const classId = classResponse?.classes?._id;

      if (!classId) {
        throw new Error("Không tìm thấy lớp học của giáo viên này.");
      }

      const postParams: CreatePostParams = {
        classId: classId,
        teacherId: user.staff,
        title,
        content,
      };

      const createPostResult = await postApis.createNewPost(postParams);
      const postId = createPostResult?._id;

      if (!postId) {
        throw new Error("Không nhận được ID bài viết sau khi tạo.");
      }

      const filesToUpload = fileList;

      if (filesToUpload?.length > 0) {
        const formData = new FormData();
        formData.append("postId", postId);
        filesToUpload.forEach((file) => {
          formData.append("album", {
            uri: file.uri,
            name: file.name,
            type: file.type,
          } as any);
        });

        await postApis.uploadAlbum(postId, formData as any);

        Toast.show({
          type: "success",
          text1: "Đăng bài post và album ảnh thành công!",
        });
      } else {
        Toast.show({
          type: "success",
          text1: "Đăng bài post chỉ có nội dung thành công!",
        });
      }

      setTitle("");
      setContent("");
      setFileList([]);
      onPostSuccess();
    } catch (error: any) {
      const errorMessage = error?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      Toast.show({ type: "error", text1: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <TextInput
          placeholder="Tiêu đề bài viết..."
          value={title}
          onChangeText={setTitle}
          style={styles.inputTitle}
          editable={!isLoading}
          maxLength={100}
        />

        <TextInput
          placeholder="Bạn muốn chia sẻ điều gì hôm nay?"
          value={content}
          onChangeText={setContent}
          multiline
          numberOfLines={5}
          style={styles.textArea}
          editable={!isLoading}
        />

        <Text style={styles.uploadLabel}>Ảnh/Video (Tối đa {MAX_PHOTOS}):</Text>

        <View style={styles.fileListContainer}>
          {fileList.map((file, index) => (
            <View key={index} style={styles.fileItem}>
              {file.type.startsWith("video/") ? (
                <View style={styles.fileThumbnail}>
                  <Icon
                    name="video-camera"
                    type="font-awesome"
                    size={30}
                    color="#333"
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: file.uri }}
                  style={styles.fileThumbnail}
                />
              )}

              <TouchableOpacity
                style={styles.removeFileButton}
                onPress={() => handleRemoveFile(index)}
                disabled={isLoading}
              >
                <Icon
                  name="times-circle"
                  type="font-awesome"
                  size={20}
                  color="red"
                />
              </TouchableOpacity>
            </View>
          ))}

          {fileList?.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.uploadButtonPlaceholder}
              onPress={handlePickFiles}
              disabled={isLoading}
            >
              <Icon name="plus" type="font-awesome" size={20} color="#1890ff" />
              <Text style={styles.uploadButtonText}>Tải lên</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title={isLoading ? "Đang Đăng Bài..." : "Đăng Bài Ngay"}
          onPress={onPost}
          loading={isLoading}
          disabled={isLoading || !title.trim() || !content.trim()}
          buttonStyle={styles.submitButton}
          containerStyle={{ marginTop: 20 }}
        />
        <Button
          title="Hủy"
          onPress={onCancel}
          disabled={isLoading}
          type="outline"
          buttonStyle={styles.cancelButton}
          titleStyle={styles.cancelButtonTitle}
          containerStyle={{ marginTop: 10, marginBottom: 10 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  formContainer: {
    padding: 15,
  },
  inputTitle: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: "top",
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  fileListContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  fileItem: {
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
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  fileThumbnail: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    // Thêm các style căn giữa nếu là View (cho icon video)
    justifyContent: "center",
    alignItems: "center",
  },
  removeFileButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "white",
    borderRadius: 15,
    zIndex: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  uploadButtonPlaceholder: {
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: "#1890ff",
    borderStyle: "dashed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: "#f5f5ff",
  },
  uploadButtonText: {
    marginTop: 5,
    fontSize: 12,
    color: "#1890ff",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#1890ff",
    borderRadius: 8,
    height: 50,
  },
  cancelButton: {
    borderColor: "#d9d9d9",
    borderRadius: 8,
    height: 50,
    backgroundColor: "white",
  },
  cancelButtonTitle: {
    color: "#333",
    fontWeight: "500",
  },
});

export default CreatePost;
