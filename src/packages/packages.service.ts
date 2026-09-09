import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Package } from './entities/Package.entity';
import { EntityManager, DataSource, Repository } from 'typeorm';
import { isDuplicateKeyError } from 'src/common/database/is-duplicate-key-error';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async createPackage(createPackageDto: CreatePackageDto) {
    return this.dataSource.transaction(async (manager) => {
      const packagesRepository = manager.getRepository(Package);

      const existingPackage = await packagesRepository
        .createQueryBuilder('package')
        .withDeleted()
        .setLock('pessimistic_write')
        .where('package.name = :name', { name: createPackageDto.name })
        .getOne();

      if (existingPackage) {
        if (existingPackage.deletedAt) {
          existingPackage.deletedAt = null;
          Object.assign(existingPackage, createPackageDto);
          return packagesRepository.save(existingPackage);
        }
        throw new ConflictException('Package already exists!');
      }

      try {
        return await packagesRepository.save(
          packagesRepository.create(createPackageDto),
        );
      } catch (error: unknown) {
        if (isDuplicateKeyError(error)) {
          throw new ConflictException('Package already exists!');
        }
        throw error;
      }
    });
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
