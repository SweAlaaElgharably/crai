"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

export default function UserProvider({ children }) {
    const setUser = useUserStore((state) => state.setUser);
    useEffect(() => {
        async function loadUser() {
            const res = await fetch("/api/me", {
                method: "GET",
                credentials: "include",
            });
            const data = await res.json();
            if (res.ok) setUser(data);
        }
        loadUser();
    }, []);
    return children;
}