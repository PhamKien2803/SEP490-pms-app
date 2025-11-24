export interface IFileInfo {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
}

export interface IStudent {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  birthCertId: string;
  healthCertId: string;
  healthCertFile: IFileInfo | null;
  birthCertFile: IFileInfo | null;
  guardianToday?: IGuardian | null;
  imageStudent: string;
}

export interface IRoomFacility {
  facilityName: string;
  facilityType: string;
  quantity: number;
  quantityDefect: number;
  quantityMissing: number;
  notes: string;
}

export interface IRoom {
  _id: string;
  roomName: string;
  facilities: IRoomFacility[];
}

export interface IClassSchoolYear {
  _id: string;
  schoolYear: string;
  state: string;
}

export interface IClassInfo {
  _id: string;
  classCode: string;
  className: string;
  students: IStudent[];
  teachers: string[];
  room: IRoom;
  schoolYear: IClassSchoolYear;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  age: string;
}

interface ITeacherInfo {
  _id: string;
  fullName: string;
  email: string;
}

interface ISchoolYearInfo {
  _id: string;
  schoolYear: string;
  startDate: string;
  endDate: string;
}

export interface ITeacherClassStudentResponse {
  teacher: ITeacherInfo;
  schoolYear: ISchoolYearInfo;
  classes: IClassInfo[];
}

export interface IFileInfo {
  _id: string;
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
}

export interface IStudent {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  birthCertId: string;
  healthCertId: string;
  healthCertFile: IFileInfo | null;
  birthCertFile: IFileInfo | null;
}

export interface IRoomFacility {
  facilityName: string;
  facilityType: string;
  quantity: number;
  quantityDefect: number;
  quantityMissing: number;
  notes: string;
}

export interface IRoom {
  _id: string;
  roomName: string;
  facilities: IRoomFacility[];
}

export interface IClassSchoolYear {
  _id: string;
  schoolYear: string;
  state: string;
}

export interface IClassInfo {
  _id: string;
  classCode: string;
  className: string;
  students: IStudent[];
  teachers: string[];
  room: IRoom;
  schoolYear: IClassSchoolYear;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  age: string;
}

export interface ITeacherClassStudentResponse {
  teacher: ITeacherInfo;
  schoolYear: ISchoolYearInfo;
  classes: IClassInfo[];
}

//==============================ATTENDANCE=============================

export interface IAttendanceStudentPayload {
  student: string;
  status: "Có mặt" | "Đã đón trẻ" | "Vắng mặt";
  note?: string;
  noteCheckout?: string;
  timeCheckIn?: string | null;
  timeCheckOut?: string | null;
  guardian?: string | null;
}

export interface IGuardian {
  _id: string;
  fullName: string;
  dob: string;
  phoneNumber: string;
  relationship: string;
  pickUpDate: string;
}


export interface IAttendanceCreatePayload {
  class: string;
  schoolYear: string;
  date: string;
  students: IAttendanceStudentPayload[];
  takenBy: string;
  generalNote?: string;
}

export interface IAttendanceUpdatePayload {
  class: string;
  schoolYear: string;
  date: string;
  students: IAttendanceStudentPayload[];
  takenBy: string;
  generalNote?: string;
}


export interface IAttendanceDetailResponse {
  _id: string;
  class: {
    _id: string;
    classCode: string;
    className: string;
  };
  schoolYear: {
    _id: string;
    schoolyearCode: string;
    schoolYear: string;
  };
  date: string;
  students: {
    student: {
      _id: string;
      studentCode: string;
      fullName: string;
      dob: string;
      gender: string;
      address: string;
      classGroup?: string;
      imageStudent: string;
    };
    status: string;
    note?: string;
    noteCheckout?: string;
    timeCheckIn?: string | null;
    timeCheckOut?: string | null;
    guardian?: {
      _id: string;
      fullName: string;
      dob: string;
      phoneNumber: string;
      relationship: string;
      pickUpDate: string;
    } | null;
  }[];
  takenBy: {
    _id: string;
    staffCode: string;
    fullName: string;
    email: string;
  };
  generalNote?: string;
  takenAt: string;

}



export type IAttendanceListResponse = IAttendanceDetailResponse[];

export interface IPaginatedResponse<T> {
  data: T;
  total: number;
  // Add other potential fields like page, limit if your API returns them
}

export interface StudentDetailResponse {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  idCard: string;
  gender: string;
  address: string;
  nation: string;
  religion: string;
  birthCertId: string;
  healthCertId: string;
  classGroup: string;
  active: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  healthCertFile: {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
  };
  birthCertFile: {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
  };
  imageStudent: string;
}

// ==============================FEEDBACK======================
// --- Các Interface con cho dữ liệu Feedback ---

export interface IFeedbackEating {
  breakfast: string;
  lunch: string;
  snack: string;
  note: string;
}

export interface IFeedbackSleeping {
  duration: string;
  quality: string;
  note: string;
}

export interface IFeedbackHygiene {
  toilet: string;
  handwash: string;
  note: string;
}

export interface IFeedbackLearning {
  focus: string;
  participation: string;
  note: string;
}

export interface IFeedbackSocial {
  friendInteraction: string;
  emotionalState: string;
  behavior: string;
  note: string;
}

export interface IFeedbackHealth {
  note: string;
}

