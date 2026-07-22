import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">Vantage</h1>
        <p className="mt-2 text-slate-500">Giriş yapıldı: {user?.email}</p>
        <button
          onClick={() => signOut()}
          className="mt-4 rounded bg-slate-800 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}
