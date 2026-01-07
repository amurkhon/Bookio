import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Download } from '../../libs/dto/download/download';
import { DownloadInput } from '../../libs/dto/download/download.input';
import { Message } from '../../libs/enums/common.enum';
import { PropertyService } from '../property/property.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class DownloadService {
    // Add to constructor
    constructor(
        @InjectModel('Download') private readonly downloadModel: Model<Download>,
        private propertyService: PropertyService,
        private orderService: OrderService, // Add this
    ) {}

    // Update recordDownload method
    public async recordDownload(input: DownloadInput): Promise<Download> {
        // Check if user has purchased this property
        const hasPurchased = await this.orderService.checkPurchase(
            input.memberId,
            input.propertyId
        );

        if (!hasPurchased) {
            throw new InternalServerErrorException('You must purchase this book before downloading');
        }

        // Check if already downloaded (optional - prevent duplicate downloads)
        const existingDownload = await this.downloadModel.findOne({
            memberId: input.memberId,
            propertyId: input.propertyId,
        }).exec();

        if (existingDownload) {
            // Return existing download or allow re-download
            return existingDownload;
        }

        const result = await this.downloadModel.create(input);

        if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

        await this.propertyService.propertyStatsEditor({
            _id: input.propertyId,
            targetKey: 'propertyDownloads',
            modifier: 1
        });

        return result;
    }
}
