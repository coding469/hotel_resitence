import Link from "next/link";

export const instant = false;

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream px-5 text-center">
      <h1 className="font-serif text-3xl font-semibold">Page introuvable</h1>
      <p className="text-espresso/70">Cette page n&apos;existe pas ou plus.</p>
      <Link href="/" className="font-semibold text-terracotta underline underline-offset-4">
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}
