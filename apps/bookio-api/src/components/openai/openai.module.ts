import { Module } from '@nestjs/common';
import { OpenaiResolver } from './openai.resolver';
import { OpenaiService } from './openai.service';
import { AuthModule } from '../auth/auth.module';
import { RedisDatabaseModule } from '../../redis-database/redis-database.module';

@Module({
  imports:[
    AuthModule,
    RedisDatabaseModule,
  ],
  providers: [OpenaiResolver, OpenaiService]
})
export class OpenaiModule {}
