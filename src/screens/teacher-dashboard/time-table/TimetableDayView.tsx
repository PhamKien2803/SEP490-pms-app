import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Dimensions } from 'react-native'; // Thêm Dimensions
import { Card, Button, Icon } from '@rneui/themed';
import { IActivity } from '../../../types/teacher'; 
import dayjs from 'dayjs';
import Timeline from 'react-native-timeline-flatlist';
import type { FlatListProps } from 'react-native'; 

// Lấy chiều cao màn hình để đặt kích thước tối đa cho nội dung có thể cuộn
const { height: screenHeight } = Dimensions.get('window');

const formatMinutesToTime = (minutes?: number | null): string => {
    if (minutes == null || isNaN(minutes)) return '--:--';
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
};

const getActivityProps = (activity: IActivity) => {
    let color: string;
    let iconName: string;
    let iconType: 'antdesign' | 'font-awesome' | 'material' = 'font-awesome';

    if (activity.type === 'Cố định') {
        color = '#007AFF';
        iconName = 'lock1'; // Thay đổi icon để phù hợp với AntDesign (trước đó là lock)
        iconType = 'antdesign';
    } else if (activity.type === 'Bình thường') {
        color = '#28A745';
        iconName = 'edit';
        iconType = 'antdesign';
    } else if (activity.type === 'Sự kiện') {
        color = '#FFC107';
        iconName = 'bulb1';
        iconType = 'antdesign';
    } else {
        color = '#6C757D';
        iconName = 'calendar';
        iconType = 'font-awesome';
    }
    return { color, iconName, iconType };
};

interface DayData {
    _id: string;
    date: string;
    dayName: string;
    activities: IActivity[];
}

interface Props {
    getDaysOfWeek: DayData[];
}

const TimetableDayView: React.FC<Props> = ({ getDaysOfWeek }) => {
    const today = dayjs();
    const defaultIndex = getDaysOfWeek.findIndex((d) =>
        today.isSame(dayjs(d.date), 'day'),
    );
    const [currentIndex, setCurrentIndex] = useState(
        defaultIndex >= 0 ? defaultIndex : 0,
    );
    const currentDay = getDaysOfWeek[currentIndex];

    const handlePrev = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

<<<<<<< Updated upstream
    const handleNext = () => {
        if (currentIndex < getDaysOfWeek.length - 1)
            setCurrentIndex(currentIndex + 1);
    };
=======
  const handleNext = () => {
    if (currentIndex < getDaysOfWeek?.length - 1)
      setCurrentIndex(currentIndex + 1);
  };
>>>>>>> Stashed changes

    if (!currentDay) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="calendar-times-o" type="font-awesome" color="#909090" size={50} />
                <Text style={styles.emptyText}>Không có dữ liệu</Text>
            </View>
        );
    }

    // 1. TẠO CUSTOM RENDER COMPONENT CHO NỘI DUNG TIMELINE
    const renderDetailContent = (act: IActivity, color: string) => (
        <View style={styles.activityDetailView}>
            <Text style={[styles.activityNameText, { color: color }]}>
                {act.activityName}
            </Text>
            <Text style={styles.endTimeText}>
                **Kết thúc:** {formatMinutesToTime(act.endTime)}
            </Text>
            {act.type === 'Bình thường' && act.tittle && (
                <View style={styles.bulletList}>
                    {act.tittle.split('\n').map((line, i) => (
                        <Text key={i} style={styles.bulletItem}>
                            • {line.trim()}
                        </Text>
                    ))}
                </View>
            )}
        </View>
    );

    const timelineData = [...currentDay.activities]
        .sort((a, b) => a.startTime - b.startTime)
        .map((act) => {
            const { color, iconName, iconType } = getActivityProps(act);
            
            return {
                time: formatMinutesToTime(act.startTime),
                title: act.activityName, // Giữ lại title cơ bản (chỉ dùng cho renderDetail)
                description: act, // LƯU TOÀN BỘ ACT OBJECT VÀO DESCRIPTION
                color: color, // Đổi tên 'circleColor' thành 'color' cho Timeline
                lineColor: color, // Thêm lineColor (màu đường kẻ nối)
                icon: <Icon name={iconName} type={iconType} color="#fff" size={10} />,
                
            };
        });

