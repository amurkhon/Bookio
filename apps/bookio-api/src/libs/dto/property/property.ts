import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";
import { MemberAuthType, MemberStatus, MemberType } from "../../enums/member.enum";
import { PropertyCategory, PropertyStatus, PropertyType } from "../../enums/property.enum";
import { Member, TotalCounter } from "../member/member";
import { MeLiked } from "../like/like";



@ObjectType()
export class Property {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => PropertyStatus)
    propertyStatus: PropertyStatus;

    @Field(() => PropertyCategory)
    propertyCategory: PropertyCategory;

    @Field(() => PropertyType)
    propertyType: PropertyType;

    @Field(() => String)
    propertyTitle: string;

    @Field(() => Number)
    propertyPrice: number;

    @Field(() => String)
    propertyAuthor: string;

    @Field(() => Int)
    propertyPages: number;

    @Field(() => String)
    isbn: string;

    @Field(() => Int)
    propertyViews: number;

    @Field(() => Int)
    propertyLikes: number;

    @Field(() => Int)
    propertyComments: number;

    @Field(() => Int)
    propertyRank: number;

    @Field(() => Int)
    propertyDownloads: number;

    @Field(() => [String])
    propertyImages: string[];

    @Field(() => [String])
    propertyLanguages: string[];

    @Field(() => String, {nullable: true})
    propertyDesc?: string;

    @Field(() => String)
    propertyFile: string;

    @Field(() => String)
    propertyAudio: string;

    @Field(() => String)
    memberId: ObjectId;

    @Field(() => Date, {nullable: true})
    deletedAt?: Date;

    @Field(() => Date)
    publicationDate: Date;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    // from aggregation

    @Field(() => Member, {nullable: true})
    memberData?: Member;

    @Field(() => [MeLiked], {nullable: true})
    meLiked?: MeLiked[];
}

@ObjectType()
export class Properties {
    @Field(() => [Property])
    list: Property[];

    @Field(() => [TotalCounter], {nullable: true})
    metaCounter: TotalCounter[]
}