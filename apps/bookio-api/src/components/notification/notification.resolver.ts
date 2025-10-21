import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { NotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class NotificationResolver {


    constructor( private readonly notificationService: NotificationService){}

    @UseGuards(AuthGuard)
    @Mutation((returns) => Notification)
    public async createNotification(
        @Args('input') input: NotificationInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Notification> {
        console.log('Mutation createNotification');
        return await this.notificationService.createNotification(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Query((returns) => Notification)
    public async getNotification(
        @Args('notificationId') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Notification> {
        console.log('Query getNotification');
        const articleId = shapeIntoMongoObjectId(input);
        return await this.notificationService.getNotification(memberId, articleId);
    }

    @UseGuards(AuthGuard)
    @Query((returns) => Notifications)
    public async getNotifications(
        @Args('input') input: NotificationsInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Notifications> {
        console.log('Query getNotification');
        return await this.notificationService.getNotifications(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Mutation((returns) => [Notification])
    public async updateNotificationsAsRead(
        @Args('input') input: NotificationsInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Notification[]> {
        console.log('Query updateNotificationsAsRead');
        return await this.notificationService.updateNotificationsAsRead(memberId, input);
    }
}
