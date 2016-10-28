module.exports = {

    re: /https?:\/\/(?:www\.)?bitbucket\.org\/(\w+)\/([\w-]+)\/commits\/(\w+)$/i,

    mixins: [
        'canonical',
        'favicon'
    ],

    provides: "bitbucket_commit",

    getApiUrl: function (urlMatch) {
        var url = [
            'https://api.bitbucket.org/1.0/repositories/',
            urlMatch[1],
            '/',
            urlMatch[2],
            '/changesets/',
            urlMatch[3]
        ].join('');

        return url;
    },

    _n: function (num, singular, plural) {
        if (num === 1) {
            return singular;
        }
        return plural;
    },

    generateDescription: function (data) {
        return [
            data.branch ? data.branch + ': ' : '',
            data.message.trim(),
            data.files.length,
            this._n(data.files.length, 'file', 'files'),
            'affected.'
        ].join(' ');
    },

    generateTitle: function (data, urlMatch) {
        return [
            data.author,
            ' committed ',
            data.node,
            ' in ',
            urlMatch[1],
            '/',
            urlMatch[2],
        ].join('');
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
                  bitbucket_commit: body
              });
            }
        }, cb);
    },

    getMeta: function(bitbucket_commit, urlMatch) {
        return {
            site: 'Bitbucket',
            title: this.generateTitle(bitbucket_commit, urlMatch),
            date: bitbucket_commit.timestamp,
            author: bitbucket_commit.author,
            description: this.generateDescription(bitbucket_commit),
        };
    },

    getLinks: function(bitbucket_commit) {
        var links = [];
        return links;
    },

    tests: []
};
