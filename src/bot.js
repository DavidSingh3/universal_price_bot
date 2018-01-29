const Discord = require('discord.io')
const auth = require('./auth.json')
const request = require('./requests').request

// Initialize Discord Bot
const bot = new Discord.Client({
  token: auth.token,
  autorun: true
})

bot.on('ready', function (evt) {
  console.log('Connected')
  console.log('Logged in as: ')
  console.log(bot.username + ' - (' + bot.id + ')')
})

bot.on('message', async (user, userID, channelID, message, evt) => {
  // Our bot needs to know if it will execute a command
  // It will listen for messages that will start with `!`
  if (message.substring(0, 1) === '!') {
    let args = message.substring(1).split(' ')
    const cmd = args[0]

    args = args.splice(1).map(arg => arg.toUpperCase())
    switch (cmd) {
      case 'price':
        if (args.length !== 2)
          break

        const options = {
          method: 'POST',
          url: 'http://localhost:3000/price/' + args[0] + '/' + args[1],
          headers: {
            'Cache-Control': 'no-cache',
            'User-Agent': 'none',
            'Content-Type': 'application/json'
          }
        }
        const prices = JSON.parse((await request(options, (response, body) => response)))
        const keys = Object.keys(prices)
        const values = Object.values(prices)
        const tabLength = 5
        const keyLength = keys.reduce(
          (length, key) => {
            if (key.length > length)
              return key.length
            return length
          }, 0
        )
        let lineLength = 0
        const message = '```' + keys.map(
          (key, index) => {
            const line = key
              .concat(Array(keyLength + tabLength - key.length).fill(' ').join(''))
              .concat(values[index])
              .concat(' ' + args[0] + '/' + args[1])
            lineLength = Math.max(lineLength, line.length)
            return line
          }
        ).join('\n') + '```'

        bot.sendMessage({
          to: channelID,
          message
        })
        break
// Just add any case commands if you want to..
    }
  }
})