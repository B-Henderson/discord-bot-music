!function(e){var n={};function o(t){if(n[t])return n[t].exports;var r=n[t]={i:t,l:!1,exports:{}};return e[t].call(r.exports,r,r.exports,o),r.l=!0,r.exports}o.m=e,o.c=n,o.d=function(e,n,t){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(o.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var r in e)o.d(t,r,function(n){return e[n]}.bind(null,r));return t},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=3)}([function(e){e.exports=JSON.parse('{"b":"NjY5ODkwMjc2MTI2NjIxNjk2.Xi7FVQ.cZHjKLa5SoZUXUwX19DP5AOL5ug","a":"!"}')},function(e,n){e.exports=require("ytdl-core")},function(e,n){e.exports=require("discord.js")},function(e,n,o){"use strict";o.r(n);var t=o(2),r=o(0),i=o(1),c=o.n(i);const s=new t.Client,l=new Map;s.login(r.b);const a=async(e,n)=>{const o=e.content.split(" "),t=e.member.voiceChannel;if(!t)return e.channel.send("you need to be in a voice channel to play music");const r=t.permissionsFor(e.client.user);if(!r.has("CONNECT")||!r.has("SPEAK"))return e.channel.send("I dont have permission to join or speak in your channel");const i=await c.a.getInfo(o[1]),s={title:i.title,url:i.video_url};if(n)return n.songs.push(s),console.log(n.songs),e.channel.send(`${s.title} has been added to the queue`);{const n={textChannel:e.channel,voiceChannel:t,connection:null,songs:[],volume:5,playing:!0};l.set(e.guild.id,n),n.songs.push(s);try{let o=await t.join();n.connection=o,u(e.guild,n.songs[0])}catch(n){return console.error(n),l.delete(e.guild.id),e.channel.send(n)}}},u=(e,n)=>{const o=l.get(e.id);if(!n)return o.voiceChannel.leave(),void l.delete(e.id);o.connection.playStream(c()(n.url)).on("end",()=>{o.songs.shift(),u(e,o.songs[0])}).on("error",e=>{console.error(e)}).setVolumeLogarithmic(o.volume/5)};s.once("ready",()=>{console.log("Ready!")}),s.once("reconnecting",()=>{console.log("Reconnecting!")}),s.once("disconnect",()=>{console.log("Disconnect!")}),s.on("message",async e=>{const n=l.get(e.guild.id);if(!e.author.bot&&e.content.startsWith(r.a))switch(e){case`${r.a}play`:case`${r.a}skip`:case`${r.a}stop`:a(e,n);break;case"ping":e.reply("Pong");break;default:e.channel.send("invalid command")}})}]);