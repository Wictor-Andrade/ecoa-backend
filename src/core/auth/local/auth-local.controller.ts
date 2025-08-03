import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthLocalService } from './auth-local.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { IsPublic } from '@core/auth/common/decorators/is-public.decorator';
import type { Response } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import type { UserPayload } from '@core/auth/common/auth.interfaces';
import { CurrentUser } from '@core/auth/common/decorators/current-user.decorator';

@Controller('auth/local')
export class AuthLocalController {
  constructor(private readonly authService: AuthLocalService) {}

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() payload: UserPayload,
  ) {
    return this.authService.login(response, payload);
  }

  @Get('me')
  getMe(@CurrentUser() payload: UserPayload) {
    return payload;
  }

  @IsPublic()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  refresh(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() payload: UserPayload,
  ) {
    return this.authService.refresh(response, payload);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    this.authService.logout(response);
  }
}
