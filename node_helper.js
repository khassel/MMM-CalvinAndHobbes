const probe = require('probe-image-size');

const base = 'https://www.gocomics.com/calvinandhobbes/';
let today_url = '';

const NodeHelper = require("node_helper");
module.exports = NodeHelper.create({

    start: function () {
        console.log("Starting node helper: " + this.name);

    },

    socketNotificationReceived: function(notification, payload) {
        if(notification === "GET_COMIC") {
            console.log("Got notification to get the new comic");
            this.sendComic();
        }
    },

    fetchValidComicLinkForToday: function () {
        return new Promise(function (resolve, reject) {
            console.log("Creating comic link for today");
            const today = new Date();
            const year = today.getFullYear();
            let month = today.getMonth() + 1;
            month = (month < 10 ? '0' : '') + month;
            const date = (today.getDate() < 10 ? '0' : '') + today.getDate();
            today_url = base + year + '/' + month + '/' + date;
            console.log('Link for today: ' + today_url);
            resolve(today_url);
        });
    },

    getComicLink: function (html) {
        // view-source:https://www.gocomics.com/calvinandhobbes/2025/06/03
        // <meta property="og:image" content="https://featureassets.gocomics.com/assets/60c4726011a3013e9f5b005056a9545d"/>
        return new Promise( function (resolve, reject) {
            console.log("Trying to get comic link from DOM");
            try {
              const matchArr = html.match(/<meta property="og:image" content="https:\/\/featureassets.gocomics.com\/assets\/[^"]*/);
              if (matchArr.length > 0) {
                // console.log('Match: ' + matchArr[0]);
                const comicUrl = matchArr[0].replace('<meta property="og:image" content="', "");
                console.log('Comic URL: ' + comicUrl);
                resolve(comicUrl);
              } else {
                throw Error("Could not find the right Element");
              }
            } catch (e) {
                reject(e);
            }
        });
    },

    sendComicNotification: function (comicLink) {
        let comic = {};

        probe(comicLink)
        .then(result => {
            comic = result;
            comic.day = new Date().getDay();
        })
        .then( () => {
            console.log("Sending new comic");
            this.sendSocketNotification('COMIC', comic);
        });
    },

    sendComic: async function () {
        try {
            const url = await this.fetchValidComicLinkForToday();
            const response = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
                },
            });
            const html = await response.text();
            const comicUrl = await this.getComicLink(html);
            this.sendComicNotification(comicUrl);
        }
        catch (e) {
            console.error(e);
        }
    }
});
