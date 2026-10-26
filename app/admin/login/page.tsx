"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <form action={formAction} className="w-full max-w-sm rounded-2xl border border-espresso/10 bg-paper p-8">
        <h1 className="font-serif text-xl font-semibold">Administration</h1>
        <label className="mt-6 block text-sm font-semibold" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-2 w-full rounded-lg border border-espresso/20 px-3 py-2 text-sm"
        />
        {state?.error && <p className="mt-3 text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-paper disabled:opacity-60"
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </main>
  );
}
