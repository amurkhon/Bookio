import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Download } from '../../libs/dto/download/download';
import { DownloadInput } from '../../libs/dto/download/download.input';
import { Message } from '../../libs/enums/common.enum';
import { PropertyService } from '../property/property.service';

@Injectable()
export class DownloadService {
    constructor(
        @InjectModel('Download') private readonly downloadModel: Model<Download>,
        private propertyService: PropertyService,
    ) {}

    public async recordDownload(input: DownloadInput): Promise<Download> {
        const result =  await this.downloadModel.create(input);

        if(!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

        await this.propertyService.propertyStatsEditor({
            _id: input.propertyId,
            targetKey: 'propertyDownloads',
            modifier: 1
        });

        return result;
    };
}
