export class CreateUserDto {
    phone: string;
    name: string;
    password: string;
    role: UserRole;
    lat: string;
    long: string;
    city: string;
    area: string;
    idVerification: string;
    bio: string;
    about: string;

    constructor(
        phone: string,
        name: string,
        password: string,
        role: UserRole,
        city: string,
        area: string,
    ) {
        this.phone = phone;
        this.name = name;
        this.password = password;
        this.role = role;
        this.city = city;
        this.area = area;
    }
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