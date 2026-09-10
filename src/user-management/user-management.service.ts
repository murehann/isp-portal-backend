import { BadRequestException, Injectable } from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';
import {
  CreateAdminDto,
  CreateCustomerDto,
  CreateEmployeeDto,
  InitializeCustomerDto,
} from './dto';
import { AdminService } from 'src/admin/admin.service';
import { EmployeeService } from 'src/employee/employee.service';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UserRolesService } from 'src/user-roles/user-roles.service';
import { UserRole } from 'src/user-roles/entities/user-role.entity';
import { AuthenticatedRequest } from 'src/common/Types';

@Injectable()
export class UserManagementService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly adminService: AdminService,
    private readonly employeeService: EmployeeService,
    private readonly usersService: UsersService,
    private readonly userRolesService: UserRolesService,
  ) {}

  async createCustomer(dto: CreateCustomerDto, req: AuthenticatedRequest) {
    const managedById = await this.validateManager({
      dtoManagerId: dto.managedById,
      authenticatedUserCurrentRoleCode: req.user.currentRoleCode,
      authenticatedUserId: req.user.sub,
    });
    return this.customersService.createCustomer({
      ...dto,
      managedById,
    });
  }

  createAdmin(dto: CreateAdminDto, req: AuthenticatedRequest) {
    // putting directly the authenticated user's id as only a super admin can manage an admin and this service is only accessible to SUPER_ADMIN
    const managedById = req.user.sub;
    return this.adminService.create({ ...dto, managedById });
  }

  async createEmployee(dto: CreateEmployeeDto, req: AuthenticatedRequest) {
    const managedById = await this.validateManager({
      dtoManagerId: dto.managedById,
      authenticatedUserCurrentRoleCode: req.user.currentRoleCode,
      authenticatedUserId: req.user.sub,
    });

    return this.employeeService.createEmployee({
      ...dto,
      managedById,
    });
  }

  updateUser(userId: number, dto: UpdateUserDto) {
    return this.usersService.update(userId, dto);
  }

  initializeCustomer(userId: number, dto: InitializeCustomerDto) {
    return this.customersService.initializeCustomer(userId, dto);
  }

  initializeAdmin(userId: number) {
    return this.adminService.initializeAdmin(userId);
  }

  /*
     --------------------------- HELPER FUNCTIONS ---------------------------
  */
  async validateManager(params: {
    authenticatedUserId: number;
    dtoManagerId: number | undefined;
    authenticatedUserCurrentRoleCode: string;
  }): Promise<number> {
    const {
      authenticatedUserId,
      authenticatedUserCurrentRoleCode,
      dtoManagerId,
    } = params;
    let managedById = authenticatedUserId;

    if (
      authenticatedUserCurrentRoleCode === 'SUPER_ADMIN' &&
      dtoManagerId !== undefined
    ) {
      const managerUserRoles =
        await this.userRolesService.findByUserId(dtoManagerId);
      const managerRoleCodes = managerUserRoles.map(
        (userRole: UserRole) => userRole.role.code,
      );

      const isValidManager =
        managerRoleCodes.includes('SUPER_ADMIN') ||
        managerRoleCodes.includes('ADMIN');

      if (!isValidManager)
        throw new BadRequestException(
          'Manager must be an "ADMIN" or "SUPER_ADMIN"',
        );

      managedById = dtoManagerId;
    }
    return managedById;
  }
}
