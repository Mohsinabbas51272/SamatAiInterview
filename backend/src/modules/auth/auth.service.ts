import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    try {
      let user = await this.usersService.findByEmail(email);

      // Development helper: auto-create admin account if credentials match
      if (!user && email === 'admin@sai.com' && password === 'admin123') {
        await this.usersService.create({
          email,
          password,
          role: Role.ADMIN,
          firstName: 'Smart',
          lastName: 'Admin',
        });
        user = await this.usersService.findByEmail(email);
      }

      if (!user || !(await bcrypt.compare(password, user.passwordHash || ''))) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (user.isBlocked) {
        throw new UnauthorizedException('Your account has been deactivated');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      const tokens = await this.generateTokens(String(user.id), user.email, user.role);
      await this.saveRefreshToken(String(user.id), tokens.refreshToken);

      const { passwordHash: _, password: __, ...userWithoutPassword } = user as any;

      return {
        user: userWithoutPassword,
        ...tokens,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async refresh(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) {
        await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const { user } = tokenRecord;
    if (user.isBlocked) {
      throw new UnauthorizedException('User account is inactive');
    }

    const tokens = await this.generateTokens(String(user.id), user.email, user.role);

    // Replace the old refresh token with a new one (refresh token rotation)
    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    await this.saveRefreshToken(String(user.id), tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    } catch (e) {
      // Ignore if token already deleted or doesn't exist
    }
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET', 'your-super-secret-jwt-key'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'your-super-secret-refresh-key'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresDays = parseInt(this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d').replace('d', '')) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresDays);

    await this.prisma.refreshToken.create({
      data: {
        userId: parseInt(userId, 10),
        token,
        expiresAt,
      },
    });
  }
}
