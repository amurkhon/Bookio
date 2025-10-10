import { Field, ObjectType } from "@nestjs/graphql";
import { ObjectId } from "mongoose";



@ObjectType()
export class Download {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => String)
    propertyId: ObjectId;

    @Field(() => String)
    memberId: ObjectId;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;
}