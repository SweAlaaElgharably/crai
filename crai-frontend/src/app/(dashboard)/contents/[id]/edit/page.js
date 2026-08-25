"use client";

import { use } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";
import ContentForm from "@/components/contentform";

export default function EditContent({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        if (user && user.user_type !== "influencer" && !user.is_staff) {
            router.replace("/dashboard");
        }
    }, [user, router]);

    return <ContentForm contentId={id} />;
}
