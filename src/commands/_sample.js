/**
 * Este é um modelo de comando.
 * Copie e cole este arquivo para criar um novo comando em uma das pastas: admin, member ou owner
 * Você deve renomeá-lo para ficar de fácil identificação na pasta destino.
 *
 * Pasta owner: Comandos que só podem ser executados pelo dono do bot
 * Pasta admin: Comandos que só podem ser executados por administradores do grupo
 * Pasta member: Comandos que podem ser executados por qualquer membro do grupo
 */
const { PREFIX } = require("../../config");

module.exports = {
  name: "comando",
  description: "Descrição do comando",
  commands: ["comando1", "comando2"],
  usage: `${PREFIX}comando`,
  handle: async ({}) => {
    // código do comando
  },
};
