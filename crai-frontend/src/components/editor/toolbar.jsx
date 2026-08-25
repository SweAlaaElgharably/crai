"use client";
import { useRef, useState } from "react";
import { useEditorState } from "@tiptap/react";
import { LuHeading1, LuHeading2, LuHeading3, LuPilcrow, LuList, LuListOrdered } from "react-icons/lu";
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaAlignLeft, FaAlignCenter, FaAlignRight, FaImage, FaVideo, FaFilePdf } from "react-icons/fa6";
import { LuLoaderCircle } from "react-icons/lu";
import { extractApiError } from "@/lib/errors";

export default function Toolbar({ editor }) {
    const fileRef = useRef(null);
    const editorState = useEditorState({
        editor,
        selector: (ctx) => ({
            bold: ctx.editor.isActive("bold"),
            italic: ctx.editor.isActive("italic"),
            underline: ctx.editor.isActive("underline"),
            strike: ctx.editor.isActive("strike"),
            heading1: ctx.editor.isActive("heading", { level: 1 }),
            heading2: ctx.editor.isActive("heading", { level: 2 }),
            heading3: ctx.editor.isActive("heading", { level: 3 }),
            paragraph: ctx.editor.isActive("paragraph"),
            bulletList: ctx.editor.isActive("bulletList"),
            orderedList: ctx.editor.isActive("orderedList"),
            alignLeft: ctx.editor.isActive({ textAlign: "left" }),
            alignCenter: ctx.editor.isActive({ textAlign: "center" }),
            alignRight: ctx.editor.isActive({ textAlign: "right" }),
            image: ctx.editor.isActive("image"),
            video: ctx.editor.isActive("video"),
            pdf: ctx.editor.isActive("pdf"),
        }),
    });
    const pendingType = useRef(null);
    const [uploading, setUploading] = useState(false);
    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch("/api/media/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            });
            const result = await response.json();
            if (!response.ok || !result?.url) {
                throw new Error(extractApiError(result, "Upload failed"));
            }
            const url = result.url;
            if (pendingType.current === "image") editor.chain().focus().setImage({ src: url }).run();
            if (pendingType.current === "video") editor.chain().focus().setVideo(url).run();
            if (pendingType.current === "pdf") editor.chain().focus().setPdf(url, file.name).run();
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };
    const pick = (type, accept) => {
        pendingType.current = type;
        fileRef.current.accept = accept;
        fileRef.current.click();
    };
    const btnClass = (isActive) =>
        `w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
        isActive ? "bg-[#FFF1EF] text-[#FF6154]" : "text-neutral-700 hover:bg-neutral-100"}
    `;

    const setAlign = (align) => {
        if (editor.isActive("image")) {editor.chain().focus().updateAttributes("image", { align }).run();}
        else if (editor.isActive("video")) {editor.chain().focus().updateAttributes("video", { align }).run();}
        else if (editor.isActive("pdf")) {editor.chain().focus().updateAttributes("pdf", { align }).run();}
        else {editor.chain().focus().setTextAlign(align).run();}
    };
    const isAlignActive = (align) => {
        if (editor.isActive("image")) return editor.getAttributes("image").align === align;
        if (editor.isActive("video")) return editor.getAttributes("video").align === align;
        if (editor.isActive("pdf")) return editor.getAttributes("pdf").align === align;
        return editor.isActive({ textAlign: align });
    };
    if (!editor) return null;
    return (
        <div className="flex justify-center items-center sticky top-0 z-100 bg-white">
            <div className="flex gap-1 p-2">
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={btnClass(editorState.heading1)}><LuHeading1 /> </button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={btnClass(editorState.heading2)}><LuHeading2 /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={btnClass(editorState.heading3)}><LuHeading3 /></button>
                <button type="button" onClick={() => editor.chain().focus().setParagraph().run()}
                    className={btnClass(editorState.paragraph)}><LuPilcrow /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
                    className={btnClass(editorState.bold)}><FaBold /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={btnClass(editorState.italic)}><FaItalic /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} 
                    className={btnClass(editorState.underline)}><FaUnderline /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} 
                    className={btnClass(editorState.strike)}><FaStrikethrough /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    className={btnClass(editorState.bulletList)}><LuList /></button>
                <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    className={btnClass(editorState.orderedList)}><LuListOrdered /></button>
                <button type="button" onClick={() => setAlign("left")} 
                    className={btnClass(isAlignActive("left"))}><FaAlignLeft /></button>
                <button type="button" onClick={() => setAlign("center")} 
                    className={btnClass(isAlignActive("center"))}><FaAlignCenter /></button>
                <button type="button" onClick={() => setAlign("right")} 
                    className={btnClass(isAlignActive("right"))}><FaAlignRight /></button>
                {uploading ? (
                    <span className="w-8 h-8 flex items-center justify-center text-primary animate-spin"><LuLoaderCircle /></span>
                ) : (
                    <>
                        <button type="button" onClick={() => pick("image", "image/*")}
                            className={btnClass(editorState.image)}><FaImage /></button>
                        <button type="button" onClick={() => pick("video", "video/*")}
                            className={btnClass(editorState.video)}><FaVideo /></button>
                        <button type="button" onClick={() => pick("pdf", "application/pdf")}
                            className={btnClass(editorState.pdf)}><FaFilePdf /></button>
                    </>
                )}
                <input ref={fileRef} type="file" onChange={handleFile} style={{ display: "none" }} />
            </div>
        </div>
  );
}