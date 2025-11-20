import React, { useState } from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  SafeAreaView, 
  Alert 
} from 'react-native';
import { WebView } from 'react-native-webview';
// Sử dụng NativeStackScreenProps từ @react-navigation/native-stack
import type { NativeStackScreenProps } from '@react-navigation/native-stack'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthStackParamList } from "../../../routes/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, 'PaymentWebView'>;

const PaymentWebViewScreen: React.FC<Props> = ({ route, navigation }) => {
  const { url } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  // Hàm xử lý khi URL thay đổi (người dùng thao tác trên WebView)
  const handleNavigationStateChange = (navState: any) => {
    const { url } = navState;

    if (!url) return;

    if (url.includes('status=PAID') || url.includes('payment/success')) {
      navigation.navigate('Tuition', { 
        student: {} as any, 
        shouldRefresh: true 
      });
      return;
    }

    if (url.includes('status=CANCELLED') || url.includes('payment/cancel')) {
      navigation.goBack();
      return;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header đơn giản */}
      <View style={styles.header}>
         <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.closeButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
         >
            <MaterialCommunityIcons name="close" size={28} color="#333" />
         </TouchableOpacity>
         <Text style={styles.title}>Cổng thanh toán PayOS</Text>
         <View style={{width: 28}} />
      </View>
      
      {/* WebView */}
      <WebView
        source={{ uri: url }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        style={{ flex: 1 }}
        // Các props hỗ trợ thanh toán mượt mà hơn
        startInLoadingState={true}
        renderLoading={() => (
           <View style={styles.loadingOverlay}>
             <ActivityIndicator size="large" color="#00B4D8" />
           </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0077B6',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,1)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default PaymentWebViewScreen;