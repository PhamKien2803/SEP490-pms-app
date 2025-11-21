import { IFeedbackBasePayload } from "../types/teacher";

export const constants = {
  TOKEN: "token",
  BEARER: "Bearer",
  ACCOUNT_INFOR: "account-infor",
  ACCOUNT: "account",

  // method api
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",

  REQUEST_FAILED: "Request failed",
  REQUEST_SUCCESS: "Request success",
  AN_UNKNOWN_ERROR_OCCURRED: "An unknown error occurred",
  SOMETHING_WENT_WRONG: "Something went wrong",
  RETRY: "Retry",
  APP_PREFIX: "/pms",
};

const hardcodedActions = [
  { label: "Xem", value: "view" },
  { label: "Tạo", value: "create" },
  { label: "Sửa", value: "update" },
  { label: "Xóa", value: "delete" },
  { label: "Duyệt đơn", value: "approve" },
  { label: "Xuất file", value: "export" },
  { label: "Nhập file", value: "import" },
  { label: "Từ chối", value: "reject" },
  { label: "Duyệt tất cả", value: "approve_all" },
  { label: "Đồng bộ dữ liệu", value: "sync_data" },
  { label: "Khóa", value: "lock" },
  { label: "Mở khóa", value: "un_lock" },
  { label: "Xác nhận", value: "confirm" },
];

const ageOptions = [
  { value: 1, label: "1 tuổi" },
  { value: 2, label: "2 tuổi" },
  { value: 3, label: "3 tuổi" },
  { value: 4, label: "4 tuổi" },
  { value: 5, label: "5 tuổi" },
];

const toOptions = (arr: string[]) =>
  arr.map((item) => ({
    label:
      item === "" ? "(Trống)" : item.charAt(0).toUpperCase() + item.slice(1),
    value: item,
  }));

const categoryOptions = [
  "Phát triển thể chất",
  "Phát triển nhận thức",
  "Phát triển ngôn ngữ",
  "Phát triển tình cảm",
  "Phát triển thẩm mỹ",
  "Phát triển kỹ năng xã hội",
  "Hoạt động sự kiện",
];

const EATING_OPTIONS = toOptions([
  "hết",
  "gần hết",
  "một nửa",
  "ít",
  "không ăn",
  "",
]);
const SLEEP_QUALITY_OPTIONS = toOptions([
  "ngủ sâu",
  "tốt",
  "nhẹ",
  "không yên",
  "khó ngủ",
  "",
]);
const TOILET_OPTIONS = toOptions([
  "tự lập",
  "nhắc nhở",
  "cần giúp",
  "bị sự cố",
  "",
]);
const HANDWASH_OPTIONS = toOptions(["tốt", "nhắc nhở", "cần giúp", ""]);
const FOCUS_OPTIONS = toOptions([
  "xuất sắc",
  "tốt",
  "trung bình",
  "cần cố gắng",
  "",
]);
const PARTICIPATION_OPTIONS = toOptions([
  "tích cực",
  "tốt",
  "rụt rè",
  "miễn cưỡng",
  "",
]);
const INTERACTION_OPTIONS = toOptions([
  "xuất sắc",
  "tốt",
  "trung bình",
  "xung đột",
  "rụt rè",
  "",
]);
const EMOTION_OPTIONS = toOptions([
  "ổn định",
  "thay đổi thất thường",
  "lo lắng",
  "buồn",
  "vui vẻ",
  "",
]);
const BEHAVIOR_OPTIONS = toOptions([
  "xuất sắc",
  "tốt",
  "trung bình",
  "khó bảo",
  "",
]);

const SLEEP_DURATION_OPTIONS = [
  { value: "60 phút" },
  { value: "90 phút" },
  { value: "120 phút" },
  { value: "150 phút" },
];

