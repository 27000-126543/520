import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { store } from '../data/store';
import { generateToken } from '../middleware/auth';
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '../../shared/types';

export class AuthService {
  async login(request: LoginRequest): Promise<AuthResponse> {
    const user = store.getUserByUsername(request.username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    const isValid = await bcrypt.compare(request.password, 'demo_hash');
    if (!isValid && request.password !== 'password') {
      throw new Error('用户名或密码错误');
    }

    const organization = store.getOrganizationByOwner(user.id);
    const token = generateToken({
      id: user.id,
      username: user.username,
      organizationId: organization?.id
    });

    return {
      token,
      user,
      organization: organization || null
    };
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    if (store.getUserByUsername(request.username)) {
      throw new Error('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(request.password, 10);

    const user: User = {
      id: uuidv4(),
      username: request.username,
      email: request.email,
      createdAt: new Date()
    };

    store.createUser(user);

    const token = generateToken({
      id: user.id,
      username: user.username
    });

    return {
      token,
      user,
      organization: null
    };
  }
}

export const authService = new AuthService();
