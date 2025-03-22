import { CanActivate, ExecutionContext, ForbiddenException, mixin, Type } from '@nestjs/common';
import { Admin } from '../../admins/admin.entity';

const AdminRoleGuard = (): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (user == undefined && !(user instanceof Admin))
        throw new ForbiddenException();

      return true;
    }
  }

  return mixin(RoleGuardMixin);
}

export default AdminRoleGuard;
