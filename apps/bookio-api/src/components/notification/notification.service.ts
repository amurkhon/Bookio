import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationStatusModifier, T } from '../../libs/types/common';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { MemberService } from '../member/member.service';

@Injectable()
export class NotificationService {

    constructor(
        @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
        @Inject(forwardRef(() => MemberService))
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
                return await this.notificationModel.create(input);
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

    public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
        const { status } = input;

        const match: T = status ? {notificationStatus: status, receiverId: memberId} : {receiverId: memberId};
        const sort: T = { createdAt: Direction.DESC };

        const result = await this.notificationModel
            .aggregate([
                {$match: match},
                {$sort: sort},
                {
                    $facet: {
                        list: [],
                        memberNotification: [
                            {$match: { notificationGroup: 'MEMBER'}},
                            {
                                $lookup: {
                                    from: 'members',
                                    localField: 'authorId',
                                    foreignField: '_id',
                                    as: 'memberData',
                                }
                            },
                            {$unwind: '$memberData'},
                        ],
                        propertyNotification: [
                            {
                                $lookup: {
                                    from: 'members',
                                    localField: 'authorId',
                                    foreignField: '_id',
                                    as: 'memberData',
                                }
                            },
                            {$unwind: '$memberData'},
                            {
                                $lookup: {
                                    from: 'properties',
                                    let: { pid: '$propertyId'},
                                    pipeline: [
                                        { $match: { $expr: {$and: [ { $ne: ['$propertyId', null] }, {$eq: ['$_id', '$$pid'] } ] } } }
                                    ],
                                    as: 'propertyData'
                                }
                            },
                            {$unwind: '$propertyData'},
                        ],
                        articleNotification: [
                            {
                                $lookup: {
                                    from: 'members',
                                    localField: 'authorId',
                                    foreignField: '_id',
                                    as: 'memberData',
                                }
                            },
                            {$unwind: '$memberData'},
                            {
                                $lookup: {
                                    from: 'boardArticles',
                                    let: { pid: '$articleId'},
                                    pipeline: [
                                        { $match: { $expr: {$and: [ { $ne: ['$articleId', null] }, {$eq: ['$_id', '$$pid'] } ] } } }
                                    ],
                                    as: 'articleData'
                                }
                            },
                            {$unwind: '$articleData'},
                        ],
                        metaCounter: [
                            {$count: 'total'}
                        ]
                    }
                },
            ])
            .exec()

        result[0].list = [].concat(result[0].memberNotification, result[0].propertyNotification, result[0].articleNotification);

        delete result[0].memberNotification;
        delete result[0].propertyNotification;
        delete result[0].articleNotification;

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    public async updateNotificationsAsRead(memberId: ObjectId, input: NotificationsInquiry): Promise<Notification[]> {
        const search: T = {
            notificationStatus: input.status,
            receiverId: memberId,
        };
        console.log("status: ", input);
        await this.notificationModel.updateMany(search, { notificationStatus: NotificationStatus.READ}).exec();
        
        const result = await this.notificationModel.find(
            {
                notificationStatus: NotificationStatus.READ,
                receiverId: memberId,
            }
        )
        .exec()
        console.log("result: ", result);
        
        return result;
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
