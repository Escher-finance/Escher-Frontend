"use client";

import BabylonHome from "@/components/babylon/babylon";
import Header from "@/components/global/header";
import LdrsAnimation from "@/components/global/ldrsAnimation";
import { useAuth } from "@/components/provider/auth";
import { ValidatorBabylonPage, ValidatorUnionPage } from "@/components/validator/validator";

export default function Home() {
  const { user, logout } = useAuth();

  if (!user) return (
    <div className="w-full h-screen flex items-center justify-center">
      <LdrsAnimation />
    </div>
  );

  return (
    <div className="container px-4 md:px-0 mx-auto py-10 flex flex-col">
      <Header
        role={user.role}
        onLogout={logout}
      />

      {user.role === "admin" &&
        <BabylonHome />
      }

      {user.role === "validator" &&
        <ValidatorBabylonPage
          address={user.email}
        />
      }

      {user.role === "validator-union" &&
        <ValidatorUnionPage
          address={user.email}
        />
      }
      <div>@Escher Finance</div>
    </div >
  );
}
