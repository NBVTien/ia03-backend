import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials are not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async findUserByEmail(email: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException('Error checking user existence');
    }

    return data;
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        `An account with email ${email} already exists. Please login instead or use a different email address.`,
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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

    const { password: _, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }
}
