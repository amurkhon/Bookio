import { Module } from '@nestjs/common';
import { DownloadService } from './download.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadResolver } from './download.resolver';
import DownloadSchema from '../../schemas/downloads';
import { PropertyModule } from '../property/property.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Download', schema: DownloadSchema}]),
    PropertyModule,
    AuthModule
  ],
  providers: [DownloadService, DownloadResolver],
  exports: [DownloadService],
})
export class DownloadModule {}
