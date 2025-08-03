import { JwtHelper } from '@common/helpers/jwt.helper';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UserService } from '../../user/user.service';
import { AuthHelper } from '../common/auth.helper';
import { AuthValidator } from '../common/auth.validator';
import { UserPayload } from '@core/auth/common/auth.interfaces';
import { HashHelper } from '@common/helpers/hash.helper';
import { InvalidCredentialsException } from '@core/auth/common/auth.exceptions';

@Injectable()
export class AuthLocalService {
  private readonly logger = new Logger(AuthLocalService.name);

  private readonly accessExpiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly userService: UserService,
    private readonly authHelper: AuthHelper,
    private readonly jwtHelper: JwtHelper,
    private readonly authValidator: AuthValidator,
    private readonly configService: ConfigService,
    private readonly hashHelper: HashHelper,
  ) {
    this.accessExpiresIn = this.configService.getOrThrow<string>(
      'jwt.access.expiresIn',
    );
    this.refreshExpiresIn = this.configService.getOrThrow<string>(
      'jwt.refresh.expiresIn',
    );
  }

  async login(response: Response, userPayload: UserPayload): Promise<void> {
    try {
      const accessToken = await this.jwtHelper.sign(
        userPayload,
        this.accessExpiresIn,
      );
      const refreshToken = await this.jwtHelper.sign(
        userPayload,
        this.refreshExpiresIn,
      );

      this.authValidator.checkJwtTokenSize(accessToken);
      this.authValidator.checkJwtTokenSize(refreshToken);

      this.authHelper.createCookieOfToken(response, accessToken, 'access');
      this.authHelper.createCookieOfToken(response, refreshToken, 'refresh');

      this.logger.log(`User ${userPayload.email} logged in`);
    } catch (error) {
      this.logger.error(`Error during login: ${error}`);
      throw new InternalServerErrorException();
    }
  }

  async validateUser(email: string, password: string): Promise<UserPayload> {
    const user = await this.userService.findToAuth(email);
    if (!user) throw new InvalidCredentialsException();
    if (!user.password) throw new InvalidCredentialsException();

    const valid = await this.hashHelper.compare(user.password, password);
    if (!valid) throw new UnauthorizedException();
    return user as UserPayload;
  }

  logout(response: Response): void {
    this.authHelper.clearCookiesOfToken(response);
  }

  async refresh(response: Response, userPayload: UserPayload): Promise<void> {
    try {
      const newAccess = await this.jwtHelper.sign(
        userPayload,
        this.accessExpiresIn,
      );
      const newRefresh = await this.jwtHelper.sign(
        userPayload,
        this.refreshExpiresIn,
      );

      this.authValidator.checkJwtTokenSize(newAccess);
      this.authValidator.checkJwtTokenSize(newRefresh);

      this.authHelper.createCookieOfToken(response, newAccess, 'access');
      this.authHelper.createCookieOfToken(response, newRefresh, 'refresh');

      this.logger.log(`User ${userPayload.email} refreshed tokens`);
    } catch (error) {
      this.logger.error(`Error during token refresh: ${error}`);
      this.unauthorize();
    }
  }

  private unauthorize() {
    throw new InvalidCredentialsException();
  }
}
