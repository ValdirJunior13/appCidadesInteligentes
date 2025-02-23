import PropTypes from "prop-types";

const Quadrado = ({ imagem, alt, titulo, descricao }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center">
            {imagem ? (
                <img src={imagem} alt={alt} className="w-24 h-24 mb-4 rounded-lg" />
            ) : (
                <p>Erro ao carregar imagem</p>
            )}
            <h3 className="text-xl font-semibold">{titulo}</h3>
            <p className="text-gray-600">{descricao}</p>
        </div>
    );
};


Quadrado.propTypes = {
    imagem: PropTypes.string.isRequired, 
    alt: PropTypes.string.isRequired,    
    titulo: PropTypes.string.isRequired, 
    descricao: PropTypes.string.isRequired 
};

export default Quadrado;

