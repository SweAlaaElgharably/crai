"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

export default function UserProvider({ children }) {
    const setUser = useUserStore((state) => state.setUser);
    useEffect(() => {
        async function loadUser() {
            const res = await fetch("/api/me");
            const data = await res.json();
            if (data.status >= 200 && data.status <= 299) setUser(data.data);
        }
        loadUser();
    }, []);
    return children;
}