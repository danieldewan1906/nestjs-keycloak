import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationService } from './configuration/service/configuration.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    AuthModule,
    CategoryModule,
    ConfigurationModule,
    MongooseModule.forRootAsync({
      inject: [ConfigurationService],
      useFactory: async (configurationService: ConfigurationService) => configurationService.getMongoConfig()
    }),
    AdminModule
  ]
})
export class AppModule {}
