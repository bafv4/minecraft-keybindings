import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12">
      <div className="max-w-md w-full space-y-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>ログイン</span>
        </Link>

        <div className="bg-[rgb(var(--card))] p-8 rounded-lg border border-[rgb(var(--border))]">
          <h1 className="text-2xl font-semibold mb-6">新規登録</h1>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
