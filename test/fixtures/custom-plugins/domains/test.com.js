var utils = require('../../../../utils');

module.exports = {

    re: /testok/i,

    mixins: [
      'html-title'
    ],

    getMeta: function() {
        return {
            description: 'custom description',
            site: "custom"
        };
    },
};
