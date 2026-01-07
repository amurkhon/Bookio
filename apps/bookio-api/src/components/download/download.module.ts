import { Module } from '@nestjs/common';
import { DownloadService } from './download.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DownloadResolver } from './download.resolver';
import DownloadSchema from '../../schemas/downloads';
import { PropertyModule } from '../property/property.module';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Download', schema: DownloadSchema}]),
    PropertyModule,
    AuthModule,
    OrderModule
  ],
  providers: [DownloadService, DownloadResolver],
  exports: [DownloadService],
})
export class DownloadModule {}
