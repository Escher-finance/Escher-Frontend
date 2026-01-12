"use client";

import Header from "@/components/global/header";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import Participants from "@/components/luckydraw/participants";
import TotalTickets from "@/components/luckydraw/total-tickets";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  email: string;
  role: string;
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'GET' });
    router.replace('/login');
  };

  useEffect(() => {
    const cookieMap = Object.fromEntries(
      document.cookie.split('; ').map((c) => c.split('='))
    );

    if (cookieMap['auth'] !== 'true' || !cookieMap['user']) {
      router.replace('/login');
    } else {
      try {
        const userData = JSON.parse(decodeURIComponent(cookieMap['user']));
        setUser(userData);
      } catch {
        router.replace('/login');
      }
    }
  }, [router]);


  if (!user) return (
    <div className="w-full h-screen flex items-center justify-center">
      <LdrsAnimation />
    </div>
  );

  return (
    <div className="container px-4 md:px-0 mx-auto py-10 flex flex-col">
      <Header
        role={user.role}
        onLogout={handleLogout}
      />

      {user.role === "admin" &&

        <div className="flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-4 mt-8 gap-4">
            <TotalTickets />
          </div>
          <Participants />
        </div>
      }
    </div >
  );
}
