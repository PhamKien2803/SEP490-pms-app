import React, { useState } from "react";
import { View, StyleSheet, Text, ScrollView, Platform } from "react-native";
import { Card, Button, Icon } from "@rneui/themed";
import dayjs from "dayjs";
import Timeline from "react-native-timeline-flatlist";
import type { FlatListProps } from "react-native";

interface IActivity {
  _id: string;
  activityName: string;
  type: "Cố định" | "Bình thường" | "Sự kiện" | string;
  startTime: number;
  endTime: number;
  tittle?: string;
}

const formatMinutesToTime = (minutes?: number | null): string => {
  if (minutes == null || isNaN(minutes)) return "--:--";
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

const getActivityProps = (activity: IActivity) => {
  let color: string;
  let iconName: string;
  let iconType: "antdesign" | "font-awesome" | "material" | "font-awesome-5" =
    "font-awesome";

  if (activity.type === "Cố định") {
    color = "#007AFF";
    iconName = "lock1";
    iconType = "antdesign";
  } else if (activity.type === "Bình thường") {
    color = "#28A745";
    iconName = "edit";
    iconType = "antdesign";
  } else if (activity.type === "Sự kiện") {
    color = "#FFC107";
    iconName = "bulb1";
    iconType = "antdesign";
  } else {
    color = "#6C757D";
    iconName = "calendar";
    iconType = "font-awesome";
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
  getDaysOfWeek: any[];
}

const TimetableDayView: React.FC<Props> = ({ getDaysOfWeek }) => {
  const today = dayjs();
  const defaultIndex = getDaysOfWeek.findIndex((d) =>
    today.isSame(dayjs(d.date), "day")
  );
  const [currentIndex, setCurrentIndex] = useState(
    defaultIndex >= 0 ? defaultIndex : 0
  );
  const currentDay = getDaysOfWeek[currentIndex];

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < getDaysOfWeek.length - 1)
      setCurrentIndex(currentIndex + 1);
  };

  if (!currentDay) {
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="calendar-times-o"
          type="font-awesome"
          color="#909090"
          size={50}
        />
        <Text style={styles.emptyText}>Không có dữ liệu</Text>
      </View>
    );
  }

  const renderDetailContent = (act: IActivity, color: string) => (
    <View style={styles.activityDetailView}>
      <Text style={[styles.activityNameText, { color: color }]}>
        {act.activityName}
      </Text>
      <Text style={styles.endTimeText}>
        Kết thúc: {formatMinutesToTime(act.endTime)}
      </Text>
      {act.type === "Bình thường" && act.tittle && (
        <View style={styles.bulletList}>
          {act.tittle.split("\n").map((line, i) => (
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
        title: act.activityName,
        description: act,
        color: color,
        lineColor: color,
        icon: (
          <Icon name={iconName} type={iconType as any} color="#fff" size={10} />
        ),
      };
    });

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
          {timelineData.length === 0 ? (
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
};

const styles = StyleSheet.create({
  outerScrollView: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
  },

  cardContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    padding: 0,
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#FFFFFF",
  },
  headerText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    flexShrink: 1,
    textAlign: "center",
  },
  navButton: {
    backgroundColor: "transparent",
    padding: 8,
  },
  disabledNavContainer: {
    opacity: 0.5,
  },

  timelineWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  timelineStyle: {
    paddingVertical: 10,
    minHeight: 1,
  },
  timelineContent: {
    paddingBottom: 10,
  },
  timeContainer: {
    minWidth: 60,
    marginTop: 0,
    paddingTop: 10,
  },
  timeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    textAlign: "right",
  },

  activityDetailView: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#eee",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  activityNameText: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  endTimeText: {
    fontSize: 12,
    color: "#6C757D",
    marginTop: 2,
    fontWeight: "500",
  },
  bulletList: {
    marginTop: 8,
    paddingLeft: 5,
  },
  bulletItem: {
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.7)",
    lineHeight: 20,
  },

  holidayText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6C757D",
    padding: 50,
  },
  emptyContainer: {
    padding: 50,
    alignItems: "center",
    flex: 1,
  },
  emptyText: {
    marginTop: 10,
    color: "#909090",
  },
});

export default TimetableDayView;
