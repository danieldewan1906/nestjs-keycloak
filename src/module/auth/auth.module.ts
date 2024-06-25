import { Module } from '@nestjs/common';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAuthGuard } from './guard/keycloak-auth.guard';
import { JwtAuthGuard } from './guard/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/entity/user.entity';

@Module({
  providers: [AuthService, JwtAccessStrategy, JwtService,
    {
      provide: APP_GUARD,
      useClass: KeycloakAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AuthController],
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
export class AuthModule {}
