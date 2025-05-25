import axios from 'axios';
import crypto from 'crypto';
import yts from 'yt-search';

const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info",
    download: "/download"
  },
  headers: {
    'accept': '*/*',
    'content-type': 'application/json',
    'origin': 'https://yt.savetube.me',
    'referer': 'https://yt.savetube.me/',
    'user-agent': 'Postify/1.0.0'
  },
  formats: ['mp3'],

  crypto: {
    hexToBuffer: (hexString) => {
      const matches = hexString.match(/.{1,2}/g);
      return Buffer.from(matches.join(''), 'hex');
    },

    decrypt: async (enc) => {
      const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
      const data = Buffer.from(enc, 'base64');
      const iv = data.slice(0, 16);
      const content = data.slice(16);
      const key = savetube.crypto.hexToBuffer(secretKey);
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decrypted = decipher.update(content);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return JSON.parse(decrypted.toString());
    }
  },

  isUrl: (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  },

  youtube: (url) => {
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let regex of patterns) {
      const match = url.match(regex);
      if (match) return match[1];
    }
    return null;
  },

  request: async (endpoint, data = {}, method = 'post') => {
    try {
      const { data: res } = await axios({
        method,
        url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
        data: method === 'post' ? data : undefined,
        params: method === 'get' ? data : undefined,
        headers: savetube.headers
      });
      return { status: true, data: res };
    } catch (error) {
      return { status: false, error: error.message };
    }
  },

  getCDN: async () => {
    const res = await savetube.request(savetube.api.cdn, {}, 'get');
    if (!res.status) throw new Error('No se pudo obtener CDN');
    return res.data.cdn;
  },

  downloadAudio: async (query) => {
    let url = savetube.isUrl(query) ? query : null;

    if (!url) {
      const search = await yts(query);
      if (!search.videos.length) return null;
      url = search.videos[0].url;
    }

    const id = savetube.youtube(url);
    if (!id) throw new Error("ID de video no válido");

    const cdn = await savetube.getCDN();

    const info = await savetube.request(`https://${cdn}${savetube.api.info}`, {
      url: `https://www.youtube.com/watch?v=${id}`
    });
    if (!info.status) throw new Error("No se pudo obtener info");

    const decrypted = await savetube.crypto.decrypt(info.data.data);

    const dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
      id,
      downloadType: 'audio',
      quality: '128',
      key: decrypted.key
    });

    return {
      title: decrypted.title,
      description: decrypted.description,
      url: dl.data.data.downloadUrl,
      thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
      channel: { name: decrypted.channel || "Desconocido" },
      total_duration_in_seconds: decrypted.duration
    };
  }
};

export const play = async (type, query) => {
  if (type === 'audio') {
    return await savetube.downloadAudio(query);
  }
  return null;
};