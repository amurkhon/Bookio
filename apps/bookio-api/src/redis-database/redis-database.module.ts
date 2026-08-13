import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new Redis({
          host: 'redis-18011.c322.us-east-1-2.ec2.cloud.redislabs.com',
          port: 18011,
          password: 'nYHVAotLbJADv8eMvqrsig308O5t2kCB',
        });

        client.on('error', (err) => console.error('Redis Error', err));
        client.on('connect', () => console.log('Connected to Redis Cloud'));

        return client;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisDatabaseModule {}


