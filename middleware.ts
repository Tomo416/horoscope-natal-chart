import { NextResponse, type NextRequest } from "next/server";

/**
 * 料金の不正利用を防ぐためのガード
 * 1. サイト全体（画面・API）にBasic認証をかける（APP_USER / APP_PASSWORD）
 *    → パスワードを知っている人しか外部APIを呼べない。未設定の本番環境では全アクセスを拒否（fail-closed）。
 * 2. APIへのアクセス回数をIPごとに制限（RATE_LIMIT_PER_HOUR、既定20回/時）
 *    ※インスタンス単位のメモリ管理のため補助的な対策。主な防御は1。
 */

const hits = new Map<string, { count: number; reset: number }>();

function unauthorized() {
  return new NextResponse("認証が必要です", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="horoscope", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest) {
  const user = process.env.APP_USER ?? "guest";
  const pass = process.env.APP_PASSWORD;

  if (!pass) {
    // ローカル開発時のみパスワードなしを許可
    if (process.env.NODE_ENV !== "development") {
      return new NextResponse("APP_PASSWORD が未設定のため公開を停止しています", { status: 503 });
    }
  } else {
    const auth = req.headers.get("authorization") ?? "";
    const [scheme, encoded] = auth.split(" ");
    if (scheme !== "Basic" || !encoded) return unauthorized();
    let decoded = "";
    try { decoded = atob(encoded); } catch { return unauthorized(); }
    const i = decoded.indexOf(":");
    if (decoded.slice(0, i) !== user || decoded.slice(i + 1) !== pass) return unauthorized();
  }

  if (req.nextUrl.pathname.startsWith("/api/")) {
    const limit = Number(process.env.RATE_LIMIT_PER_HOUR ?? 20);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || h.reset < now) hits.set(ip, { count: 1, reset: now + 3600_000 });
    else if (++h.count > limit) {
      return NextResponse.json({ error: "利用回数の上限に達しました。しばらくしてからお試しください。" }, { status: 429 });
    }
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
