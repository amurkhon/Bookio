import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class OpenAIRequestDto {
  @IsNotEmpty()
  @Field(() => String)
  prompt!: string;
}
