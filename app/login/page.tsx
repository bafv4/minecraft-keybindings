import { LoginOrRegisterForm } from '@/components/LoginOrRegisterForm';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full">
        <div className="bg-[rgb(var(--card))] p-8 rounded-lg border border-[rgb(var(--border))]">
          <h1 className="text-2xl font-semibold mb-2">登録 / 編集</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
            MCIDを入力すると、登録済みの場合はログイン、未登録の場合は新規登録されます
          </p>

          <LoginOrRegisterForm />
        </div>
      </div>
    </div>
  );
}
