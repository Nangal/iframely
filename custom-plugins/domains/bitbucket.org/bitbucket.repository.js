module.exports = {

    re: /https?:\/\/(?:www\.)?bitbucket\.org\/(\w+)\/([\w-]+)(?:\/overview)?\/?$/i,

    mixins: [
        'canonical',
        'favicon'
    ],

    provides: "bitbucket_repo",

    getApiUrl: function (urlMatch) {
        return [
            'https://api.bitbucket.org/1.0/repositories',
            urlMatch[1],
            urlMatch[2]
        ].join('/');
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
                  bitbucket_repo: body
              });
            }
        }, cb);
    },

    getMeta: function(bitbucket_repo, urlMatch) {
        var language = '';
        if (bitbucket_repo.language) {
            language = ' (' + bitbucket_repo.language + ')';
        }
        return {
            site: 'Bitbucket',
            title: bitbucket_repo.name + language,
            description: bitbucket_repo.description,
        };
    },

    getLinks: function(bitbucket_repo) {
        var links = [];

        links.push({
            href: this.fixGravatarSize(bitbucket_repo.user.avatar),
            type: CONFIG.T.image,
            rel: CONFIG.R.thumbnail
        });

        return links;
    },

    tests: []
};
