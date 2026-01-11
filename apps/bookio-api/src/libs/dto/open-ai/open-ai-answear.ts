import { Field, ObjectType } from "@nestjs/graphql";



@ObjectType()
export class OpenAIMessageDto {
    @Field(() => String)
    role: string;

    @Field(() => String)
    content: string;

    @Field(() => String, { nullable: true })
    refusal?: string | null;

    @Field(() => [String], { nullable: true })
    annotations?: string[] | null;

}

@ObjectType()
export class InquiryHistoryDto {
    @Field(() => String)
    memberId: string;

    @Field(() => String)
    question: string;

    @Field(() => String)
    answer: string;

    @Field(() => String)
    createdAt: string;
}
