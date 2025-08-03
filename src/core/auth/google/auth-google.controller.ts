import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { GoogleAuthGuard } from '@core/auth/google/guards/google.guard';
import { IsPublic } from '@core/auth/common/decorators/is-public.decorator';
import { CurrentUser } from '@core/auth/common/decorators/current-user.decorator';
import type { UserPayload } from '@core/auth/common/auth.interfaces';
import { AuthLocalService } from '@core/auth/local/auth-local.service';

@Controller('auth/google')
export class AuthGoogleController {
  constructor(private readonly authService: AuthLocalService) {}

  @IsPublic()
  @UseGuards(GoogleAuthGuard)
  @Get('login')
  handleLogin() {}

  @IsPublic()
  @UseGuards(GoogleAuthGuard)
  @Get('redirect')
  handleRedirect(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() payload: UserPayload,
  ) {
    return this.authService.login(response, payload);
  }
}
