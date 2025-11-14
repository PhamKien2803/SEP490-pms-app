
export type User = {
    id: string;
    name: string;
    email: string;
    fullName: string;
    status: AccountStatus;
    role: Role;
    branch: string;
    permissions: string[];
    students: {
        _id: string;
        studentCode: string;
        fullName: string;
        dob: string;
        idCard: string;
        gender: string;
        nation: string;
        religion: string;
    }[];
};

export type Student = {
    _id: string;
    studentCode: string;
    fullName: string;
    dob: string;
    idCard: string;
    gender: string;
    nation: string;
    religion: string;
};

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum Role {
    Administrator = 'Administrator',
    Accountant = 'Accountant',
    Teacher = 'Teacher',
    Parent = 'Parent',
    Administrative_staff = 'Administrative staff',
}


