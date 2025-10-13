import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length } from "class-validator";
import { NotificationGroup, NotificationType } from "../../enums/notification.enum";
import { ObjectId } from "mongoose";




@InputType()
export class NotificationInput {
    @IsNotEmpty()
    @Field(() => NotificationType)
    notificationType: NotificationType;

    @IsNotEmpty()
    @Field(() => NotificationGroup)
    notificationGroup: NotificationGroup;

    @IsNotEmpty()
    @Length(3, 50)
    @Field(() => String)
    notificationTitle: string;

    @IsOptional()
    @Length(5, 2200)
    @Field(() => String, { nullable: true })
    notificationDesc?: string;

    @IsNotEmpty()
    @Field(() => String)
    receiverId: string;

    @IsOptional()
    @Field(() => String, {nullable: true})
    propertyId?: string;

    @IsOptional()
    @Field(() => String, {nullable: true})
    articleId?: string;

    authorId?: ObjectId;
}