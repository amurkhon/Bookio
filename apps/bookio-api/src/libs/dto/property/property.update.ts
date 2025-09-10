import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsOptional, Length, Min} from "class-validator";
import { PropertyStatus} from "../../enums/property.enum";
import { ObjectId } from "mongoose";


@InputType()
export class PropertyUpdate {

   @IsNotEmpty()
   @Field(() => String)
   _id: string;

   @IsOptional()
   @Field(() => PropertyStatus, { nullable: true })
   propertyStatus?: PropertyStatus;

   @IsOptional()
   @Length(3, 100)
   @Field(() => String, { nullable: true })
   propertyCategory?: string;

   @IsOptional()
   @Length(3, 100)
   @Field(() => String, { nullable: true })
   propertyTitle?: string;

   @IsOptional()
   @Length(3, 100)
   @Field(() => String, { nullable: true })
   propertyAuthor?: string;

   @IsOptional()
   @Field(() => Number, { nullable: true })
   propertyPrice?: number;

   @IsOptional()
   @IsInt()
   @Min(20)
   @Field(() => Number, { nullable: true })
   propertyPages?: number;

   @IsOptional()
   @Length(13)
   @Field(() => String, { nullable: true })
   isbn?: string;

   @IsOptional()
   @Field(() => [String], { nullable: true })
   propertyImages?: string[];

   @IsOptional()
   @Field(() => [String], { nullable: true })
   propertyLanguages?: string[];

   @IsOptional()
   @Length(5, 500)
   @Field(() => String, { nullable: true })
   propertyDesc?: string;

   @IsOptional()
   @Field(() => String, {nullable: true})
   propertyFile?: string;

   @IsOptional()
   @Field(() => String, {nullable: true})
   propertyAudio?: string;

   @IsOptional()
   @Field(() => Date, {nullable: true})
   publicationDate?: Date;

   deletedAt?: Date;
}