const GOOD_FEEDBACK_TEMPLATE: Partial<IFeedbackBasePayload> = {
  eating: {
    breakfast: "hết",
    lunch: "hết",
    snack: "hết",
    note: "Con ăn ngoan, tự xúc ăn giỏi.",
  },
  sleeping: {
    duration: "120 phút",
    quality: "ngủ sâu",
    note: "Con ngủ ngoan, không giật mình.",
  },
  hygiene: {
    toilet: "tự lập",
    handwash: "tốt",
    note: "Vệ sinh sạch sẽ.",
  },
  learning: {
    focus: "tốt",
    participation: "tích cực",
    note: "Con hiểu bài nhanh, hăng hái phát biểu.",
  },
  social: {
    friendInteraction: "tốt",
    emotionalState: "vui vẻ",
    behavior: "tốt",
    note: "Con chơi hòa đồng, biết chia sẻ đồ chơi.",
  },
  health: {
    note: "Sức khỏe tốt, bình thường.",
  },
  dailyHighlight: "Hăng hái phát biểu trong giờ học.",
  teacherNote: "Con hôm nay rất ngoan, tiến bộ nhiều.",
  reminders: [],
};

const BANK_OPTIONS = [
  {
    label: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    value: "Vietcombank",
  },
  {
    label: "Ngân hàng TMCP Kỹ thương Việt Nam (Techcombank)",
    value: "Techcombank",
  },
  {
    label: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    value: "BIDV",
  },
  {
    label: "Ngân hàng TMCP Công thương Việt Nam (VietinBank)",
    value: "VietinBank",
  },
  { label: "Ngân hàng TMCP Quân đội (MB Bank)", value: "MB Bank" },
  { label: "Ngân hàng TMCP Á Châu (ACB)", value: "ACB" },
  {
    label: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)",
    value: "Sacombank",
  },
  { label: "Ngân hàng TMCP Tiên Phong (TPBank)", value: "TPBank" },
  { label: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)", value: "VPBank" },
  { label: "Ngân hàng TMCP Phát triển Nhà TP.HCM (HDBank)", value: "HDBank" },
  { label: "Ngân hàng TMCP Đông Nam Á (SeABank)", value: "SeABank" },
  {
    label: "Ngân hàng TMCP Xuất nhập khẩu Việt Nam (Eximbank)",
    value: "Eximbank",
  },
  { label: "Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)", value: "SHB" },
  { label: "Ngân hàng TMCP Phương Đông (OCB)", value: "OCB" },
  { label: "Ngân hàng TMCP Quốc tế Việt Nam (VIB)", value: "VIB" },
  { label: "Ngân hàng TMCP Đông Á (DongA Bank)", value: "DongA Bank" },
];

export const ETHNIC_OPTIONS = [
  "Kinh",
  "Tày",
  "Thái",
  "Hoa",
  "Khmer",
  "Mường",
  "Nùng",
  "H'Mông",
  "Dao",
  "Gia Rai",
  "Ê Đê",
  "Ba Na",
  "Chăm",
  "Sán Chay",
  "Cơ Ho",
  "Xê Đăng",
  "Sán Dìu",
  "Hrê",
  "Ra Glai",
  "Mnông",
  "Thổ",
  "Stiêng",
  "Khơ Mú",
  "Bru - Vân Kiều",
  "Cơ Tu",
  "Giáy",
  "Tà Ôi",
  "Mạ",
  "Co",
  "Chơ Ro",
  "Xinh Mun",
  "Hà Nhì",
  "Chu Ru",
  "Lào",
  "La Chí",
  "La Ha",
  "Phù Lá",
  "La Hủ",
  "Kháng",
  "Lự",
  "Lô Lô",
  "Chứt",
  "Mảng",
  "Pà Thẻn",
  "Co Lao",
  "Cống",
  "Bố Y",
  "Si La",
  "Pu Péo",
  "Brâu",
  "Ơ Đu",
  "Rơ Măm",
];

export {
  hardcodedActions,
  ageOptions,
  categoryOptions,
  EATING_OPTIONS,
  SLEEP_QUALITY_OPTIONS,
  TOILET_OPTIONS,
  HANDWASH_OPTIONS,
  FOCUS_OPTIONS,
  PARTICIPATION_OPTIONS,
  INTERACTION_OPTIONS,
  EMOTION_OPTIONS,
  BEHAVIOR_OPTIONS,
  SLEEP_DURATION_OPTIONS,
  GOOD_FEEDBACK_TEMPLATE,
  BANK_OPTIONS,
};
