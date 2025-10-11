import { Field, InputType, Int } from "@nestjs/graphql";
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min} from "class-validator";
import { PropertyStatus, PropertyCategory, PropertyType, PropertyLanguage } from "../../enums/property.enum";
import { ObjectId } from "mongoose";
import { availablePropertySorts } from "../../config";
import { Direction } from "../../enums/common.enum";

@InputType()
export class PropertyInput {

   @IsNotEmpty()
   @Length(3, 100)
   @Field(() => PropertyCategory)
   propertyCategory: PropertyCategory;

   @IsOptional()
   @Length(3, 100)
   @Field(() => PropertyType)
   propertyType?: PropertyType;

   @IsNotEmpty()
   @Length(3, 100)
   @Field(() => String)
   propertyTitle: string;

   @IsNotEmpty()
   @Length(3, 100)
   @Field(() => String)
   propertyAuthor: string;

   @IsNotEmpty()
   @Field(() => Number)
   propertyPrice: number;

   @IsNotEmpty()
   @Length(14)
   @Field(() => String)
   isbn: string;

   @IsNotEmpty()
   @Field(() => Number)
   propertyPages: number;

   @IsNotEmpty()
   @Field(() => [String])
   propertyLanguages: string[];

   @IsNotEmpty()
   @Field(() => [String])
   propertyImages: string[];

   @IsOptional()
   @Field(() => String, {nullable: true})
   propertyFile?: string;

   @IsOptional()
   @Field(() => String, {nullable: true})
   propertyAudio?: string;

   @IsOptional()
   @Length(5, 2200)
   @Field(() => String, { nullable: true })
   propertyDesc?: string;

   memberId?: ObjectId;

   @IsNotEmpty()
   @Field(() => String)
   publicationDate: string;
}


@InputType()
export class PricesRange{
   @Field(() => Int)
   start: number;

   @Field(() => Int)
   end: number;
}

@InputType()
export class PagesRange{
   @Field(() => Int)
   start: number;

   @Field(() => Int)
   end: number;
}

@InputType()
export class PeriodsRange{
   @Field(() => Date)
   start: Date;

   @Field(() => Date)
   end: Date;
}

@InputType()
class PISearch{
   
   @IsOptional()
   @Field(() => String, {nullable: true})
   memberId?: ObjectId;
   
   @IsOptional()
   @Field(() => [PropertyCategory], {nullable: true})
   propertyCategory?: PropertyCategory[];

   @IsOptional()
   @Field(() => [PropertyType], {nullable: true})
   typeList?: PropertyType[];

   @IsOptional()
   @Field(() => [PropertyLanguage], {nullable: true})
   languageList?: PropertyLanguage[];

   @IsOptional()
   @Field(() => PricesRange, {nullable: true})
   pricesRange?: PricesRange;

   @IsOptional()
   @Field(() => PeriodsRange, {nullable: true})
   periodsRange?: PeriodsRange;

   @IsOptional()
   @Field(() => PagesRange, {nullable: true})
   pagesRange?: PagesRange;

   @IsOptional()
   @Field(() => String, {nullable: true})
   text?: string;
}


@InputType()
export class PropertiesInquiry {

   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   page: number;

   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   limit: number;

   @IsOptional()
   @IsIn(availablePropertySorts)
   @Field(() => String, {nullable: true})
   sort?: string;

   @IsOptional()
   @Field(() => Direction, {nullable: true})
   direction?: Direction;

   @IsNotEmpty()
   @Field(() => PISearch)
   search: PISearch;
}


@InputType()
class APISearch {
   @IsOptional()
   @Field(() => PropertyStatus, {nullable: true})
   propertyStatus?: PropertyStatus;
}

@InputType()
export class AuthorPropertiesInquiry {
   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   page: number;

   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   limit: number;

   @IsOptional()
   @IsIn(availablePropertySorts)
   @Field(() => String, { nullable: true })
   sort?: string;

   @IsOptional()
   @Field(() => Direction, { nullable: true })
   direction?: Direction;

   @IsNotEmpty()
   @Field(() => APISearch)
   search: APISearch;
}

@InputType()
class ALPISearch {
   @IsOptional()
   @Field(() => PropertyStatus, {nullable: true})
   propertyStatus?: PropertyStatus;

   @IsOptional()
   @Field(() => [PropertyCategory], {nullable: true})
   propertyCategoryList?: PropertyCategory[];
}

@InputType()
export class AllPropertiesInquiry {
   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   page: number;

   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   limit: number;

   @IsOptional()
   @IsIn(availablePropertySorts)
   @Field(() => String, { nullable: true })
   sort?: string;

   @IsOptional()
   @Field(() => Direction, { nullable: true })
   direction?: Direction;

   @IsNotEmpty()
   @Field(() => ALPISearch)
   search: ALPISearch;
}

@InputType()
export class OrdinaryInquiry {
   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   page: number;

   @IsNotEmpty()
   @Min(1)
   @Field(() => Int)
   limit: number;
}

export function parseDateOnlyUTC(v: any): Date | undefined {
  if (!v) return v;
  if (v instanceof Date) return v;
  if (typeof v === 'string') {
    const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m) {
      const [, y, mo, d] = m;
      return new Date(Date.UTC(+y, +mo - 1, +d, 0, 0, 0));
    }
    // fallback: try native parser (expects ISO)
    const d2 = new Date(v);
    return isNaN(+d2) ? undefined : d2;
  }
  return undefined;
}

export const MIN_PUBLICATION_DATE = new Date('1450-01-01T00:00:00Z');