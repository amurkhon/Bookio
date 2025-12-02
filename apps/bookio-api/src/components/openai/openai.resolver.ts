import { Args, Resolver, Mutation } from '@nestjs/graphql';

import { UseGuards } from '@nestjs/common';
import { ChatCompletionMessage } from 'openai/resources/chat/completions';
import { OpenAIRequestDto } from '../../libs/dto/open-ai/open-ai-request';
import { WithoutGuard } from '../auth/guards/without.guard';
import { OpenaiService } from './openai.service';
import { OpenAIMessageDto } from '../../libs/dto/open-ai/open-ai-answear';

@Resolver()
export class OpenaiResolver {
  constructor(private readonly service: OpenaiService) {}

  @UseGuards(WithoutGuard)
  @Mutation(() => OpenAIMessageDto)
  public async generateResponse(
    @Args('input') request: OpenAIRequestDto,
  ): Promise<ChatCompletionMessage> {
    return this.service.chatCompletion(request);
  }
}

