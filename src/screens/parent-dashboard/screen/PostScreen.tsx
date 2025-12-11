import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Hoặc react-native-vector-icons
import { userApis } from "../../../services/apiServices";
import { AuthStackParamList } from "../../../routes/AuthStack";
import { Post, PostFile } from "../../../types/auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Post">;

const { width } = Dimensions.get("window");
// Tính toán kích thước ảnh grid
const GAP = 4;
const HALF_WIDTH = (width - 32 - GAP) / 2; // 32 là padding horizontal container
const THIRD_WIDTH = (width - 32 - GAP * 2) / 3;

const COLORS = {
  primary: "#00B4D8",
  primaryDark: "#0077B6",
  background: "#F0F8FF",
  white: "#FFFFFF",
  textPrimary: "#333333",
  textSecondary: "#666666",
  textLight: "#999999",
  border: "#E0E0E0",
  overlay: "rgba(0,0,0,0.9)",
};

const PostScreen: React.FC<Props> = ({ route, navigation }) => {
  const { student } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState("");

  // State cho Modal xem ảnh full màn hình
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<PostFile[]>([]);
  const [initialIndex, setInitialIndex] = useState(0);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await userApis.getPostsByStudent(student._id);
        if (res) {
          // Sắp xếp bài viết mới nhất lên đầu (nếu API chưa sort)
          const sortedPosts = res.posts.sort(
            (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setPosts(sortedPosts);
          
          // Lấy tên lớp từ response class object
          if (res.class && res.class.className) {
            setClassName(res.class.className);
          }
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [student._id]);

  // --- Helper: Format Time ---
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      if (diffHours < 1) return "Vừa xong";
      return `${Math.floor(diffHours)} giờ trước`;
    }
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} lúc ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // --- Handle Open Gallery ---
  const openGallery = (files: PostFile[], index: number) => {
    setSelectedFiles(files);
    setInitialIndex(index);
    setModalVisible(true);
  };

  // --- Render Grid Images Logic ---
  const renderMediaGrid = (files: PostFile[]) => {
    if (!files || files.length === 0) return null;

    const count = files.length;
    const displayFiles = files.slice(0, 4); // Chỉ hiển thị tối đa 4 item trên grid

    // Helper render 1 item
    const renderItem = (file: PostFile, index: number, style: any, isOverlay = false) => {
      const isVideo = file.fileType === 'video';
      return (
        <TouchableOpacity
          key={file._id}
          style={[styles.mediaItem, style]}
          onPress={() => openGallery(files, index)}
          activeOpacity={0.9}
        >
          {/* Nếu là video, hiển thị thumbnail (hoặc icon play nếu ko có thumb) */}
          <Image
            source={{ uri: isVideo ? "https://via.placeholder.com/300/000000/FFFFFF?text=Video" : file.fileUrl }} 
            style={styles.mediaImage}
            resizeMode="cover"
          />
          
          {isVideo && (
             <View style={styles.playIconOverlay}>
                 <MaterialCommunityIcons name="play-circle" size={40} color="rgba(255,255,255,0.8)" />
             </View>
          )}

          {/* Overlay số lượng ảnh còn lại (+3, +5...) */}
          {isOverlay && count > 4 && (
            <View style={styles.moreOverlay}>
              <Text style={styles.moreText}>+{count - 4}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    };

    // --- Layout Logic ---
    if (count === 1) {
      return (
        <View style={styles.gridContainer}>
           {renderItem(files[0], 0, { width: '100%', height: 250 })}
        </View>
      );
    }
    
    if (count === 2) {
      return (
        <View style={styles.gridContainerRow}>
          {renderItem(files[0], 0, { width: HALF_WIDTH, height: 200, marginRight: GAP })}
          {renderItem(files[1], 1, { width: HALF_WIDTH, height: 200 })}
        </View>
      );
    }

    if (count === 3) {
      return (
        <View style={styles.gridContainerRow}>
           {renderItem(files[0], 0, { width: '100%', height: 200, marginBottom: GAP })}
           <View style={{flexDirection: 'row'}}>
              {renderItem(files[1], 1, { width: HALF_WIDTH, height: 150, marginRight: GAP })}
              {renderItem(files[2], 2, { width: HALF_WIDTH, height: 150 })}
           </View>
        </View>
      );
    }

    // 4 hoặc nhiều hơn
    return (
      <View style={styles.gridContainer}>
         <View style={{flexDirection: 'row', marginBottom: GAP}}>
            {renderItem(files[0], 0, { width: HALF_WIDTH, height: 180, marginRight: GAP })}
            {renderItem(files[1], 1, { width: HALF_WIDTH, height: 180 })}
         </View>
         <View style={{flexDirection: 'row'}}>
            {renderItem(files[2], 2, { width: HALF_WIDTH, height: 180, marginRight: GAP })}
            {renderItem(files[3], 3, { width: HALF_WIDTH, height: 180 }, true)}
         </View>
      </View>
    );
  };

  // --- Render Post Card ---
  const renderPostItem = ({ item }: { item: Post }) => {
    return (
      <View style={styles.card}>
        {/* Header: Avatar, Name, Time */}
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
             <Text style={styles.avatarText}>{item.teacher.fullName.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teacherName}>{item.teacher.fullName}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
                <MaterialCommunityIcons name="circle-small" size={14} color={COLORS.textLight} />
                <Text style={styles.classNameText}>{item.class.className}</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={COLORS.textLight} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
            {item.title && <Text style={styles.postTitle}>{item.title}</Text>}
            {item.content && <Text style={styles.postBody}>{item.content}</Text>}
        </View>

        {/* Images/Videos */}
        {renderMediaGrid(item.files)}

        {/* Footer Actions (Like/Comment - Mock UI) */}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hoạt động lớp {className || student.fullName}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.postId}
          renderItem={renderPostItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="image-album" size={60} color={COLORS.border} />
                <Text style={styles.emptyText}>Chưa có hoạt động nào được chia sẻ.</Text>
            </View>
          }
        />
      )}

      {/* --- FULL SCREEN IMAGE MODAL --- */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        animationType="fade"
      >
        <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => setModalVisible(false)}
            >
                <MaterialCommunityIcons name="close" size={30} color="#FFF" />
            </TouchableOpacity>
            
            <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                contentOffset={{ x: width * initialIndex, y: 0 }} // Scroll tới ảnh được chọn
            >
                {selectedFiles.map((file) => (
                    <View key={file._id} style={styles.fullScreenItem}>
                         {file.fileType === 'image' ? (
                             <Image 
                                source={{ uri: file.fileUrl }} 
                                style={styles.fullScreenImage} 
                                resizeMode="contain"
                             />
                         ) : (
                             // Placeholder cho Video trong Modal
                             <View style={styles.videoPlaceholder}>
                                <MaterialCommunityIcons name="video-outline" size={80} color="#FFF" />
                                <Text style={{color: '#FFF', marginTop: 10}}>Video Playback</Text>
                             </View>
                         )}
                    </View>
                ))}
            </ScrollView>
            
            <View style={styles.modalFooter}>
                 <Text style={{color: '#FFF'}}>{selectedFiles.length} files</Text>
            </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: { padding: 4 },
  headerTitle: { 
      fontSize: 18, 
      fontWeight: "700", 
      color: COLORS.primaryDark,
      flex: 1,
      textAlign: 'center'
  },
  
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { paddingBottom: 20 },

  // Card Styles
  card: {
    backgroundColor: COLORS.white,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    // Shadow nhẹ cho giống Card
    elevation: 2, 
  },
  cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
  },
  avatarContainer: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: '#FFCC80', // Cam nhạt
      justifyContent: 'center', alignItems: 'center',
      marginRight: 10,
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#E65100' },
  teacherName: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  timeText: { fontSize: 12, color: COLORS.textSecondary },
  classNameText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  
  cardContent: {
      paddingHorizontal: 12,
      paddingBottom: 12,
  },
  postTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: COLORS.textPrimary },
  postBody: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },

  // Media Grid
  gridContainer: { flexDirection: 'column', width: '100%', paddingHorizontal: 16, marginBottom: 12 },
  gridContainerRow: { flexDirection: 'row', width: '100%', paddingHorizontal: 16, marginBottom: 12 },
  mediaItem: {
      backgroundColor: '#EEE',
      borderRadius: 8,
      overflow: 'hidden',
  },
  mediaImage: { width: '100%', height: '100%' },
  
  // Overlay (+N ảnh)
  moreOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  moreText: {
      color: '#FFF',
      fontSize: 24,
      fontWeight: 'bold',
  },
  // Play Icon Overlay
  playIconOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.1)',
  },

  // Footer Actions
  cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { marginLeft: 6, color: COLORS.textSecondary, fontWeight: '500' },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 50, opacity: 0.6 },
  emptyText: { marginTop: 10, color: COLORS.textSecondary },

  // Full Screen Modal
  modalContainer: {
      flex: 1,
      backgroundColor: '#000',
      justifyContent: 'center',
  },
  modalCloseButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 20,
      left: 20,
      zIndex: 10,
      padding: 10,
  },
  fullScreenItem: {
      width: width,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  fullScreenImage: {
      width: '100%',
      height: '80%',
  },
  videoPlaceholder: {
      width: '100%',
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#333'
  },
  modalFooter: {
      position: 'absolute',
      bottom: 40,
      alignSelf: 'center',
  }
});

export default PostScreen;