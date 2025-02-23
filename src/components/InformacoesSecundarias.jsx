import PropTypes from 'prop-types';

const InformacoesSecundarias = ({ imagem, alt, titulo, listaItens }) => {
    return (
    <section className="flex flex-col md:flex-row items-center gap-6 bg-gray-100 p-6 rounded-lg shadow-md">

    <div className="w-full md:w-1/3">
        <img
        src={imagem}
        alt={alt}
        className="w-150 h-150 object-cover rounded-lg mx-auto md:mx-0" 
        />
    </div>
    <div className="w-full md:w-2/3 text-center md:text-center">
        <h2 className="text-2xl font-bold mb-4">{titulo}</h2>
        <ul className="space-y-2">
        {listaItens.map((item, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-700 justify-center">
            {item}
            </li>
        ))}
        </ul>
        <p className="mt-4">
        <a href="#" className="text-blue-600 hover:underline">Saiba Mais</a>
        </p>
    </div>
    </section>
);
};

InformacoesSecundarias.propTypes = {
  imagem: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  titulo: PropTypes.string.isRequired,
  listaItens: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default InformacoesSecundarias;