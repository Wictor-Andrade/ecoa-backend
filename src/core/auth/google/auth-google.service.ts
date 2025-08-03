import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Profile } from 'passport-google-oauth20';
import { UserService } from '@core/user/user.service';

@Injectable()
export class AuthGoogleService {
  private readonly logger = new Logger(AuthGoogleService.name);

  constructor(private readonly userService: UserService) {}

  async validateUser(profile: Profile) {
    try {
      const email = profile.emails?.[0]?.value;
      const googleId = profile.id;
      const displayName = profile.displayName;
      const avatarUrl = profile.photos?.[0]?.value || null;

      if (!email || !googleId || !displayName) {
        this.logger.warn('Invalid Google profile data');
        throw new UnauthorizedException('Invalid Google profile data');
      }

      const existingUser = await this.userService.findToAuth(email);
      if (existingUser) return existingUser;

      const [firstName, ...rest] = displayName.split(' ');
      const lastName = rest.join(' ') || firstName;

      return await this.userService.create({
        email,
        googleId,
        displayName,
        password: null,
        firstName,
        lastName,
        avatarUrl,
      });
    } catch (error) {
      this.logger.error('Failed to validate Google user', error.stack);
      throw new UnauthorizedException('Failed to authenticate with Google');
    }
  }
}
