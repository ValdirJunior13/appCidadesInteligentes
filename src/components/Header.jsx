import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Header = ({ showLogin = true, showRegister = true }) => {
    return (
        <header className="bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
                <div className="flex lg:flex-1 items-center">
                    <a href='/home' className="-m-1.5 p-1.5"> <img src ="..\src\assets\images\logoPrincipal.png" alt="Logo" className="hidden lg:block h-16 w-auto" /> </a>
                <Link to="/home" className="-m-1.5 p-1.5">
    <span className="text-2xl font-bold text-gray-900">Connect City</span>
  </Link>
</div>

                <div className="flex lg:hidden">
                    <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                        <span className="sr-only">Abrir menu</span>
                        <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-12">
                    <Link to="/lixo" className="text-sm/6 font-semibold text-gray-900 hover:text-[#0360D9] transition-colors">Controle de Lixo</Link>
                    <Link to="/iluminacaoinicio" className="text-sm/6 font-semibold text-gray-900 hover:text-[#0360D9] transition-colors">Iluminação</Link>
                    <Link to="/hidrico" className="text-sm/6 font-semibold text-gray-900 hover:text-[#0360D9] transition-colors">Drenagem</Link>
                    <Link to="/data" className="text-sm/6 font-semibold text-gray-900 hover:text-[#0360D9] transition-colors">Dados</Link>
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-x-4">
                    {showLogin && (
                        <Link to="/login" className="text-sm/6 font-semibold text-gray-900 bg-gray-100 rounded-full px-4 py-2 hover:bg-[#0360D9] hover:text-white transition-colors">
                            Logar
                        </Link>
                    )}
                    {showRegister && (
                        <Link to="/register" className="text-sm/6 font-semibold text-gray-900 bg-gray-100 rounded-full px-4 py-2 hover:bg-[#0360D9] hover:text-white transition-colors">
                            Criar Conta
                        </Link>
                    )}
                </div>
            </nav>

            {/* Menu mobile */}
            <div className="lg:hidden" role="dialog" aria-modal="true">
                <div className="fixed inset-0 z-10"></div>
                <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-between">
                        <Link to="/home" className="-m-1.5 p-1.5">
                            <span className="text-2xl font-bold text-gray-900">Nome do Site</span>
                        </Link>
                        <button type="button" className="-m-2.5 rounded-md p-2.5 text-gray-700">
                            <span className="sr-only">Fechar menu</span>
                            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                <Link to="/lixo" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-[#0360D9] hover:text-white transition-colors">Controle de Lixo</Link>
                                <Link to="/iluminacao" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-[#0360D9] hover:text-white transition-colors">Iluminação</Link>
                                <Link to="/hidrico" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-[#0360D9] hover:text-white transition-colors">Drenagem</Link>
                                <Link to="/data" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-[#0360D9] hover:text-white transition-colors">Dados</Link>
                            </div>
                            <div className="py-6">
                                {showLogin && (
                                    <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-[#0360D9] hover:text-white transition-colors">Logar</Link>
                                )}
                                {showRegister && (
                                    <Link to="/register" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-[#0360D9] hover:text-white transition-colors">Criar Conta</Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

Header.propTypes = {
    showLogin: PropTypes.bool,
    showRegister: PropTypes.bool
};

export default Header;