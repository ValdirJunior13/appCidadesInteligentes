import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <div className="flex items-center space-x-4 p-4">
            <div className="text-right">
                <p className="font-medium">{user.nome}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <button 
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Sair
            </button>
        </div>
    );
};

export default UserProfile;