export const RejectButton = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => {
    return <button
        className="rounded-full bg-red-500 p-2 px-2 font-semibold text-white no-underline transition hover:bg-red-400"
        onClick={() => onClick()}
    >
        {children}
    </button>;
}