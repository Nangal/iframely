var gUtils = require('./utils');

module.exports = {

    re: /^https?:\/\/www\.flickr\.com\/photos\/([@a-zA-Z0-9_\.\-]+)\/(\d+).*?$/i,

    mixins: [
        "oembed-title",
        "oembed-author",
        "oembed-license",
        "oembed-site",
        "domain-icon"
    ],

    getLink: function(oembed) {

        var result =  [{
            href: oembed.thumbnail_url,
            rel: CONFIG.R.thumbnail,
            type: CONFIG.T.image_jpeg,
            width: oembed.thumbnail_width,
            heigh: oembed.thumbnail_height
        }];

        if (oembed.type === 'photo') {
            result.push ({
                href: oembed.url,
                rel: [CONFIG.R.image, CONFIG.R.thumbnail],
                type: CONFIG.T.image_jpeg,
                width: oembed.width,
                heigh: oembed.height
            });
        }

        return result;
    },

    tests: [{
        feed: "http://api.flickr.com/services/feeds/photos_public.gne"
    },
        "http://www.flickr.com/photos/jup3nep/8243797061/?f=hp",
        "https://www.flickr.com/photos/marshal-banana/23869537421",
        "http://www.flickr.com/photos/gonzai/6027481335/in/photostream/",
        {
            skipMixins: [
                "oembed-title",
                "oembed-author",
                "oembed-license"
            ]
        }
    ]
};