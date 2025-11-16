export interface SchoolYearListItem {
    _id: string;
    schoolyearCode: string;
    startDate: string;
    endDate: string;
    numberTarget: number;
    state: string;
    active: boolean;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    serviceStartTime: string;
    serviceEndTime: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    schoolYear: string;
}

export interface SchoolYearsListResponse {
    data: SchoolYearListItem[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface CreateSchoolYearDto {
    startDate: string;
    endDate: string;
    numberTarget: number;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    serviceStartTime: string;
    serviceEndTime: string;
    createdBy: string;
}

export interface UpdateSchoolYearDto {
    startDate?: string;
    endDate?: string;
    numberTarget?: number;
    enrollmentStartDate: string;
    enrollmentEndDate: string;
    serviceStartTime: string;
    serviceEndTime: string;
    createdBy?: string;
}

interface EnrollmentFile {
    _id: string;
    length: number;
    chunkSize: number;
    uploadDate: string;
    filename: string;
}

export interface SchoolYearReportResponses {
    data: SchoolYearReport[];
    page: {
        totalCount: number;
        limit: number;
        page: number;
    };
}

export interface SchoolYearReport {
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
    birthCertFiles: EnrollmentFile;
    healthCertFiles: EnrollmentFile;
    active: boolean;
    createdBy: string;
    updatedBy: string;
    createdAt: string;
    updatedAt: string;
    graduated: boolean;
    graduatedAt: string;
}