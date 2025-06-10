import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuthCredentialDto } from './dto/auth-credentials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialDto: AuthCredentialDto): Promise<void> {
    return this.usersRepository.createUser(authCredentialDto);
  }

  async signIn(
    authCredentialDto: AuthCredentialDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialDto;
    const user = await this.usersRepository.getUser(username);

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      const payload: JwtPayload = { username };
      const accessToken = await this.jwtService.signAsync(payload);
      return { accessToken };
    }
    throw new UnauthorizedException(`Password does not match`);
  }
}
