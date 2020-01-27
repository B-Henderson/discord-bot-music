import { Client, RichEmbed, WebhookClient, Message } from 'discord.js';
import { token, prefix } from './config.json';
import ytdl from 'ytdl-core';

const client = new Client();
const queue = new Map();
client.login(token);

const execute = async (msg, serverQueue) => {
  const args = msg.content.split(' ');
  const voiceChannel = msg.member.voiceChannel;
  if (!voiceChannel)
    return msg.channel.send('you need to be in a voice channel to play music');
  const permissions = voiceChannel.permissionsFor(msg.client.user);
  if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
    return msg.channel.send(
      'I dont have permission to join or speak in your channel'
    );
  }
  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.title,
    url: songInfo.video_url
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(msg.guild.id, queueConstruct);
    queueConstruct.songs.push(song);
    try {
      let connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (err) {
      console.error(err);
      queue.delete(msg.guild.id);
      return msg.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    return msg.channel.send(`${song.title} has been added to the queue`);
  }
};

const play = (guild, song) => {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
    .playStream(ytdl(song.url))
    .on('end', () => {
      // delete the finished from from the queue
      serverQueue.songs.shift();
      //calls the play function again with the next song
      play(guild, serverQueue.songs[0]);
    })
    .on('error', error => {
      console.error(error);
    });
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
};

client.once('ready', () => {
  console.log('Ready!');
});
client.once('reconnecting', () => {
  console.log('Reconnecting!');
});
client.once('disconnect', () => {
  console.log('Disconnect!');
});

client.on('message', async msg => {
  const serverQueue = queue.get(msg.guild.id);

  if (msg.author.bot || !msg.content.startsWith(prefix)) return;
  switch (msg) {
    case `${prefix}play`:
      execute(msg, serverQueue);
      break;
    case `${prefix}skip`:
      execute(msg, serverQueue);
      break;
    case `${prefix}stop`:
      execute(msg, serverQueue);
      break;
    case `ping`:
      msg.reply('Pong');
      break;
    default:
      msg.channel.send('invalid command');
  }
  // if (msg.content === 'ping') {
  //   msg.reply('Pong');
  // }
});
