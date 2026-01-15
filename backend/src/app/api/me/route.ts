import { NextRequest, NextResponse } from 'next/server';
import userService from '@/core/services/user-service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user without sensitive data
    return NextResponse.json({
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      is_verified: user.is_verified,
      created_at: user.created_at,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

