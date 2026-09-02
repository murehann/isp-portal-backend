import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entities/Package.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly packagesRepository: Repository<Package>,
  ) {}

  async createPackage(createPackageDto: CreatePackageDto) {
    const savedPackage = await this.packagesRepository.save(
      this.packagesRepository.create(createPackageDto),
    );

    return savedPackage;
  }

  async getById(packageId: number) {
    return this.packagesRepository.findOneBy({
      id: packageId,
    });
  }
}
