var utils = require('../../utils');

module.exports = {

    re: /(https?:\/\/)(www\.)?dropbox\.com\/(s\/(?:\w+\/)?([^?]+)).*/i,

    mixins: [
        "og-title",
        "canonical",
        "favicon",
        "og-image",
        "og-site",
        "og-description",
    ],

    getLink: function (urlMatch, request, cb) {

        var imageTypeWhitelist = [
            'image/gif',
            'image/jpeg',
            'image/png',
            'image/svg+xml',
            'image/web',
            'image/bmp'
        ];

        var fileUrl = [
            urlMatch[1],
            'dl.dropboxusercontent.com/',
            urlMatch[3]
        ].join('');

        if (!CONFIG.providerOptions.dropbox.get_file_type) {
            return cb(null, {
              href: fileUrl,
              rel: CONFIG.R.file
            });
        }

        request({
          uri: fileUrl,
          method: 'HEAD',
          prepareResult: function(error, response, body, cb) {

              if (response.statusCode !== 200) {
                  error = response.statusCode;
              }

              if (error) {
                  return cb(error);
              }

              if (!response.headers) {
                  return cb(true);
              }

              var type = response.headers['content-type'].toLowerCase();

              // Change type on non-whitelisted image types to prevent
              // `imagesize` to fail when trying to get the dimensions.
              if (type.match(/^image\//i) && imageTypeWhitelist.indexOf(type) < 0) {
                  type = 'application/octet-stream';
              }

              cb(null, {
                href: fileUrl,
                rel: CONFIG.R.file,
                type: type,
                content_length: parseInt(response.headers['content-length'], 10)
              });
          }
        }, cb);
    },

    tests: [
        "https://www.dropbox.com/s/5nscrc87w4qroii/Boston%20City%20Flow.jpg",
        "https://www.dropbox.com/sh/qw7pbihspj9qr1n/r43kxdHz-9/Let%27s%20Play%20Mafia%202%20-%20Let%27s%20Play%20Mafia%202%20-%20Let%27s%20Play%20Mafia%202%20Part%205%20-%20Sneaky%20Sneaky.mp4",
        "https://www.dropbox.com/s/95nitprloknc65t/FOSS4G%20NA%202013%20-%20Big%20Data.pdf",
        "https://www.dropbox.com/s/y1azvmnal9tl9nh/2013SLCTChamps9thInn.mp3"
    ]
};
