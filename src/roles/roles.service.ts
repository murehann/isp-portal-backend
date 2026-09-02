import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}
  getAll() {
    return this.rolesRepository.find();
  }

  createRole(role: CreateRoleDto): Promise<Role> {
    const newRole = this.rolesRepository.create(role);
    return this.rolesRepository.save(newRole);
  }

  findById(id: number): Promise<Role | null> {
    return this.rolesRepository.findOneBy({
      id,
    });
  }
}
