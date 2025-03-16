import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from '@testcontainers/rabbitmq';
import {
  ElasticsearchContainer,
  StartedElasticsearchContainer,
} from '@testcontainers/elasticsearch';

export class TestContainers {
  static redisContainer: StartedRedisContainer;
  static rabbitMQContainer: StartedRabbitMQContainer;
  static elasticsearchContainer: StartedElasticsearchContainer;

  static async startContainers() {
    this.rabbitMQContainer = await new RabbitMQContainer(
      'rabbitmq:3-management',
    ).start();
    this.redisContainer = await new RedisContainer().start();
    this.elasticsearchContainer = await new ElasticsearchContainer().start();
  }

  static setupEnv() {
    // Dummy Konsi INSS credentials
    process.env.KONSI_INSS_API_URL = 'http://konsi-inss-api';
    process.env.KONSI_INSS_API_AUTH_USERNAME = 'konsi-inss-user';
    process.env.KONSI_INSS_API_AUTH_PASSWORD = 'konsi-inss-password';

    process.env.REDIS_HOST = this.redisContainer.getHost();
    process.env.REDIS_PORT = this.redisContainer.getMappedPort(6379).toString();

    process.env.RABBITMQ_HOST = this.rabbitMQContainer.getHost();
    process.env.RABBITMQ_PORT = this.rabbitMQContainer
      .getMappedPort(5672)
      .toString();
    process.env.RABBITMQ_AUTH_USERNAME = 'guest';
    process.env.RABBITMQ_AUTH_PASSWORD = 'guest';

    process.env.ELASTICSEARCH_HOST = this.elasticsearchContainer.getHost();
    process.env.ELASTICSEARCH_PORT = this.elasticsearchContainer
      .getMappedPort(9200)
      .toString();
  }

  static async stopContainers() {
    if (this.redisContainer) await this.redisContainer.stop({ remove: true });
    if (this.rabbitMQContainer)
      await this.rabbitMQContainer.stop({ remove: true });
    if (this.elasticsearchContainer)
      await this.elasticsearchContainer.stop({ remove: true });
  }
}
