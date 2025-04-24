
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeItem }) => {
const navigate = useNavigate();

const menuItems = [
    { name: 'irrigacao', label: 'Controle de irrigação' },
    { name: 'drenagem', label: 'Controle de drenagem' },
    { name: 'lixo', label: 'Controle de lixo' },
    { name: 'iluminacao', label: 'Controle de Iluminação' },
    { name: 'configuracoes', label: 'Configurações da Cidade' }
];

const handleNavigation = (itemName) => {
    navigate(`/${itemName}`);
};

return (
    <aside className="w-60 bg-zinc-900 text-white p-4 flex flex-col space-y-4">
    <button className="text-lg font-semibold mb-6">☰ Menu</button>
    
    {menuItems.map((item) => (
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
    </aside>
);
};

export default Sidebar;