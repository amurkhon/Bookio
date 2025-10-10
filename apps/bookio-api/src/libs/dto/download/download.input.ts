import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty } from "class-validator";
import { ViewGroup } from "../../enums/view.enum";
import { ObjectId } from "mongoose";



@InputType()
export class DownloadInput {

    @IsNotEmpty()
    @Field(() => String)
    propertyId: ObjectId;

    @IsNotEmpty()
    @Field(() => String)
    memberId: ObjectId;
}