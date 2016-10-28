module.exports = {

    re: /https?:\/\/(?:www\.)?bitbucket\.org\/(\w+)\/?$/i,

    mixins: [
        'canonical',
        'favicon'
    ],

    provides: "bitbucket_user",

    getApiUrl: function (urlMatch) {
        var user = urlMatch[1];
        var url = 'https://api.bitbucket.org/1.0/users/';
        return url + user;
    },

    fixGravatarSize: function (url) {
        return url.replace(/s=[0-9]+/, 's=256');
    },

    _n: function (num, singular, plural) {
        if (num === 1) {
            return singular;
        }
        return plural;
    },

    generateDescription: function (data) {
        var numRepos = data.repositories.length;
        return [
            data.user.display_name,
            'is',
            (data.user.is_team ? 'team' : 'user'),
            'on Bitbucket',
            'with',
            data.repositories.length,
            'public',
            this._n(data.repositories.length, 'repository', 'repositories')
        ].join(' ');
    },

    getData: function (urlMatch, request, cb) {
        request({
            uri: this.getApiUrl(urlMatch),
            json: true,
            prepareResult: function(error, response, body, cb) {

              if (error) {
                  return cb(error);
              } else if (response.statusCode >= 400) {
                  return cb({
                      code: response.statusCode
                  });
              }

              cb(null, {
                  bitbucket_user: body
              });
            }
        }, cb);
    },

    getMeta: function(bitbucket_user, urlMatch) {
        return {
            site: 'Bitbucket',
            title: bitbucket_user.user.display_name,
            description: this.generateDescription(bitbucket_user),
            team: bitbucket_user.user.is_team,
            staff: bitbucket_user.user.is_staff,
            respositories: bitbucket_user.repositories.length
        };
    },

    getLinks: function(bitbucket_user) {
        var links = [];

        links.push({
            href: this.fixGravatarSize(bitbucket_user.user.avatar),
            type: CONFIG.T.image,
            rel: CONFIG.R.thumbnail
        });

        return links;
    },

    tests: []
};
