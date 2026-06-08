import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @Get('profile')
  getProfile(@GetUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @ApiOperation({ summary: 'Update current user profile' })
  @Patch('profile')
  updateProfile(
    @GetUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @ApiOperation({ summary: 'Get all users (Admin/HR only)' })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  @Roles(Role.ADMIN, Role.HR)
  @Get()
  findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  @ApiOperation({ summary: 'Get a user by ID (Admin/HR only)' })
  @Roles(Role.ADMIN, Role.HR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: Role) {
    return this.usersService.updateRole(id, role);
  }

  @ApiOperation({ summary: 'Delete user (Admin only)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}
