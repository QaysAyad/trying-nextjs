import { useState } from "react";

export const InputBox = ({ onSearch }: { onSearch: (text: string) => void }) => {
    const [search, setSearch] = useState('');
    return <div className="w-full">
        <label
            className="block text-sm font-medium leading-6 text-white"
            htmlFor="search"
        >
            Search with client ID
        </label>
        <div className="relative mt-2 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">🔍</span>
            </div>
            <input
                className="block w-full rounded-md border-0 py-1.5 pl-8 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                type="text"
                name="search"
                placeholder="Client ID"
                onKeyDown={(e) => e.key === 'Enter' && onSearch(search)}
                onChange={(e) => {
                    setSearch(e.target.value);
                    // When the input is empty we want to search for all patients.
                    if (!e.target.value.length) onSearch('');
                }}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button onClick={() => onSearch(search)}>Search</button>
            </div>
        </div>
    </div>;
}