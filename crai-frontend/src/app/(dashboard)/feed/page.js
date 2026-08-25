"use client";
import { MenuItem, Pagination, FormControl, Select } from "@mui/material";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function Feed() {
    const locale = useLocale();
    const t = useTranslations("");
    const [contents, setContents] = useState([]);
    const [pagination, setPagination] = useState({count: 0, pageSize: 24});
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();   
    const ordering = searchParams.get("ordering") || "-created_at"; 
    useEffect(() => {
        const getContents = async () => {
            const response = await fetch(`/api/following-contents?${searchParams.toString()}`, {method: "GET", credentials: "include"});
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setContents(data.data.results);
                setPagination({count: data.data.count, pageSize: 24});
            }
        }
        getContents();
    }, [searchParams]);
    const handleOrderingChange = (event) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("ordering", event.target.value);
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`);
    };
    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-end mb-4">
                <FormControl size="small" className="min-w-[180px]">
                    <Select value={ordering} onChange={handleOrderingChange} displayEmpty>
                        <MenuItem value="-created_at">{locale === "ar" ? "الأحدث أولًا" : "Newest First"}</MenuItem>
                        <MenuItem value="created_at">{locale === "ar" ? "الأقدم أولًا" : "Oldest First"}</MenuItem>
                    </Select>
                </FormControl>
            </div>
            {contents?.length > 0 ? 
            <div className="flex flex-col items-center justify-center gap-4">
                {contents.map((content) => (
                    <Link key={content.id} href={`/content/${content.id}`} className="w-full max-w-150 flex flex-col rounded-lg transition hover:bg-gray-50 border border-gray-200">
                        <img src={content.cover_image} alt={content.title} className="w-full aspect-video rounded-lg object-cover"/>
                        <p className="text-gray-500 text-sm px-4">{content.owner.first_name} {content.owner.last_name}</p>
                        <h2 className="font-medium text-lg px-4 w-full truncate">{content.title}</h2>
                        <div className="flex items-center justify-between px-4 py-2">
                            <p className="text-gray-400 text-sm">
                                {new Date(content.created_at).toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US")}
                            </p>
                            <span className="text-sm">
                                {content.is_free? locale === "ar" ? "مجاني" : "Free" : locale === "ar" ? "مدفوع" : "Paid"}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>: <div className="flex items-center justify-center p-4"><p>{locale == "ar" ? "لا يوجد بيانات متاحة" : "No Available Data"}</p></div>
            }
            <div className="flex items-center justify-center">
                <Pagination count={Math.ceil(pagination.count / pagination.pageSize)} shape="rounded"
                    page={Number(searchParams.get("page") || 1)}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                    onChange={(event, value) => {
                        const params = new URLSearchParams(searchParams.toString());
                        params.set("page", value);
                        router.replace(`${pathname}?${params.toString()}`);
                    }}
                    sx={{
                        "& .MuiPaginationItem-root.Mui-selected": {
                            backgroundColor: "#0bb2b0",
                            color: "#fff",
                        },
                        "& .MuiPaginationItem-root.Mui-selected:hover": {
                            backgroundColor: "#0bb2b0",
                        },
                        "& .MuiPaginationItem-previousNext svg": {
                            transform: locale === "ar" ? "scaleX(-1)" : "none",
                        },
                    }}
                />
            </div>
        </div>
    );
}