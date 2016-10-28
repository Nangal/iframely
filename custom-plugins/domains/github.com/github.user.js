module.exports = {

    re: /^https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/?$/i,

    mixins: ["domain-icon"],

    provides: 'github_user_data',

    getData: function(urlMatch, request, options, cb) {

        var api_key = options.getProviderOptions('github.api_key');

        if (!api_key) {
            return cb (new Error ("No github.api_key configured"));
        }

        var apiUrl =
          "https://api.github.com/users/" + urlMatch[1] + "?access_token=" + api_key;

        request({
            uri: apiUrl,
            cache_key: "github:user:" + urlMatch[1],
            json: true,
            headers: {
              'User-Agent': CONFIG.USER_AGENT
            },
            prepareResult: function(error, b, data, cb) {
                if (error) {
                    return cb(error);
                }
                if (!data.message) {

                    var gdata = {
                        title: data.login + ' (' + data.name + ')',
                        description: [
                            'Username: ' + data.login,
                            'Public Repos: ' + data.public_repos,
                            'Followers" ' + data.followers
                        ].join('\n'),
                        avatar_url: data.avatar_url
                    };

                    cb(null, {
                        github_user_data: gdata
                    });

                } else {
                    cb();
                }
            }
        }, cb);
    },

    getMeta: function(github_user_data) {
        return {
            title: github_user_data.title,
            description: github_user_data.description,
            site: "Github"
        };
    },

    getLinks: function(url, github_user_data, options) {

        var links = [{
            href: github_user_data.avatar_url,
            rel: CONFIG.R.thumbnail,
            type: CONFIG.T.image_jpeg
        }];

        return links;
    },

    tests: [{
        noFeeds: true
    },
        "https://github.com/tbasse"
    ]
};
