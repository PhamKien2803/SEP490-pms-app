export interface CreatePostParams {
  classId: string;
  teacherId: string;
  title: string;
  content: string;
  createdBy?: string;
  active?: boolean;
}

export interface CreatePostResponse {
  classId: string;
  teacherId: string;
  title: string;
  content: string;
  createdBy?: string;
  active?: boolean;
  _id: string;
}

export interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
  students: string[];
  teachers: string[];
  room: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  schoolYear: string;
  age: string;
}

export interface ClassData {
  classes: ClassInfo;
}

export interface PostsResponse {
  count: number;
  studentId?: string;
  posts: Post[];
}

export interface Post {
  postId: string;
  title: string;
  content: string;
  createdBy: string;
  teacher: Teacher;
  class: ClassInfo;
  files: FileInfo[];
  createdAt: string;
}

export interface Teacher {
  _id: string;
  staffCode: string;
  fullName: string;
  email: string;
}

export interface ClassInfo {
  _id: string;
  classCode: string;
  className: string;
  teachers: string[];
  room: string;
  age: string;
}

export interface FileInfo {
  _id: string;
  fileUrl: string;
  fileType: "image" | "video" | "document";
  fileSize: number;
  cloudinaryPublicId: string;
  createdAt: string;
}
