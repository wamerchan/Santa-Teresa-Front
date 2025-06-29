
import React from 'react';

interface HeaderProps {
    title: string;
    children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, children }) => {
    return (
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-2 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            {children && (
                <div className="flex items-center space-x-3">
                    {children}
                </div>
            )}
        </div>
    );
};

export default Header;