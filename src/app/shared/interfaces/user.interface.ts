import { Role } from '../enums/role.enum';

export interface User {
    _id: string;
    name: string;
    role: Role;
}
