import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entities/Package.entity';
import { EntityManager, Repository } from 'typeorm';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
  ) {}

  async createPackage(createPackageDto: CreatePackageDto) {
    try {
      return await this.packagesRepository.save(
        this.packagesRepository.create(createPackageDto),
      );
    } catch (error: unknown) {
      if (isDuplicateKeyError(error)) {
        throw new ConflictException(`Package already exists!`);
      }
      throw error;
    }
  }

  async findById(packageId: number, manager?: EntityManager) {
    const packagesRepository = manager
      ? manager.getRepository(Package)
      : this.packagesRepository;
    return packagesRepository.findOneBy({
      id: packageId,
    });
  }

  getAll() {
    return this.packagesRepository.find();
  }
}
