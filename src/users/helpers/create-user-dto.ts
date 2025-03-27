export class CreateUserDto {
    phone: string;
    password: string;
    role: UserRole;
    lat: string;
    long: string;
    idVerification: string;
}

export enum UserRole {
    VOTER = 'VOTER',
    REPRESENTATIVE = 'REPRESENTATIVE'
}

export enum UserStatus {
    VERIFIED = 'VERIFIED',
    SUSPENDED = 'SUSPENDED',
    WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL'
}