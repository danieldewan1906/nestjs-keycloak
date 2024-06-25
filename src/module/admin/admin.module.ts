import { Module } from '@nestjs/common';
import { AdminService } from './service/admin.service';
import { AdminController } from './controller/admin.controller';
import { JwtAccessStrategy } from '../auth/strategy/jwt-access.strategy';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from '../auth/guard/keycloak-auth.guard';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/entity/user.entity';

@Module({
  providers: [AdminService, JwtAccessStrategy, JwtService,
    {
      provide: APP_GUARD,
      useClass: KeycloakAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },],
  controllers: [AdminController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }), 
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        baseURL: config.get<string>("KEYCLOAK_URL")
      })
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      }
    ])
  ]
})
export class AdminModule {}
