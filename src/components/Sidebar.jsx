import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeItem, cidadeAtual}) => {
const navigate = useNavigate();
const [isCollapsed, setIsCollapsed] = useState(false);

const menuItems = [
    { name: 'irrigacao', label: 'Controle de irrigação' },
    { name: 'drenagem', label: 'Controle de drenagem' },
    { name: 'lixo', label: 'Controle de lixo' },
    { name: 'iluminacao', label: 'Controle de Iluminação' },
    { name: 'configuracoes', label: 'Configurações da Cidade' }
];

const handleNavigation = (itemName) => {
    if (itemName === 'configuracoes') {
    navigate(`/${itemName}`, { state: cidadeAtual });
    } else {
    navigate(`/${itemName}`);
    }
};
const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
};

const handleGoBack = () => {
    navigate('/paginalogin'); 
};

return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-60'} bg-zinc-900 text-white p-4 flex flex-col space-y-4 transition-all duration-300`}>
    <button 
        onClick={toggleSidebar}
        className="text-lg font-semibold mb-6 flex justify-between items-center"
    >
        {isCollapsed ? '☰' : '☰ Menu'}
        <span className={`transform ${isCollapsed ? 'rotate-180' : ''}`}>
        {isCollapsed ? '▶' : '◀'}
        </span>
    </button>
    
    {!isCollapsed && menuItems.map((item) => (
        <button
        key={item.name}
        onClick={() => handleNavigation(item.name)}
        className={`text-left py-2 px-4 rounded-lg ${
            activeItem === item.name
            ? 'bg-yellow-400 text-black font-semibold'
            : 'hover:underline'
        }`}
        >
        {item.label}
        </button>
    ))}

    {!isCollapsed && (
        <button
        onClick={handleGoBack}
        className="text-left py-2 px-4 rounded-lg hover:underline mt-auto" 
        >
        Voltar
        </button>
    )}
    </aside>
);
};

export default Sidebar;