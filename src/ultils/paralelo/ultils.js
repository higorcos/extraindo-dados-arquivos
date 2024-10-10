const os = require('os'); // Importa o módulo os


  
// Função para dividir o array principal em partes menores
module.exports = {
    dividirArray:(array)=> {
    const parts = (os.cpus().length) * 2;
    let tamanho = Math.ceil(array.length / parts);
    let resultado = [];
    for (let i = 0; i < array.length; i += tamanho) {
      resultado.push(array.slice(i, i + tamanho));
    }
    return resultado;
  }
}
  