<<<<<<< Updated upstream
    return (
        // BỌC TOÀN BỘ NỘI DUNG CÓ THỂ CUỘN TRONG ScrollView
        <ScrollView 
            style={styles.outerScrollView} 
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false} // Tắt thanh cuộn để gọn gàng hơn
        >
            <Card containerStyle={styles.cardContainer}>
                {/* HEADER KHÔNG CUỘN */}
                <View style={styles.header}>
                    <Button
                        icon={{ name: 'chevron-left', type: 'font-awesome', color: '#007AFF', size: 18 }}
                        buttonStyle={styles.navButton}
                        onPress={handlePrev}
                        disabled={currentIndex === 0}
                    />
                    <Text style={styles.headerText}>
                        **{currentDay.dayName}** - {dayjs(currentDay.date).format('DD/MM/YYYY')}
                    </Text>
                    <Button
                        icon={{ name: 'chevron-right', type: 'font-awesome', color: '#007AFF', size: 18 }}
                        buttonStyle={styles.navButton}
                        onPress={handleNext}
                        disabled={currentIndex === getDaysOfWeek.length - 1}
                    />
                </View>

                {/* NỘI DUNG TIMELINE */}
                <View style={styles.timelineWrapper}>
                    {timelineData.length === 0 ? (
                        <Text style={styles.holidayText}>🎉 Ngày nghỉ - Không có hoạt động</Text>
                    ) : (
                        <Timeline
                            data={timelineData}
                            timeContainerStyle={styles.timeContainer}
                            timeStyle={styles.timeText}
                            circleSize={24} // Tăng kích thước circle
                            innerCircle={'icon'} 
                            columnFormat='single-column-left'
                            lineColor='#E0E0E0' // Đổi màu đường line chính (nhạt hơn)
                            separator={false}
                            renderFullLine={false} 
                            style={styles.timelineStyle}
                            // QUAN TRỌNG: TẮT CUỘN NỘI BỘ VÀ RENDER TÙY CHỈNH
                            renderDetail={(rowData, sectionID, rowID) => {
                                const act = rowData.description as IActivity;
                                const color = rowData.color as string;
                                return renderDetailContent(act, color);
                            }}
                            options={{
                                scrollEnabled: false, // TẮT CUỘN CỦA FLATLIST BÊN TRONG TIMELINE
                                contentContainerStyle: styles.timelineContent,
                            } as FlatListProps<any>} 
                        />
                    )}
                </View>
            </Card>
        </ScrollView>
    );
=======
  return (
    <ScrollView
      style={styles.outerScrollView}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <Card containerStyle={styles.cardContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>
            {currentDay.dayName} - {dayjs(currentDay.date).format("DD/MM/YYYY")}
          </Text>
        </View>
        <View style={styles.timelineWrapper}>
          {timelineData?.length === 0 ? (
            <Text style={styles.holidayText}>
              🎉 Ngày nghỉ - Không có hoạt động
            </Text>
          ) : (
            <Timeline
              data={timelineData}
              timeContainerStyle={styles.timeContainer}
              timeStyle={styles.timeText}
              circleSize={24}
              innerCircle={"icon"}
              columnFormat="single-column-left"
              lineColor="#E0E0E0"
              separator={false}
              renderFullLine={false}
              style={styles.timelineStyle}
              renderDetail={(rowData, sectionID, rowID) => {
                const act = rowData.description as IActivity;
                const color = rowData.color as string;
                return renderDetailContent(act, color);
              }}
              options={
                {
                  scrollEnabled: false,
                  contentContainerStyle: styles.timelineContent,
                } as FlatListProps<any>
              }
            />
          )}
        </View>
      </Card>
    </ScrollView>
  );
>>>>>>> Stashed changes
};

const styles = StyleSheet.create({
    // SCROLLVIEW CHỈ ĐỊNH
    outerScrollView: {
        flex: 1, // Đảm bảo chiếm toàn bộ không gian
    },
    scrollViewContent: {
        flexGrow: 1, // Quan trọng: Cho phép nội dung cuộn nếu cần
    },

    // CARD CONTAINER BỎ MARGIN/PADDING để sử dụng padding của ScrollView hoặc view khác
    cardContainer: {
        marginHorizontal: 10, // Bổ sung margin
        marginVertical: 10,
        padding: 0,
        borderRadius: 12, // Góc bo tròn hơn
        overflow: 'hidden',
        borderWidth: 0, // Bỏ border mặc định
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },

    // HEADER - CÓ THAY ĐỔI NHỎ VỀ MÀU NỀN
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#FFFFFF', // Màu trắng cho header
    },
    headerText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
    },
    navButton: {
        backgroundColor: 'transparent',
        padding: 8,
    },

    // TIMELINE WRAPPER VÀ STYLE
    timelineWrapper: {
        // Bỏ minHeight/flex: 1 để ScrollView bao ngoài kiểm soát
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    timelineStyle: {
        paddingVertical: 10, // Giảm padding dọc
        minHeight: 1, // KHÔNG CÓ flex, KHÔNG CÓ height CỐ ĐỊNH.
    },
    timelineContent: {
        paddingBottom: 10, // Khoảng cách cuối cùng
    },
    timeContainer: {
        minWidth: 60, // Giảm chiều rộng cột thời gian
        marginTop: 0,
        paddingTop: 12, // Canh chỉnh thời gian với nội dung
    },
    timeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#000',
        textAlign: 'right',
    },

    // THIẾT KẾ MỚI: BỎ CARD CHO TỪNG HOẠT ĐỘNG, CHỈ DÙNG VIEW
    activityDetailView: {
        padding: 10,
        backgroundColor: '#f9f9f9', // Nền nhạt cho từng item
        borderRadius: 8,
        marginBottom: 15, // Khoảng cách giữa các sự kiện
        borderWidth: 1,
        borderColor: '#eee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
    },
    activityNameText: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    endTimeText: {
        fontSize: 12,
        color: '#6C757D',
        marginTop: 2,
        fontWeight: '500', // Giữ đậm cho chữ 'Kết thúc' trong component Text cũ
    },
    bulletList: {
        marginTop: 8,
        paddingLeft: 0,
    },
    bulletItem: {
        fontSize: 13,
        color: 'rgba(0, 0, 0, 0.7)',
        lineHeight: 20,
    },

    // STYLE KHÁC GIỮ NGUYÊN
    holidayText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6C757D',
        padding: 50,
    },
    emptyContainer: {
        padding: 50,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 10,
        color: '#909090',
    },
});

export default TimetableDayView;