// --- Interface cho Payload (Body request) ---

/**
 * Dữ liệu cơ bản để tạo hoặc cập nhật feedback, không bao gồm ID.
 */
export interface IFeedbackBasePayload {
  eating: IFeedbackEating;
  sleeping: IFeedbackSleeping;
  hygiene: IFeedbackHygiene;
  learning: IFeedbackLearning;
  social: IFeedbackSocial;
  health: IFeedbackHealth;
  dailyHighlight: string;
  teacherNote: string;
  reminders: string[];
}

/**
 * Payload cho API CREATE_FEEDBACK (tạo cho nhiều học sinh).
 */
export interface IFeedbackCreatePayload extends IFeedbackBasePayload {
  students: string[]; // Mảng các studentId
  classId: string;
  teacherId: string;
  date: string; // "YYYY-MM-DDTHH:mm:ss.sssZ"
}

/**
 * Payload cho API UPDATE_FEED_BACK (cập nhật cho 1 học sinh).
 * Lưu ý: key là "students" nhưng giá trị là một string ID (dựa theo mẫu của bạn).
 */
export interface IFeedbackUpdatePayload extends IFeedbackBasePayload {
  students: string; // Một studentId
  classId: string;
  teacherId: string;
  date: string; // "YYYY-MM-DDTHH:mm:ss.sssZ"
}

// --- Interface cho Dữ liệu Response ---

/**
 * Dữ liệu cơ bản của một bản ghi feedback.
 */
interface IFeedbackBaseRecord extends IFeedbackBasePayload {
  _id: string;
  id: string;
  teacherId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

/**
 * Dữ liệu chi tiết cho một học sinh (dùng trong list response).
 */
export interface IPopulatedStudent {
  _id: string;
  studentCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  healthCertId: string;
  imageStudent: string;
}

/**
 * Dữ liệu chi tiết cho một lớp học (dùng trong list response).
 */
export interface IPopulatedClass {
  _id: string;
  classCode: string;
  className: string;
}

/**
 * Kiểu dữ liệu cho MỘT item trong danh sách response
 * (GET_FEEDBACK_BY_CLASS_AND_DATE).
 * Thông tin studentId và classId đã được populate.
 */
export interface IFeedbackListItem extends IFeedbackBaseRecord {
  studentId: IPopulatedStudent;
  classId: IPopulatedClass;
}

/**
 * Kiểu dữ liệu cho response của API GET_FEEDBACK_BY_CLASS_AND_DATE.
 */
export type IFeedbackListResponse = IFeedbackListItem[];

/**
 * Kiểu dữ liệu cho response của API GET_FEEDBACK_BY_ID.
 * Thông tin studentId và classId CHƯA được populate (chỉ là ID).
 */
export interface IFeedbackDetailResponse extends IFeedbackBaseRecord {
  studentId: string;
  classId: string;
}

// Kiểu dữ liệu cho response của GET_LIST_LESSON
export interface ILessonListItem {
  _id: string;
  className: string;
  schoolYear: string;
  month: number;
  weekNumber: number;
  status: string;
}

export interface IPagination {
  totalCount: number;
  limit: number;
  page: number;
}

export interface ILessonListResponse {
  data: ILessonListItem[];
  page: IPagination;
}

// Kiểu dữ liệu cho response của GET_SCHEDULE_WEEK
export interface IActivity {
  activity: string;
  activityCode?: string;
  activityName?: string;
  type?: string;
  category?: string;
  startTime: number;
  endTime: number;
  tittle: string;
}

export interface IScheduleDay {
  date: string; // ISO date string
  dayName: string;
  activities: IActivity[];
  isHoliday: boolean;
  notes: string;
  _id: string;
}

export interface IScheduleWeekResponse {
  classId: string;
  schoolYearId: string;
  month: number;
  week: number;
  topic: string;
  scheduleDays: IScheduleDay[];
}

export interface IActivityPayload {
  activity: string;
  activityCode: string;
  activityName: string;
  type: string;
  startTime: number;
  endTime: number;
  tittle: string;
}

export interface IScheduleDayPayload {
  date: string; // ISO Date String
  dayName: string;
  isHoliday: boolean;
  notes: string;
  activities: IActivityPayload[];
}

export interface ILessonPayload {
  // activity: string;
  classId: string;
  schoolYearId: string;
  class: string;
  schoolYear: string;
  month: number;
  weekNumber: number;
  topicName?: string;
  scheduleDays: IScheduleDayPayload[];
}

export interface IScheduleDay {
  date: string;
  dayName: string;
  isHoliday: boolean;
  notes: string;
  activities: IActivity[];
}

export interface ILessonDetailResponse {
  _id: string;
  schoolYearId: string;
  classId: string;
  className: string;
  schoolYear: string;
  status: string;
  topicName: string;
  month: number;
  weekNumber: number;
  scheduleDays: IScheduleDay[];
}

export interface IGetTimetableTeacherResponse {
  _id: string;
  classId: string;
  classCode: string;
  className: string;
  schoolYearId: string;
  schoolYear: string;
  month: number;
  scheduleDays: {
    _id: string;
    date: string;
    dayName: string;
    activities: {
      activity: string;
      activityCode: string;
      activityName: string;
      type: string;
      startTime: number;
      endTime: number;
      tittle: string;
    }[];
  }[];
}
