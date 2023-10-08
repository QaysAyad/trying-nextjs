import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import HeadAndBackground from "~/components/HeadAndBackground";

export default function Home() {
  return (
    <HeadAndBackground
      title={"Know Patents"}
      content={"Know Patents App"}
    >
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Welcome to <span className="text-[hsl(280,100%,70%)]">Know Patents</span> App
          </h1>
          <AuthShowcase />
        </div>
      </div>
    </HeadAndBackground>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.email}</span>}
      </p>
      {sessionData && <PagesLinks />}
      <br />
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}

function PagesLinks() {
  const links = [
    { href: "/patients", text: "Patients" },
    { href: "/compare", text: "Compare Patients" },
  ];
  return (
    <div className="flex flex-col items-center justify-center w-80 gap-4 text-white">
      <br />
      We have two pages for you to explore
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex flex-col items-center justify-center rounded-lg text-sm h-12 font-semibold w-full bg-white/10 text-white hover:bg-slate-700"
        >
          {link.text}
        </Link>
      ))}
    </div>
  );
}