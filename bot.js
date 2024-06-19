// Import necessary modules
const { Client } = require('discord.js');
const ytdl = require('ytdl-core');
const { google } = require('googleapis');

// Create a new Discord client instance with intents
const client = new Client({ 
  intents: [1 << 0, 1 << 9] // Bitwise flags for GUILDS and GUILD_MESSAGES
});

// Create a YouTube Data API client
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCY0oqXxfnjVm1gIHUcl4wiDBlduE1XLzQ', // Replace with your YouTube Data API key
});

// Function to search for instrumental tracks based on the artist
async function searchInstrumental(artistName) {
  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: `${artistName} instrumental`,
      type: 'video',
      maxResults: 5, // Adjust as needed
    });

    // Extract video IDs or URLs from the search results
    const videoIds = response.data.items.map(item => `https://www.youtube.com/watch?v=${item.id.videoId}`);
    return videoIds;
  } catch (error) {
    console.error('Error searching for instrumental tracks:', error);
    throw error; // Rethrow the error to be caught by the caller
  }
}

// Function to play the instrumental track in a voice channel
async function playInstrumental(message, videoUrl) {
  try {
    // Join the voice channel of the user who sent the message
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      await message.reply('You need to be in a voice channel to play instrumental tracks.');
      return;
    }
    const connection = await voiceChannel.join();

    // Play the instrumental track
    const dispatcher = connection.play(ytdl(videoUrl, { filter: 'audioonly' }));

    dispatcher.on('start', () => {
      console.log('Playing instrumental track.');
      message.channel.send('Now playing instrumental track.');
    });

    dispatcher.on('finish', () => {
      console.log('Finished playing instrumental track.');
      voiceChannel.leave();
    });

    dispatcher.on('error', error => {
      console.error('Error playing instrumental track:', error);
      message.reply('An error occurred while playing the instrumental track.');
      voiceChannel.leave();
    });
  } catch (error) {
    console.error('Error playing instrumental track:', error);
    message.reply('An error occurred while playing the instrumental track.');
  }
}

// Event handler for when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Event handler for when a message is received
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Log incoming messages for debugging
    console.log(`Received message: ${message.content}`);

    // Check if the message is a command to search for instrumental tracks
    if (message.content.startsWith('!play')) {
        console.log('!play command detected');
        
        // Extract the artist name from the message
        const artistName = message.content.slice('!play'.length).trim();
        console.log(`Searching for instrumentals of: ${artistName}`);

        try {
            // Search for instrumental tracks based on the artist name
            const videoIds = await searchInstrumental(artistName);

            // Play the first instrumental track found
            if (videoIds.length > 0) {
                await playInstrumental(message, videoIds[0]);
            } else {
                await message.reply(`Sorry, I couldn't find any instrumental tracks for ${artistName}.`);
            }
        } catch (error) {
            console.error('Error during the search or playback process:', error);
            await message.reply('An error occurred while processing your request.');
        }
    }
});

// Login to Discord with your bot token
client.login('MTI0NDg3NDU3MDQ3MzkzNDg4OQ.GO6FHY.1eCjFmbF7Kp2ERxVdYmC5yp7Gv_6TP4iVqUqjg'); // Replace with your Discord bot token
