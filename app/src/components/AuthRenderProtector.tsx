
import { signIn, useSession } from "next-auth/react";

export default function AuthRenderProtector({ children }: { children: React.ReactNode }) {
  const { data: sessionData } = useSession();
  return sessionData ? children :(
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        <span>You need to login to get access to this page</span>
      </p>
      <br />
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={() => void signIn()}
      >
        {"Sign in"}
      </button>
    </div>
  );
}