import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, Icon } from "react-native-elements";
import Toast from "react-native-toast-message";

import { useCurrentUser } from "../../../../hooks/useCurrentUser";
import { postApis } from "../../../../services/apiServices";
import { CreatePostParams } from "../../../../types/post";

const MAX_PHOTOS = 10;

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

  const handlePickFiles = () => {
    Toast.show({
      type: "info",
      text1: "Vui lòng thêm logic chọn file (Image Picker) tại đây.",
    });
  };

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
        await postApis.uploadAlbum(postId, filesToUpload as any);

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
              <Icon name="image" type="font-awesome" size={30} color="#999" />

              <TouchableOpacity
                style={styles.removeFileButton}
                onPress={() => handleRemoveFile(index)}
                disabled={isLoading}
              >
                <Icon
                  name="times-circle"
                  type="font-awesome"
                  size={18}
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
          disabled={isLoading}
          buttonStyle={styles.submitButton}
          containerStyle={{ marginTop: 20 }}
        />
        <Button
          title="Hủy"
          onPress={onCancel}
          disabled={isLoading}
          type="outline"
          buttonStyle={styles.cancelButton}
          containerStyle={{ marginTop: 10 }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: "100%",
  },
  formContainer: {
    padding: 10,
  },
  inputTitle: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    padding: 15,
    fontSize: 18,
    marginBottom: 10,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#d9d9d9",
    borderRadius: 6,
    padding: 15,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: "bold",
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
  },
  removeFileButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "white",
    borderRadius: 10,
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
    backgroundColor: "#1890ff",
    borderRadius: 6,
  },
  cancelButton: {
    borderColor: "#d9d9d9",
    borderRadius: 6,
  },
});

export default CreatePost;
