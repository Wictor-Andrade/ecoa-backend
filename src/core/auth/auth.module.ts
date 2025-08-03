import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CommonModule } from '@common/common.module';
import { UserModule } from '../user/user.module';
import { AuthRedisHelper } from './common/auth-redis.helper';
import { AuthLocalController } from './local/auth-local.controller';
import { AuthHelper } from './common/auth.helper';
import { AuthLocalService } from './local/auth-local.service';
import { AuthValidator } from './common/auth.validator';
import { JwtAccessGuard } from '@core/auth/local/guards/jwt-access.guard';
import { JwtStrategy } from '@core/auth/local/strategies/jwt.strategy';
import { LocalStrategy } from '@core/auth/local/strategies/local.strategy';
import { AdminGuard } from '@core/auth/local/guards/admin.guard';
import { GoogleStrategy } from '@core/auth/google/strategies/google.strategy';
import { AuthGoogleController } from '@core/auth/google/auth-google.controller';
import { AuthGoogleService } from '@core/auth/google/auth-google.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        signOptions: {
          expiresIn: configService.getOrThrow<string>('jwt.access.expiresIn'),
        },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        signOptions: {
          expiresIn: configService.getOrThrow<string>('jwt.refresh.expiresIn'),
        },
      }),
    }),
    CommonModule,
    ConfigModule,
    UserModule,
    PassportModule,
  ],
  controllers: [AuthLocalController, AuthGoogleController],
  providers: [
    AuthLocalService,
    AuthGoogleService,
    AuthHelper,
    AuthValidator,
    AuthRedisHelper,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AdminGuard,
    },
  ],
  exports: [AuthLocalService, AuthHelper],
})
export class AuthModule {}
