"use client";
import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Video, Pdf, AlignedImage } from "./nodes";
import Toolbar from "./toolbar";
import Placeholder from "@tiptap/extension-placeholder";
import { useLocale } from "next-intl";

export default function ContentEditor({ initialContent = "", onReady }) {
    const locale = useLocale();
    const editor = useEditor({
        extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] }, bulletList: true, orderedList: true,
            blockquote: true, codeBlock: true, horizontalRule: true, }), AlignedImage, Video, Pdf,
            Placeholder.configure({ placeholder: locale === "ar" ? "ابدأ الكتابة…" : "Start writing…", }),
            Underline, TextAlign.configure({types: ["heading", "paragraph"],}),
        ],
        content: initialContent,
        immediatelyRender: false,
    });
    useEffect(() => {
        if (editor && onReady) onReady(editor);
    }, [editor, onReady]);
    if (!editor) return null;
    const proseClasses = `
        p-2 outline-none min-h-[300px] leading-[1.75] text-neutral-900
        [&_.ProseMirror]:outline-none
        [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mt-6 [&_h1]:mb-3
        [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2
        [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
        [&_p]:mb-1 [&>*:first-child]:mt-0
        [&_strong]:font-medium 
        [&_em]:italic
        [&_u]:underline
        [&_s]:line-through
        [&_ul]:list-disc [&_ul]:ps-8 [&_ul]:mb-1 
        [&_ol]:list-decimal [&_ol]:ps-8 [&_ol]:mb-1
        [&_li]:m-0
        [&_li_p]:mb-0
        [&_img]:max-w-[80%] [&_img]:rounded-xl [&_img]:my-2 [&_img]:block
        [&_img[data-align=left]]:mr-auto [&_img[data-align=left]]:ml-0
        [&_img[data-align=center]]:mx-auto
        [&_img[data-align=right]]:ml-auto [&_img[data-align=right]]:mr-0
        [&_video]:max-w-[80%] [&_video]:rounded-xl [&_video]:my-2 [&_video]:block
        [&_video[data-align=left]]:mr-auto [&_video[data-align=left]]:ml-0
        [&_video[data-align=center]]:mx-auto
        [&_video[data-align=right]]:ml-auto [&_video[data-align=right]]:mr-0
        [&_div[data-type=pdf][data-align=left]]:justify-start
        [&_div[data-type=pdf][data-align=center]]:justify-center
        [&_div[data-type=pdf][data-align=right]]:justify-end

        [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-[#FF6154] [&_img.ProseMirror-selectednode]:outline-offset-2
        [&_video.ProseMirror-selectednode]:outline [&_video.ProseMirror-selectednode]:outline-2 [&_video.ProseMirror-selectednode]:outline-[#FF6154] [&_video.ProseMirror-selectednode]:outline-offset-2
        [&_div[data-type=pdf].ProseMirror-selectednode]:outline [&_div[data-type=pdf].ProseMirror-selectednode]:outline-2 [&_div[data-type=pdf].ProseMirror-selectednode]:outline-[#FF6154] [&_div[data-type=pdf].ProseMirror-selectednode]:outline-offset-2
        
        [&_img]:select-none [&_video]:select-none
        [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]
        [&_.is-editor-empty:first-child]:before:text-neutral-400
        [&_.is-editor-empty:first-child]:before:pointer-events-none
        [&_.is-editor-empty:first-child]:before:h-0
        ${locale === "ar"
            ? "[&_.is-editor-empty:first-child]:before:float-right"
            : "[&_.is-editor-empty:first-child]:before:float-left"}
    `;
    return (
        <>
            <Toolbar editor={editor} />
            <div onContextMenu={(e) => e.preventDefault()}>
                <EditorContent editor={editor} dir={locale === "ar" ? "rtl" : "ltr"} className={proseClasses} />
            </div>
        </>
    );
}

