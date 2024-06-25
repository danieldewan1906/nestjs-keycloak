import { Global, Module } from '@nestjs/common';
import { ConfigurationService } from './service/configuration.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Global()
@Module({
  providers: [
    {
      provide: ConfigurationService,
      useValue: new ConfigurationService()
    }
  ],
  exports: [ConfigurationService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    })
  ]
})
export class ConfigurationModule {}
