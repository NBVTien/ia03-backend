import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

interface User {
  id?: string;
  email: string;
  password: string;
  created_at: string;
}

interface UserWithoutPassword {
  id?: string;
  email: string;
  created_at: string;
}

@Injectable()
export class UserService {
  private supabase: SupabaseClient<any>;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException('Error checking user existence');
    }

    return data as User | null;
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserWithoutPassword> {
    const { email, password } = createUserDto;

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        `An account with email ${email} already exists. Please login instead or use a different email address.`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = await this.supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException('Error creating user');
    }

    const userData = data as User;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...userWithoutPassword } = userData;
    return userWithoutPassword;
  }
}
