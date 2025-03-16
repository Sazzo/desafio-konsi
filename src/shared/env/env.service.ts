import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Env } from './schema';

/**
 * Provides type-safe access to environment variables through the ConfigService.
 */
@Injectable()
export class EnvService {
  constructor(private configService: ConfigService<Env, true>) {}
  get<T extends keyof Env>(key: T) {
    return this.configService.get(key, { infer: true });
  }
}
