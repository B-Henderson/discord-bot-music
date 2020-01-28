import { Client, RichEmbed, WebhookClient, Message } from 'discord.js';
import { token, prefix } from './config.json';
import ytdl from 'ytdl-core';

const client = new Client();
const queue = new Map();
client.login(token);

const execute = async (msg, serverQueue) => {
  const args = msg.content.split(' ');
  const voiceChannel = msg.member.voiceChannel;
  if (!voiceChannel) return userNotInChannel(msg);
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

const skip = (msg, serverQueue) => {
  if (!msg.member.voiceChannel) return userNotInChannel(msg);
  if (!serverQueue) return msg.channel.send('There is no song to skip');
  serverQueue.connection.dispatcher.end();
};

const stop = (msg, serverQueue) => {
  if (!msg.member.voiceChannel) return userNotInChannel(msg);

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
};

const pause = (msg, serverQueue) => {};

const userNotInChannel = msg => {
  msg.channel.send('You must be in a voice channel to skip the music');
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

  if (msg.content.startsWith(`${prefix}play`)) {
    execute(msg, serverQueue);
  } else if (msg.content.startsWith(`${prefix}skip`)) {
    skip(msg, serverQueue);
  } else if (msg.content.startsWith(`${prefix}stop`)) {
    stop(msg, serverQueue);
  } else {
    msg.channel.send('invalid command');
  }
});
