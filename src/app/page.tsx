import Link from "next/link";
import Garden from "@/app/components/Garden";

export default function Home() {
  return (
    <main
      className="p-4 sm:p-6 max-w-7xl m-auto w-full flex flex-col gap-4 justify-start items-start"
      style={{ minHeight: "100dvh" }}
    >
      <h1 className="text-4xl font-medium">Tiny Community Garden</h1>
      <p className="max-w-xl pb-6">
        Plant a seed and see it evolve! See the same garden in other browsers!
        This demo shows{" "}
        <Link href="https://yjs.dev" className="underline">
          Yjs
        </Link>{" "}
        syncing document state, and PartyKit updating the shared doc
        independently of the clients.
      </p>
      <Garden />
    </main>
  );
}
