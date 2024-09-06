import { useEffect, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

// TODO: add a prop that will take in the selected menu value

function Dropdown(props: {
    options: string[];
    optionAdded?: (option: string) => void;
    optionSelected?: (option: string) => void;
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isAddOptionActive, toggleAddOption] = useState(false);
    const [newOption, setNewOption] = useState('');
    const [options, setOptions] = useState<string[]>([]);

    // NOTE: options is loaded async, so we have to instead have a hook to know
    // when the props get updated and we can then remain in sync
    useEffect(() => {
        setOptions([...props.options]);
    }, [props.options]);

    // TODO: should I even add to the options array?
    const handleAddOption = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key == 'Enter') {
            setOptions((options) => [...options, newOption]);
            if (props.optionAdded) {
                props.optionAdded(newOption);
            }
            setNewOption('');
            toggleAddOption(false);
        }
    };

    const handleSelect = (option: string) => {
        if (props.optionSelected) {
            props.optionSelected(option);
        }
        setIsDropdownOpen(false);
    };

    const openDropdown = () => {
        setIsDropdownOpen((open) => !open);
    };

    const openAddMenuOption = () => {
        toggleAddOption((open) => !open);
    };

    return (
        <div className="relative text-slate-50">
            <button
                className="bg-gray-900 rounded-lg shadow py-1 px-2 border border-gray-700 hover:bg-gray-800"
                onClick={openDropdown}
            >
                <div className="flex gap-1 align-middle text-center">
                    Select Account
                    <div className="flex-col justify-center">
                        <FaChevronDown className="h-full" />
                    </div>
                </div>
            </button>

            {/* menu options */}
            {isDropdownOpen && (
                <div className="absolute right-0 z-10 mt-2 border border-gray-700 bg-gray-900 min-w-36 text-right rounded shadow p-1 origin-top-right">
                    {options.map((option, i) => (
                        <button
                            className="hover:bg-gray-800 w-full text-nowrap"
                            key={i}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
                    <div className="hover:bg-gray-800">
                        {isAddOptionActive ? (
                            <input
                                autoFocus
                                className="bg-gray-900 border border-gray-700 hover:bg-gray-800"
                                type="text"
                                value={newOption}
                                onChange={(e) => setNewOption(e.target.value)}
                                onKeyDown={handleAddOption}
                            />
                        ) : (
                            <button
                                className={
                                    'bg-gray-900 shadow hover:bg-gray-800 border-gray-700 w-full ' +
                                    (options.length > 0 ? 'border-t' : '')
                                }
                                onClick={openAddMenuOption}
                            >
                                + add
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dropdown;
