import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, role, firstName, lastName } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        password: passwordHash, // Populate old password field for database constraint compatibility
        role: role || Role.CANDIDATE,
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Remove password and passwordHash before returning
    const { passwordHash: _, password: __, ...result } = user;
    return result;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash: _, password: __, ...result } = user;
    return result;
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: parseInt(userId, 10) },
    });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: parseInt(userId, 10) },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return this.prisma.profile.update({
      where: { userId: parseInt(userId, 10) },
      data: updateProfileDto,
    });
  }

  async findAll(role?: Role) {
    const where = role ? { role } : {};
    const users = await this.prisma.user.findMany({
      where,
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ passwordHash: _, password: __, ...user }) => user);
  }

  async updateRole(id: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const updated = await this.prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { role },
      include: { profile: true },
    });
    const { passwordHash: _, password: __, ...result } = updated;
    return result;
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id: parseInt(id, 10) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id: parseInt(id, 10) } });
    return { success: true, message: 'User deleted successfully' };
  }
}
