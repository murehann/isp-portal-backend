import { Body, Controller, Post } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { Roles } from 'src/common/decorators';

@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@Body() createPackageDto: CreatePackageDto) {
    return this.packagesService.createPackage(createPackageDto);
  }
}
