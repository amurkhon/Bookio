import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class NotificationService {

    constructor(
        @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
    ) {}

    public async createNotification(memberId: ObjectId, input: NotificationInput): Promise<Notification> {
        input.authorId = memberId;
        if(input?.propertyId)
            input.propertyId = shapeIntoMongoObjectId(input.propertyId);
        if(input?.articleId)
            input.articleId = shapeIntoMongoObjectId(input.articleId);
        input.receiverId = shapeIntoMongoObjectId(input.receiverId);
        try {
            
            const result = await this.notificationModel.create(input);

            return result;
        } catch(err) {
            console.log('Error, createNotification: ', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }
}
