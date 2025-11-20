import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  Dimensions,
  ViewStyle,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { height: screenHeight } = Dimensions.get("window");

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  data: SelectOption[];
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

const DROPDOWN_MAX_HEIGHT = 200;
const ITEM_HEIGHT = 45;

const CustomSelect: React.FC<CustomSelectProps> = ({
  data,
  selectedValue,
  onValueChange,
  placeholder = "Chọn một mục",
  disabled = false,
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });
  const buttonRef = useRef<any>(null);
  const selectedItem = useMemo(
    () => data.find((item) => item.value === selectedValue),
    [data, selectedValue]
  );

  const toggleDropdown = () => {
    if (disabled) return;

    buttonRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        const dropdownContentHeight = Math.min(
          DROPDOWN_MAX_HEIGHT,
          data.length * ITEM_HEIGHT
        );

        const isBelowScreen =
          y + height + dropdownContentHeight + 10 > screenHeight;

        setDropdownPosition({
          top: isBelowScreen ? y - dropdownContentHeight : y + height,
          left: x,
          width: width,
        });
        setModalVisible((prev) => !prev);
      }
    );
  };

  const handleSelect = (item: SelectOption) => {
    onValueChange(item.value);
    setModalVisible(false);
  };

  const renderOption = ({ item }: { item: SelectOption }) => (
    <Pressable
      style={[
        styles.itemContainer,
        item.value === selectedValue && styles.itemContainerSelected,
      ]}
      onPress={() => handleSelect(item)}
      key={item.value}
    >
      <Text
        style={[
          styles.itemText,
          item.value === selectedValue && styles.selectedItemText,
        ]}
        numberOfLines={1}
      >
        {item.label}
      </Text>
      {item.value === selectedValue && (
        <Icon name="check-bold" size={18} color="#1890ff" />
      )}
    </Pressable>
  );

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        ref={buttonRef}
        onPress={toggleDropdown}
        onLayout={() => {}}
        style={[
          styles.button,
          disabled && styles.disabledButton,
          modalVisible && styles.buttonActive,
          !selectedItem && styles.placeholderButton,
        ]}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={[styles.buttonText, !selectedItem && styles.placeholderText]}
          numberOfLines={1}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon
          name={modalVisible ? "chevron-up" : "chevron-down"}
          size={20}
          color={disabled ? "#aaa" : "#333"}
        />
      </TouchableOpacity>

      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.absoluteOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            style={[
              styles.dropdownView,
              {
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                width: dropdownPosition.width,
              },
            ]}
          >
            <FlatList
              data={data}
              keyExtractor={(item) => item.value}
              renderItem={renderOption}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: DROPDOWN_MAX_HEIGHT }}
              ListEmptyComponent={() => (
                <Text style={styles.emptyText}>Không có dữ liệu.</Text>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1000,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    zIndex: 1001,
  },
  buttonActive: {
    borderColor: "#1890ff",
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  disabledButton: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e0e0e0",
  },
  placeholderButton: {
    borderColor: "#ccc",
  },
  buttonText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: "#888",
  },
  absoluteOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1002,
  },
  dropdownView: {
    position: "absolute",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#1890ff",
    borderTopWidth: 0,

    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: ITEM_HEIGHT,
    backgroundColor: "white",
  },
  itemContainerSelected: {
    backgroundColor: "#e6f7ff",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  selectedItemText: {
    fontWeight: "bold",
    color: "#1890ff",
  },
  emptyText: {
    padding: 20,
    textAlign: "center",
    color: "#888",
  },
});

export default CustomSelect;
