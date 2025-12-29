import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Response,
  UnauthorizedException
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req,
    @Response({ passthrough: true }) res: FastifyReply,
  ) {
    const result = await this.authService.register(registerDto);

    // Generate refresh token for new user
    const refreshToken = this.authService.generateRefreshToken();

    // Save refresh token to DB
    await this.authService.saveRefreshToken(
      result.user.id,
      refreshToken,
      req.ip,
      req.headers['user-agent'],
    );

    // Set httpOnly cookies
    this.setCookies(res, result.accessToken, refreshToken);

    return {
      message: 'Registration successful',
      user: result.user,
    };
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Request() req,
    @Response({ passthrough: true }) res: FastifyReply,
  ) {
    // Validate credentials
    const result = await this.authService.login(loginDto);

    // Generate refresh token
    const refreshToken = this.authService.generateRefreshToken();

    // Save refresh token to DB
    await this.authService.saveRefreshToken(
      result.user.id,
      refreshToken,
      req.ip,
      req.headers['user-agent'],
    );

    // Set httpOnly cookies
    this.setCookies(res, result.accessToken, refreshToken);

    return {
      message: 'Login successful',
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(
    @Request() req,
    @Response({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    // Refresh tokens (rotation)
    const tokens = await this.authService.refreshAccessToken(
      refreshToken,
      req.ip,
      req.headers['user-agent'],
    );

    // Set new cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return { message: 'Token refreshed' };
  }

  @Post('logout')
  async logout(
    @Request() req,
    @Response({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  // Helper method to set cookies
  private setCookies(
    res: FastifyReply,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = process.env.NODE_ENV === 'production';

    // Access token - 15 minutes
    res.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction, // HTTPS only in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Refresh token - 7 days
    res.setCookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
  }
}
