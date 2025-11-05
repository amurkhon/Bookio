import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional } from "class-validator";
import { ObjectId } from "mongoose";
import { NoticeCategory, NoticeStatus } from "../../enums/notice.enum";

@InputType()
export class UpdateNotice {

    @IsNotEmpty()
    @Field(() => String)
    _id: ObjectId;

    @IsNotEmpty()
    @Field(() => NoticeCategory)
    noticeCategory: NoticeCategory;

    @IsNotEmpty()
    @Field(() => NoticeStatus)
    noticeStatus: NoticeStatus;

    @IsOptional()
    @Field(() => String, { nullable: true })
    noticeTitle?: string; 

    @IsOptional()
    @Field(() => String, { nullable: true })
    noticeContent?: string;
}