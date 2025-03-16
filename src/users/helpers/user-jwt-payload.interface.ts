import { UserRole } from "./create-user-dto";

export class UserJwtPayload {
    phone: string;
    password: string;
    role: UserRole;
}