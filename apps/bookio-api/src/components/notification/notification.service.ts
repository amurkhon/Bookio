import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification } from '../../libs/dto/notification/notification';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationStatusModifier, T } from '../../libs/types/common';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { MemberService } from '../member/member.service';

@Injectable()
export class NotificationService {

    constructor(
        @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
        private memberService: MemberService,
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

    public async getNotification(memberId: ObjectId, notificationId: ObjectId): Promise<Notification> {
        const search: T = {
            _id: notificationId,
            receiverId: memberId,
        };

        const targetNotification = await this.notificationModel.findOne(search).exec();
        if(!targetNotification) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if(memberId) {
            const read = targetNotification?.notificationStatus === NotificationStatus.READ;
            if(!read) {
                const edit: NotificationStatusModifier = {
                _id: targetNotification._id,
                targetKey: 'notificationStatus',
                modifier: NotificationStatus.READ,
                };
                await this.notificationStatusChanger(edit);
                targetNotification.notificationStatus = NotificationStatus.READ;
            }
        }
        targetNotification.memberData = await this.memberService.getMember(null, targetNotification?.authorId);
        return targetNotification;
    }

    public async notificationStatusChanger(input: NotificationStatusModifier): Promise<Notification> {
        const { _id, targetKey, modifier } = input;
        return await this.notificationModel.findOneAndUpdate(
            _id,
            {[targetKey]: modifier},
            {new: true}
        )
        .exec();
    }
}
