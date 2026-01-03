import { NextRequest, NextResponse } from 'next/server';
import userService from '@/core/services/user-service';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userServices = await userService.getUserServices(userId);
    return NextResponse.json(userServices);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { service_id, oauth_account_id, access_token, refresh_token, token_expires_at, display_name } = body;

    if (!service_id) {
      return NextResponse.json(
        { error: 'service_id is required' },
        { status: 400 }
      );
    }

    const userServiceInstance = await userService.createUserService({
      user_id: userId,
      service_id,
      oauth_account_id,
      access_token,
      refresh_token,
      token_expires_at,
      display_name,
    });

    return NextResponse.json(userServiceInstance);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

