import { signIn } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-lg border shadow-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">ログイン</h1>
        <p className="text-gray-600 mb-6 text-center">
          Microsoftアカウントでログインして、あなたの操作設定を登録・編集できます
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id", { redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Microsoftアカウントでログイン
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-500 text-center">
          <p>※ Minecraftアカウントと連携されたMicrosoftアカウントでログインしてください</p>
        </div>
      </div>
    </div>
  );
}
