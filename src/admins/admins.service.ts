import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminRepository } from './admin.repository';

@Injectable()
export class AdminsService {
    constructor(
        @InjectRepository(AdminRepository)
        private readonly adminRepository: AdminRepository
    ) { }

    async getAdmins() {
        let query = this.adminRepository.createQueryBuilder('Admin');
        let found = await query.getMany();

        return found;
    }
}
