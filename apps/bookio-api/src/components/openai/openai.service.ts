import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { OpenAIRequestDto } from '../../libs/dto/open-ai/open-ai-request';

@Injectable()
export class OpenaiService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  public async chatCompletion(request: OpenAIRequestDto) {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: request.prompt,
        },
      ],
    });

    return completion.choices[0].message;
  }
}

