const { PREFIX } = require(`${BASE_DIR}/config`);
const { play } = require(`${BASE_DIR}/services/savetube`);
const { InvalidParameterError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "play-audio",
  description: "Faço o download de músicas",
  commands: ["play-audio", "play", "pa"],
  usage: `${PREFIX}play-audio MC Hariel`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendAudioFromURL,
    sendImageFromURL,
    fullArgs,
    sendWaitReact,
    sendSuccessReact,
    sendErrorReply,
  }) => {
    if (!fullArgs.length) {
      throw new InvalidParameterError(
        "Você precisa me dizer o que deseja buscar!"
      );
    }

    if (fullArgs.includes("http://") || fullArgs.includes("https://")) {
      throw new InvalidParameterError(
        `Você não pode usar links diretamente! Use ${PREFIX}yt-mp3 link`
      );
    }

    await sendWaitReact();

    try {
      const data = await play("audio", fullArgs);

      if (!data) {
        await sendErrorReply("Nenhum resultado encontrado!");
        return;
      }

      await sendSuccessReact();

      await sendImageFromURL(
        data.thumbnail,
        `*Título:* ${data.title}
        
*Descrição:* ${data.description || "N/A"}
*Duração:* ${data.total_duration_in_seconds} segundos
*Canal:* ${data.channel.name}`
      );

      await sendAudioFromURL(data.url);
    } catch (error) {
      console.error(error);
      await sendErrorReply("Erro ao baixar áudio. Tente novamente.");
    }
  },
};