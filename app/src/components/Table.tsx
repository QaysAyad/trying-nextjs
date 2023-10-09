export function Table({ children }: { children: React.ReactNode }) {
    return <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-200">
            {children}
        </table>
    </div>;
}

export function TableHeader({ children }: { children: React.ReactNode }) {
    return <thead className="text-xs text-gray-800 uppercase bg-violet-50 dark:bg-violet-700 dark:text-gray-300">
        {children}
    </thead>;
}

export function TableHeaderColumnCell({ children }: { children: React.ReactNode }) {
    return <th scope="col" className="px-4 py-3">
        {children}
    </th>;
}

export function TableHeaderRowCell({ children }: { children: React.ReactNode }) {
    return <th scope="row" className="px-4 py-4 font-medium text-gray whitespace-nowrap dark:text-white">
        {children}
    </th>;
}

export function TableBody({ children }: { children: React.ReactNode }) {
    return <tbody>{children}</tbody>;
}

export function TableRow({ children }: { children: React.ReactNode }) {
    return <tr>
        {children}
    </tr>;
}

export function TableDataCell({ children }: { children: React.ReactNode }) {
    return <td className="px-4 py-4">
        {children}
    </td>;
}

export function TableRowEvenOdd({ even, children }: { even: boolean, children: React.ReactNode }) {
    return even
        ? <tr className='border-b dark:border-violet-700 bg-white dark:bg-violet-900' >
            {children}
        </tr>
        : <tr className='border-b dark:border-violet-700 bg-violet-50 dark:bg-violet-800'>
            {children}
        </tr>;
}

