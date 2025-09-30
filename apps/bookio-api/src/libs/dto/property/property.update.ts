import { Field, InputType, Int } from "@nestjs/graphql";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, Length, Min} from "class-validator";
import { PropertyStatus, PropertyType} from "../../enums/property.enum";
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
   @Field(() => PropertyType, { nullable: true })
   propertyType?: PropertyType;

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
   @IsNumber()
   @Field(() => Number, { nullable: true })
   propertyPrice?: number;

   @IsOptional()
   @IsInt()
   @Field(() => Number, { nullable: true })
   propertyPages?: number;

   @IsOptional()
   @Length(3,14)
   @Field(() => String, { nullable: true })
   isbn?: string;

   @IsOptional()
   @Field(() => [String], { nullable: true })
   propertyImages?: string[];

   @IsOptional()
   @Field(() => [String], { nullable: true })
   propertyLanguages?: string[];

   @IsOptional()
   @Length(5, 2000)
   @Field(() => String, { nullable: true })
   propertyDesc?: string;

   @IsOptional()
   @Field(() => String, {nullable: true})
   propertyFile?: string;

   @IsOptional()
   @Field(() => String, {nullable: true})
   propertyAudio?: string;

   @IsOptional()
   @Field(() => String, {nullable: true})
   publicationDate?: string;

   deletedAt?: Date;
}