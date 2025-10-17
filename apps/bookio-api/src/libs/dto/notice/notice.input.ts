import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, Length } from "class-validator";
import { NoticeCategory } from "../../enums/notice.enum";
import { ObjectId } from "mongoose";



@InputType()
export class NoticeInput {
    @IsNotEmpty()
    @Field(() => NoticeCategory)
    noticeCategory: NoticeCategory;

    @IsNotEmpty()
    @Length(5, 100)
    @Field(() => String)
    noticeTitle: string;

    @IsNotEmpty()
    @Field(() => String)
    noticeContent: string;

    memberId?: ObjectId;
}