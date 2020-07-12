require('dotenv').config();
const { App } = require('@slack/bolt');
const store = require('./store');
const deepai = require('deepai'); // OR include deepai.min.js as a script tag in your HTML

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

app.event('app_mention', ({ event, say }) => {
  // Look up the user from DB
  let user = store.getUser(event.user);

  deepai.setApiKey(process.env.DEEPAI_API_KEY);

  let resp;
  const text = event.text.replace(/<@[a-zA-Z0-9]*>/g, '');

  if (text === '') {
    say('@ me with some words!')
  } else {
    async function getImage() {
      resp = await deepai.callStandardApi("text2img", {
        text: text,
      });
      console.log(resp.output_url);
    }

    function postImage() {
      say({
        "attachments": [
          {
            "text": "Download the image if you want to keep it!",
            "image_url": resp.output_url,
          }
        ]
      });
    }

    getImage().then(postImage);
  }
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

app.event('app_mention', (payload) => {
});

// Start your app
(async () => {
  await app.start(process.env.PORT || 8000);
  console.log('⚡️ Bolt app is running!');
})();
