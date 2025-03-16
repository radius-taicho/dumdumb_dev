import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export type UserWithoutPassword = Omit<User, 'password'>;

// ユーザー登録
export async function registerUser(email: string, password: string): Promise<UserWithoutPassword | null> {
  try {
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return null;
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 10);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    // パスワードを除外したユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Register error:', error);
    return null;
  }
}

// ユーザーログイン
export async function loginUser(email: string, password: string): Promise<UserWithoutPassword | null> {
  try {
    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    // パスワード検証
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // パスワードを除外したユーザー情報を返す
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// JWTトークン作成
export function generateToken(user: UserWithoutPassword): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// トークン検証
export function verifyToken(token: string): UserWithoutPassword | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserWithoutPassword;
    return decoded;
  } catch (error) {
    return null;
  }
}

// ユーザーID取得
export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}
