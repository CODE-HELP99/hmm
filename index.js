const https = require('https');
const puppeteer = require('puppeteer');

const discordToken = 'YOUR_DISCORD_BOT_TOKEN';
const aternosEmail = 'your_email';
const aternosPassword = 'your_password';
const aternosServerId = 'your_server_id';

const discordApiUrl = 'https://discord.com/api/v9';

https.get(`${discordApiUrl}/users/@me`, {
  headers: {
    Authorization: `Bearer ${discordToken}`
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const userData = JSON.parse(data);
    const userId = userData.id;

    https.get(`${discordApiUrl}/users/${userId}/channels`, {
      headers: {
        Authorization: `Bearer ${discordToken}`
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const channelData = JSON.parse(data);
        const channelId = channelData[0].id;

        https.on('message', (message) => {
          if (message.author.bot) return;
          if (message.content.startsWith('?start')) {
            startServer();
            sendMessage(channelId, 'Server started successfully!');
          } else if (message.content.startsWith('?stop')) {
            stopServer();
            sendMessage(channelId, 'Server stopped successfully!');
          }
        });
      });
    });
  });
});

function startServer() {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://aternos.me/servers/');
    await page.type('input[name="email"]', aternosEmail);
    await page.type('input[name="password"]', aternosPassword);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.goto(`https://aternos.me/servers/${aternosServerId}/start`);
    await page.click('button[type="submit"]');
    await browser.close();
  })();
}

function stopServer() {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://aternos.me/servers/');
    await page.type('input[name="email"]', aternosEmail);
    await page.type('input[name="password"]', aternosPassword);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.goto(`https://aternos.me/servers/${aternosServerId}/stop`);
    await page.click('button[type="submit"]');
    await browser.close();
  })();
}

function sendMessage(channelId, message) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${discordToken}`
    }
  };
  const data = JSON.stringify({ content: message });
  const req = https.request(`${discordApiUrl}/channels/${channelId}/messages`, options, (res) => {
    res.on('data', (chunk) => {
      console.log(`Sent message: ${chunk}`);
    });
  });
  req.write(data);
  req.end();
}