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
