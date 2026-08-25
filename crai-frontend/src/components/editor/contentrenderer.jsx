"use client";

const alignClass = (align) => {
    if (align === "center") return "mx-auto";
    if (align === "right") return "ml-auto";
    return "mr-auto";
};

function TextWithMarks({ text, marks }) {
    let node = text;
    if (!marks?.length) return node;
    for (let i = marks.length - 1; i >= 0; i--) {
        const mark = marks[i];
        if (mark.type === "bold") node = <strong>{node}</strong>;
        else if (mark.type === "italic") node = <em>{node}</em>;
        else if (mark.type === "underline") node = <u>{node}</u>;
        else if (mark.type === "strike") node = <s>{node}</s>;
        else if (mark.type === "code") node = <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm">{node}</code>;
    }
    return node;
}

function NodeView({ node }) {
    const children = node.content?.map((child, index) => <NodeView key={index} node={child} />);

    switch (node.type) {
        case "text":
            return <TextWithMarks text={node.text} marks={node.marks} />;
        case "hardBreak":
            return <br />;
        case "paragraph":
            return <p className="mb-1">{children}</p>;
        case "heading": {
            const level = node.attrs?.level || 2;
            const Tag = `h${level}`;
            const size = level === 1 ? "text-3xl" : level === 2 ? "text-2xl" : "text-xl";
            return <Tag className={`${size} font-semibold mt-5 mb-2`}>{children}</Tag>;
        }
        case "bulletList":
            return <ul className="list-disc ps-8 mb-1">{children}</ul>;
        case "orderedList":
            return <ol className="list-decimal ps-8 mb-1">{children}</ol>;
        case "listItem":
            return <li className="m-0">{children}</li>;
        case "blockquote":
            return <blockquote className="border-s-4 border-gray-200 ps-4 my-3 text-gray-600">{children}</blockquote>;
        case "codeBlock":
            return (
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 my-3 overflow-x-auto text-sm">
                    <code>{node.content?.map((c) => c.text).join("")}</code>
                </pre>
            );
        case "horizontalRule":
            return <hr className="my-5 border-gray-100" />;
        case "image":
            return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={node.attrs?.src}
                    alt={node.attrs?.alt || ""}
                    data-align={node.attrs?.align}
                    draggable={false}
                    className={`max-w-[80%] rounded-xl my-2 block select-none ${alignClass(node.attrs?.align)}`}
                />
            );
        case "video":
            return (
                <video
                    src={node.attrs?.src}
                    controls
                    controlsList="nodownload"
                    data-align={node.attrs?.align}
                    draggable={false}
                    className={`max-w-[80%] rounded-xl my-2 block select-none ${alignClass(node.attrs?.align)}`}
                />
            );
        case "pdf":
            return (
                <div
                    data-type="pdf"
                    data-align={node.attrs?.align}
                    className="w-full flex items-center justify-center p-2 select-none"
                >
                    <a
                        href={node.attrs?.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary hover:bg-primary/80 text-white py-2 px-4 rounded-lg shadow-lg shadow-primary/20"
                    >
                        {`📄 ${node.attrs?.name || "PDF"}`}
                    </a>
                </div>
            );
        default:
            return children ?? null;
    }
}

export default function ContentRenderer({ doc }) {
    if (!doc?.content?.length) return null;
    return (
        <>
            {doc.content.map((node, index) => (
                <NodeView key={index} node={node} />
            ))}
        </>
    );
}
