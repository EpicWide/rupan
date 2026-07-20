import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export type FmaAuthorizedRole =
  | "clinician"
  | "survivor";

export type AuthorizedFmaUser = {
  id: string;
  role: FmaAuthorizedRole;
  localDevelopment: boolean;
};

export class AuthError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

function getBearerToken(request: Request): string | null {
  const authorization =
    request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const match = authorization.match(
    /^Bearer\s+(.+)$/i,
  );

  return match?.[1]?.trim() || null;
}

export function createSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serverKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serverKey) {
    throw new Error(
      "Supabase server environment variables are missing.",
    );
  }

  return createClient(
    supabaseUrl,
    serverKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}

export async function requireFmaUser(
  request: Request,
): Promise<AuthorizedFmaUser> {
  /*
   * 로컬 모델 테스트 전용입니다.
   * 프로덕션에서는 반드시 FMA_REQUIRE_AUTH=true로 설정합니다.
   */
  if (process.env.FMA_REQUIRE_AUTH === "false") {
    return {
      id: "local-development",
      role: "clinician",
      localDevelopment: true,
    };
  }

  const accessToken = getBearerToken(request);

  if (!accessToken) {
    throw new AuthError(
      401,
      "Authentication is required.",
    );
  }

  const supabase = createSupabaseAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(accessToken);

  if (userError || !user) {
    console.error("[FMA auth] Invalid session:", {
      message: userError?.message,
    });

    throw new AuthError(
      401,
      "The session is invalid or expired.",
    );
  }

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("[FMA auth] Profile lookup failed:", {
      userId: user.id,
      code: profileError.code,
      message: profileError.message,
    });

    throw new Error(
      "Could not verify the account role.",
    );
  }

  const role = profile?.role;

  /*
   * Survivor와 clinician 모두 허용합니다.
   * researcher, caregiver, other 등은 차단합니다.
   */
  if (
    role !== "clinician" &&
    role !== "survivor"
  ) {
    throw new AuthError(
      403,
      "Survivor or clinician access is required.",
    );
  }

  return {
    id: user.id,
    role,
    localDevelopment: false,
  };
}
