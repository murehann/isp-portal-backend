import { Module } from '@nestjs/common';
import { RadiusService } from './radius.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.getOrThrow<string>('DB_HOST'),
          port: Number(configService.getOrThrow<string>('FREE_RADIUS_DB_PORT')),
          username: configService.getOrThrow<string>('FREE_RADIUS_DB_USERNAME'),
          password: configService.getOrThrow<string>('FREE_RADIUS_DB_PASSWORD'),
          database: configService.getOrThrow<string>('FREE_RADIUS_DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
    }),
  ],
  providers: [RadiusService],
  exports: [RadiusService],
})
export class RadiusModule {}
