"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardDispatcher() {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.replace("/#portal");
          return;
        }

        const role = data.user.role;
        if (role === "admin" || role === "partner") {
          router.replace("/dashboard/admin");
        } else if (role === "advocate") {
          router.replace("/dashboard/advocate");
        } else {
          router.replace("/dashboard/associate");
        }
      })
      .catch(() => {
        router.replace("/#portal");
      });
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">
      Directing to your Chamber Workspace...
    </div>
  );
}
