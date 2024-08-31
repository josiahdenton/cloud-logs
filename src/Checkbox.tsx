interface CheckboxProps {
    checked: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked }) => {
    return checked ? (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="2"
                ry="2"
                stroke="black"
                stroke-width="2"
                fill="none"
            />
        </svg>
    ) : (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect
                x="2"
                y="2"
                width="20"
                height="20"
                rx="2"
                ry="2"
                stroke="black"
                stroke-width="2"
                fill="none"
            />
            <path
                d="M6 12l4 4 8-8"
                stroke="black"
                stroke-width="2"
                fill="none"
            />
        </svg>
    );
};

export default Checkbox;
