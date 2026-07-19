"use client";
import { MenuItem, Button, TextField } from "@mui/material";
import { useTranslations, useLocale } from "next-intl";
import { useEffect, useState } from "react";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import alaa from "@/assets/images/alaa-avatar.jpg";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FaFilter, FaSearch, FaTrashAlt } from "react-icons/fa";

export default function Explore() {
    const locale = useLocale();
    const t = useTranslations("");
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [contents, setContents] = useState([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();    
    const [filter, setFilter] = useState({category_id: searchParams.get("category_id") ?? "", subcategory_id: searchParams.get("subcategory_id") ?? ""});    
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const getCategories = async () => {
            const response = await fetch(`/api/categories`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setCategories(data.data);
            }
        }
        const getSubCategories = async () => {
            const response = await fetch(`/api/subcategories`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                setSubCategories(data.data);
            }
        }
        getCategories();
        getSubCategories();
    }, []);
    useEffect(() => {
        const getContents = async () => {
            const response = await fetch(`/api/content/contentpreview?${searchParams.toString()}`, {method: "GET"});
            if (response.ok) {
                const data = await response.json();
                console.log(data)
                setContents(data.data.results);
            }
        }
        getContents();
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
        setFilter({category_id: "", subcategory_id: ""});
        const params = new URLSearchParams(searchParams.toString());
        ["category_id", "subcategory_id", "page", "search"].forEach((key) => params.delete(key));
        router.replace(`${pathname}?${params.toString()}`);
    }
    return (
        <>
            <div className="max-w-350 w-full px-4 py-16 mx-auto flex flex-col items-center justify-center gap-4">
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
                    <TextField className="bg-white" id="category_id" select label="Categories" value={filter.category_id} onChange={handleChange("category_id")} size="small">
                            <MenuItem value="All">{locale == "ar" ? "الكل" : "All"}</MenuItem>
                            {categories.map((c) => (<MenuItem key={c.id} value={c.id}>{locale == "ar" ? c.arabic_title : c.english_title}</MenuItem>))}
                        </TextField>
                        <TextField className="bg-white" id="subcategory_id" select label="Sub Categories" value={filter.subcategory_id} onChange={handleChange("subcategory_id")} size="small">
                            <MenuItem value="All">{locale == "ar" ? "الكل" : "All"}</MenuItem>
                            {subCategories.map((c) => (<MenuItem key={c.id} value={c.id}>{locale == "ar" ? c.arabic_title : c.english_title}</MenuItem>))}
                        </TextField>
                        <Button variant="contained" className="flex-1 !bg-primary" onClick={applyFilter}>{locale == "ar" ? "تطبيق": "Apply"}</Button>
                    </div>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {contents.map((content) => (
                        <Link key={content.id} href={`/content/${content.slug}`} className="flex flex-col overflow-hidden rounded-xl border border-[#e6e7f2] bg-white justify-start items-start transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_5px_5px_rgba(32,36,69,0.05)]">
                            <div className="relative w-full aspect-1/1 overflow-hidden bg-primary">
                                <img src={content.image || logo.src} alt={content.slug} className="w-full h-full"></img>
                            </div>
                            <div className="flex flex-col items-start justify-start px-4 py-2">
                                <p className="font-semibold text-lg">{locale == "en" ? content.english_title : content.arabic_title}</p>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2 w-full">
                                <div className="flex items-center gap-2">
                                    <div className="relative w-[30px] h-[30px] rounded-full overflow-hidden">
                                        <img src={content?.owner_avatar || alaa.src} alt="Create By" className="w-full h-full"></img>
                                    </div>
                                    <p>{content?.owner_first_name || "Admin"} {content?.owner_last_name || "Alaa"}</p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <p className="text-sm line-through">{content?.fake_price}</p>
                                    <p className="font-semibold text-lg">{content?.real_price}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>      
        </>
    );
}




