import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase Service Role client for administrative bridge operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wwxuiexvgsmweuzddsea.supabase.co';
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = await req.json();
    const { phoneNumber, firebaseUid } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Format sanitized phone and deterministic internal email
    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const phoneDigits = cleanPhone.replace('+', '');
    const internalEmail = `${phoneDigits}@belzo.internal`;
    // Deterministic internal password derived for bridging
    const bridgePassword = `BelzoBridge#${phoneDigits}#${firebaseUid ? firebaseUid.substring(0, 10) : '2026'}`;

    let supabaseUserId: string | null = null;
    let userRole = 'customer';

    // 1. Check if profile already exists in public.profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existingProfile) {
      supabaseUserId = existingProfile.id;
      userRole = existingProfile.role || 'customer';
    }

    // 2. Ensure auth.users record exists
    let authUser = null;
    if (supabaseUserId) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(supabaseUserId);
      authUser = userData?.user;
    }

    if (!authUser) {
      // Try creating user in Supabase auth
      const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: internalEmail,
        email_confirm: true,
        phone: cleanPhone,
        phone_confirm: true,
        password: bridgePassword,
        user_metadata: {
          phone: cleanPhone,
          role: userRole,
          firebase_uid: firebaseUid,
        },
      });

      if (!createError && createData.user) {
        authUser = createData.user;
        supabaseUserId = createData.user.id;
      } else if (createError && createError.message.includes('already registered')) {
        // Update user password to bridgePassword so we can issue session
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const found = listData?.users.find((u) => u.email === internalEmail || u.phone === cleanPhone);
        if (found) {
          authUser = found;
          supabaseUserId = found.id;
          await supabaseAdmin.auth.admin.updateUserById(found.id, {
            password: bridgePassword,
          });
        }
      }
    } else {
      // Update password to ensure sign-in succeeds
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password: bridgePassword,
      });
    }

    // 3. Ensure profile in public.profiles is present
    if (supabaseUserId) {
      await supabaseAdmin.from('profiles').upsert(
        {
          id: supabaseUserId,
          phone: cleanPhone,
          role: userRole,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }

    // 4. Generate direct active session for mobile client
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.signInWithPassword({
        email: internalEmail,
        password: bridgePassword,
      });

    if (sessionError || !sessionData?.session) {
      // Fallback: generate magic link token
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: internalEmail,
      });

      return NextResponse.json(
        {
          success: true,
          role: userRole,
          userId: supabaseUserId,
          phone: cleanPhone,
          magicLink: linkData?.properties?.action_link,
          session: null,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_in: sessionData.session.expires_in,
          expires_at: sessionData.session.expires_at,
          token_type: sessionData.session.token_type,
          user: sessionData.session.user,
        },
        role: userRole,
        userId: supabaseUserId,
        phone: cleanPhone,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('Supabase Auth Bridge Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Auth Bridge Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}
