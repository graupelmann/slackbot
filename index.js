require('dotenv').config();
const { App } = require('@slack/bolt');
const store = require('./store');

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});


app.event('app_home_opened', ({ event, say }) => {
  // Look up the user from DB
  let user = store.getUser(event.user);
  
  if(!user) {
    user = {
      user: event.user,
      channel: event.channel
    };
    store.addUser(user);
    
    say(`Hello world, and welcome <@${event.user}>!`);
  } else {
    say('Hi again!');
  }
});

app.command('/hi', async ({ message, event, action, command, options }) => {
  say('Hi')
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 8000);
  console.log('⚡️ Bolt app is running!');
})();