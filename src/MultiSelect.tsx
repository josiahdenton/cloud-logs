import Checkbox from './Checkbox';

type MultiSelectItem = {
    id: number;
    value: string;
    checked: boolean;
};

interface MultiSelectProps {
    options: MultiSelectItem[];
    onSelect: (option: MultiSelectItem) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, onSelect }) => {
    const handleCheckOption = (option: MultiSelectItem) => {
        onSelect(option);
    };

    return (
        <div className="p-1">
            {options.map((option, i) => (
                <button
                    key={i}
                    className="py-2 px-1 hover:bg-gray-700 flex justify-between align-middle"
                    onClick={() => handleCheckOption(option)}
                >
                    <Checkbox checked={option.checked} />
                    <div>{option.value}</div>
                </button>
            ))}
        </div>
    );
};

export default MultiSelect;
