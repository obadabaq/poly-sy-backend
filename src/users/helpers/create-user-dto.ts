export class CreateUserDto {
    phone: string;
    name: string;
    password: string;
    role: UserRole;
    lat: string;
    long: string;
    city: string;
    area: string;
    cityEn: string;
    areaEn: string;
    idVerification: string;
    intro: string;
    about: string;
    defaultArea: string;
    defaultAreaEn: string;

    constructor(
        phone: string,
        name: string,
        password: string,
        role: UserRole,
        city: string,
        area: string,
        areaEn: string,
    ) {
        this.phone = phone;
        this.name = name;
        this.password = password;
        this.role = role;
        this.city = city;
        this.area = area;
        this.areaEn = areaEn;
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