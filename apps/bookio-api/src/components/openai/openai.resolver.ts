import { Args, Resolver, Mutation, Query } from '@nestjs/graphql';

import { Inject, UseGuards } from '@nestjs/common';
import { ChatCompletionMessage } from 'openai/resources/chat/completions';
import { OpenAIRequestDto } from '../../libs/dto/open-ai/open-ai-request';
import { WithoutGuard } from '../auth/guards/without.guard';
import { OpenaiService } from './openai.service';
import { InquiryHistoryDto, OpenAIMessageDto } from '../../libs/dto/open-ai/open-ai-answear';
import Redis from 'ioredis';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class OpenaiResolver {
  constructor(
    private readonly service: OpenaiService,
    @Inject('REDIS_CLIENT') private client: Redis,
  ) {}

  @UseGuards(WithoutGuard)
  @Mutation(() => OpenAIMessageDto)
  public async generateResponse(
    @Args('input') request: OpenAIRequestDto,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<ChatCompletionMessage> {

    const answer: ChatCompletionMessage = await this.service.chatCompletion(request);

    if(!memberId)
      return answer;
    const timestamp = new Date().toISOString();

    const payload = {
      memberId: memberId,
      question: request.prompt,
      answer: answer.content,
      createdAt: timestamp,
    };

    const userHistoryKey = `history:member:${payload.memberId}`;

    await this.client.lpush(userHistoryKey, JSON.stringify(payload));

    await this.client.ltrim(userHistoryKey, 0, 10);

    return answer;
  }

  @UseGuards(WithoutGuard)
  @Query(() => [InquiryHistoryDto])
  public async getInquiryHistory(
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<InquiryHistoryDto[]> {
    
    const userHistoryKey = `history:member:${shapeIntoMongoObjectId(memberId)}`;

    const rawData = await this.client.lrange(userHistoryKey, 0, 9);

    return rawData.map(item => JSON.parse(item));
  }
}

