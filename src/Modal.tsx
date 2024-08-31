import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (

    <div className="fixed inset-0 flex items-center justify-center z-30">
      {/* these two will blur the bg and center the following content */}
      <div className="fixed inset-0 bg-black opacity-50"></div>

      <div className="z-50 bg-gray-900  rounded-lg shadow-lg overflow-hidden w-11/12 md:w-1/2 lg:w-1/3 text-white">
        {/* this is the header */}
        <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl hover:text-gray-700">
            &times;
          </button>
        </div>
        {/* this is the content */}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
