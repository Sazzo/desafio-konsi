import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { EnvService } from 'src/shared/env/env.service';

@Injectable()
export class RedisService extends Redis {
  constructor(private readonly envService: EnvService) {
    super({
      username: envService.get('REDIS_AUTH_USERNAME'),
      password: envService.get('REDIS_AUTH_PASSWORD'),
      host: envService.get('REDIS_HOST'),
      port: envService.get('REDIS_PORT'),
    });
  }
}
