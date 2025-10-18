import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional, Length, Min } from "class-validator";
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

@InputType()
class NISearch {

    @IsOptional()
    @Field(() => String, { nullable: true })
    text?: string;

    @IsOptional()
    @Field(() => String, { nullable: true })
    memberId?: ObjectId;
}

@InputType()
export class NoticeInquiry {
    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    page: number;

    @IsNotEmpty()
    @Min(1)
    @Field(() => Int)
    limit: number;

    @IsNotEmpty()
    @Field(() => NISearch)
    search: NISearch;
}