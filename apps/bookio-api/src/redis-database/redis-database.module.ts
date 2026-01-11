import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const client = new Redis({
          host: 'redis-15409.c73.us-east-1-2.ec2.cloud.redislabs.com',
          port: 15409,
          password: 'dTt72PVVfaJTHgGYFw5crYxdnaPV5GxC',
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


