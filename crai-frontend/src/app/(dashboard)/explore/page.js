"use client";
import { MenuItem, Button, TextField, Pagination } from "@mui/material";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FaFilter, FaSearch, FaTrashAlt } from "react-icons/fa";

export default function Explore() {
    const locale = useLocale();
    const t = useTranslations("");
    const [categories, setCategories] = useState([]);
    const [creators, setCreators] = useState([]);
    const [pagination, setPagination] = useState({count: 0, pageSize: 48});
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();    
    const [filter, setFilter] = useState({interest: searchParams.get("interest") ?? ""});    
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const getCategories = async () => {
            const response = await fetch(`/api/categories`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                setCategories(data.data);
            }
        }
        getCategories();
    }, []);
    useEffect(() => {
        const getCreators = async () => {
            const response = await fetch(`/api/influencers?${searchParams.toString()}`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setCreators(data.data.results);
                setPagination({count: data.data.count, pageSize: 48});
            }
        }
        getCreators();
    }, [searchParams])
    const handleChange = (key) => (valueOrEvent) => {
        const value = valueOrEvent?.target ? valueOrEvent.target.value : valueOrEvent;
        setFilter((prev) => ({...prev, [key]: value}));
    };
    const [search, setSearch] = useState(() => searchParams.get("search") ?? "");
    const openFilters = () => {setOpen((prev) => !prev);}
    const applySearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        if (search === "" || search === null) {params.delete("search");} 
        else {params.set("search", search);}
        router.replace(`${pathname}?${params.toString()}`);
    }
    const applyFilter = () => {
        setOpen(false);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        Object.entries(filter).forEach(([key, value]) => {
            if (value === "All" || value === "" || value === null) {params.delete(key);} 
            else {params.set(key, value);}
        });
        router.replace(`${pathname}?${params.toString()}`);
    }
    const clear = () => {
        setOpen(false);
        setSearch("");
        setFilter({interest: ""});
        const params = new URLSearchParams(searchParams.toString());
        ["interest", "page", "search"].forEach((key) => params.delete(key));
        router.replace(`${pathname}?${params.toString()}`);
    }
    return (
        <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto px-4 py-8">
            <div className="flex gap-1 flex-wrap w-full relative">
                <div className="flex flex-1 justify-start items-center">
                    <input type="text" placeholder={locale == "ar" ? "بحث": "Search"} className="w-full h-[40px] px-2 rounded-s-sm rounded-e-none border-primary border border-1 outline-none" value={search ?? ""} onChange={(e) => {setSearch(e.target.value)}} onKeyDown={(e) => {if (e.key === "Enter") {applySearch();}}}/>
                    <button className="flex justify-center items-center w-10 h-10 rounded-sm bg-primary text-white cursor-pointer rounded-s-none" onClick={applySearch}><FaSearch /></button>
                </div>
                <button onClick={clear} className="flex justify-center items-center w-10 h-10 rounded-sm bg-primary text-white cursor-pointer">
                    <FaTrashAlt />
                </button>
                <button onClick={openFilters} className="relative cursor-pointer flex justify-center items-center w-10 h-10 rounded-sm bg-primary text-white"><FaFilter /></button>
                {open && 
                <div className="flex flex-col gap-2 absolute top-full end-0 bg-white p-4 rounded-lg shadow-lg z-10 mt-1 w-50">
                    <TextField className="bg-white" id="interest" select label={locale == "ar" ? "الفئات" : "Categories"} value={filter.interest} onChange={handleChange("interest")} size="small">
                        <MenuItem value="All">{locale == "ar" ? "الكل" : "All"}</MenuItem>
                        {categories.map((c) => (<MenuItem key={c.id} value={c.id}>{locale == "ar" ? c.arabic_title ?? c.english_title : c.english_title}</MenuItem>))}
                    </TextField>
                    <Button variant="contained" className="flex-1 !bg-primary" onClick={applyFilter}>{locale == "ar" ? "تطبيق": "Apply"}</Button>
                </div>}
            </div>
            {creators?.length > 0 ? 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {creators.map((creator) => (
                    <Link key={creator.id} href={`/creators/${creator.username}`} className="flex flex-col justify-center items-start gap-1 p-2 transition duration-300 hover:bg-gray-50 rounded-lg">
                        <img src={creator.avatar || "/alaa-avatar.jpg"} alt={creator.username} className="w-full aspect-square rounded-lg"></img>
                        <p className="font-semibold text-lg">{`${creator.first_name} ${creator.last_name}`}</p>
                        <p className="text-gray-500 text-sm truncate w-full">{creator.headline}</p>
                        <p className="text-gray-500 text-sm truncate w-full">{creator.followers_count} {locale == "ar" ? "متابع" : "Follower"}</p>
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




