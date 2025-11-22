import { LoginOrRegisterForm } from '@/components/LoginOrRegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン / 登録 | MCSRer Hotkeys',
  description: 'MCSRer Hotkeysにログインまたは新規登録',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full px-4">
        <div className="bg-card p-8 rounded-2xl border border-border shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-light via-secondary to-foreground bg-clip-text text-transparent mb-2">
              登録 / 編集
            </h1>
            <p className="text-sm text-muted-foreground">
              MCIDを入力すると、登録済みの場合はログイン、未登録の場合は新規登録されます
            </p>
          </div>

          <LoginOrRegisterForm />
        </div>
      </div>
    </div>
  );
}
