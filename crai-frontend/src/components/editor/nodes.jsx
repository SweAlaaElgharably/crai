import { Node, mergeAttributes } from "@tiptap/core";
import Image from "@tiptap/extension-image";

export const Video = Node.create({name: "video", group: "block", atom: true, 
    addAttributes() {return { src: { default: null },
        align: {default: "left", parseHTML: (element) => element.getAttribute("data-align") || "left", renderHTML: (attributes) => ({ "data-align": attributes.align }),},};},
    parseHTML() {return [{ tag: "video[src]" }];},
    renderHTML({ HTMLAttributes }) {return ["video", mergeAttributes(HTMLAttributes, { controls: "true", controlsList: "nodownload", draggable: "false", class: "select-none", })];},
    addCommands() {return {setVideo: (src) => ({ commands }) => commands.insertContent({ type: this.name, attrs: { src } }),};},
});

export const Pdf = Node.create({name: "pdf", group: "block", atom: true,
    addAttributes() {return {src: { default: null }, name: { default: "ملف PDF" },
        align: {
                default: "left",
                parseHTML: (element) => element.getAttribute("data-align") || "left",
                renderHTML: (attributes) => ({ "data-align": attributes.align }),
        },
    };},
    parseHTML() {return [{ tag: 'div[data-type="pdf"]' }];},
    renderHTML({ HTMLAttributes }) {return ["div", mergeAttributes(HTMLAttributes, { "data-type": "pdf", class: "w-full h-15 flex items-center p-2 select-none" }),["a", { href: HTMLAttributes.src, target: "_blank", rel: "noopener noreferrer", class:"bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg shadow-lg shadow-primary/20" }, `📄 ${HTMLAttributes.name}`],];},
    addCommands() {
        return {
            setPdf:(src, name) =>({ commands }) => commands.insertContent({ type: this.name, attrs: { src, name } }),
        };
    },
});

export const AlignedImage = Image.extend({
    addAttributes() {
        return {...this.parent?.(),
            align: {
                default: "left",
                parseHTML: (element) => element.getAttribute("data-align") || "left",
                renderHTML: (attributes) => ({ "data-align": attributes.align }),
            },
        };
    },
    renderHTML({ HTMLAttributes }) {return ["img", mergeAttributes(HTMLAttributes, {draggable: "false", class: "select-none",}),];},
});