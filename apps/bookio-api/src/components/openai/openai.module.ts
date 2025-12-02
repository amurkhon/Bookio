import { Module } from '@nestjs/common';
import { OpenaiResolver } from './openai.resolver';
import { OpenaiService } from './openai.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports:[
    AuthModule
  ],
  providers: [OpenaiResolver, OpenaiService]
})
export class OpenaiModule {}
