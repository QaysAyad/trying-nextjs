import Head from "next/head";

// We can use Metadata from next package but it is so complicated for this use case.
// import { Metadata } from "next";
interface Meta {
    name: string;
    content: string;
}

interface Props {
    /** Page title */
    title: string;
    /** Page description */
    content?: string;
    /** Page children */
    children: React.ReactNode;
    meta?: Meta[];
}

export default function HeadAndBackground({children, ...props}: Props) {
    return (
        <>
            <Head>
                <title>{props.title}</title>
                <meta name="description" content={props.content ?? "Know Patents App"} />
                <link rel="icon" href="/favicon.ico" />
                {props.meta?.map(({name, content}) => ( 
                    <meta key={name} name={name} content={content} />
                ))}
            </Head>
            <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                {children}
            </main>
        </>
    );
}
