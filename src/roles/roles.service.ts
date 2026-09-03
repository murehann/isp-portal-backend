import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private rolesRepository: Repository<Role>,
  ) {}
  getAll() {
    return this.rolesRepository.find();
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      return await this.rolesRepository.save(
        this.rolesRepository.create(createRoleDto),
      );
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(
          `Role with code "${createRoleDto.code}" already exists`,
        );
      }
      throw error;
    }
  }

  findById(id: number): Promise<Role | null> {
    return this.rolesRepository.findOneBy({
      id,
    });
  }
}
