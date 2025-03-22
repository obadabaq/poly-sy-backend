import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AuthGuard } from '@nestjs/passport';
import AdminRoleGuard from './helpers/admin.roles.guard';

@UseGuards(AuthGuard('jwt'), AdminRoleGuard())
@Controller('admins')
export class AdminsController {
    constructor(private adminsService: AdminsService) { }

    @Get('')
    getAdmins() {
        return this.adminsService.getAdmins();;
    }
}
