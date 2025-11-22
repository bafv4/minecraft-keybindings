/**
 * 管理者権限チェックユーティリティ
 */

/**
 * 指定された UUID が管理者かどうかをチェック
 * 環境変数 ADMIN_UUID で管理者の UUID を設定
 */
export function isAdmin(uuid: string | undefined): boolean {
  if (!uuid) return false;
  const adminUuid = process.env.ADMIN_UUID;
  if (!adminUuid) return false;
  return uuid === adminUuid;
}

/**
 * 管理者でない場合にエラーをスロー
 */
export function requireAdmin(uuid: string | undefined): void {
  if (!isAdmin(uuid)) {
    throw new Error('管理者権限が必要です');
  }
}
