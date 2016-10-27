var sysUtils = require('./utils');

console.log("");
console.log("Starting Iframely...");
console.log("Base URL for embeds that require hosted renders:", CONFIG.baseAppUrl);

var path = require('path');
var express = require('express');
var jsonxml = require('jsontoxml');

var NotFound = sysUtils.NotFound;

var app = express();

app.use(express.bodyParser());
app.set('view engine', 'ejs');

if (CONFIG.allowedOrigins) {
    app.use(function(req, res, next) {
        var origin = req.headers["origin"];

        if (origin) {
            if (CONFIG.allowedOrigins.indexOf('*') > -1) {
                res.setHeader('Access-Control-Allow-Origin', '*');
            } else {
                if (CONFIG.allowedOrigins.indexOf(origin) > -1) {
                    res.setHeader('Access-Control-Allow-Origin', origin);
                }
            }
        }
        next();
    });
}
app.disable( 'x-powered-by' );
app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'Iframely');
    next();
});

app.use(sysUtils.cacheMiddleware);


require('./modules/api/views')(app);
require('./modules/debug/views')(app);
require('./modules/tests-ui/views')(app);

app.use(logErrors);
app.use(errorHandler);


function logErrors(err, req, res, next) {
    if (CONFIG.RICH_LOG_ENABLED) {
        console.error(err.stack);
    } else {
        console.log(err.message);
    }

    next(err);
}

var errors = [401, 403, 408];

function respondWithError(req, res, code, msg) {
    var err = {
        error: {
            source: 'iframely',
            code: code,
            message: msg
        }
    };

    var ttl;
    if (code === 404) {
        ttl = CONFIG.CACHE_TTL_PAGE_404;
    } else if (code === 408) {
        ttl = CONFIG.CACHE_TTL_PAGE_TIMEOUT;
    } else {
        ttl = CONFIG.CACHE_TTL_PAGE_OTHER_ERROR
    }

    if (req.query.format === 'xml') {

        var xmlError = jsonxml(err, {
            escape: true,
            xmlHeader: {
                standalone: true
            }
        });

        res.sendCached('text/xml', xmlError, {
            code: code,
            ttl: ttl
        });

    } else {

        res.sendJsonCached(err, {
            code: code,
            ttl: ttl
        });
    }
}

function errorHandler(err, req, res, next) {
    if (err instanceof NotFound) {
        respondWithError(req, res, 404, err.message);
    } else {
        var code = err.code || 500;
        errors.map(function(e) {
            if (err.message.indexOf(e) > - 1) {
                code = e;
            }
        });

        if (err.message.indexOf('timeout') > -1) {
            respondWithError(req, res, 408, 'Timeout');
        }
        else if (code === 401) {
            respondWithError(req, res, 401, 'Unauthorized');
        }
        else if (code === 403) {
            respondWithError(req, res, 403, 'Forbidden');
        }
        else if (code === 410) {
            respondWithError(req, res, 410, 'Gone');
        }
        else {
            respondWithError(req, res, code, 'Server error');
        }
    }
}

process.on('uncaughtException', function(err) {
    if (CONFIG.DEBUG) {
        console.log(err.stack);
    } else {
        console.log(err.message);
    }
});

app.get(CONFIG.relativeStaticUrl + '/*', function(req, res, next) {
    var url = '/' + req.url.split('/').splice(2).join('/');
    sysUtils.static(path.resolve(__dirname, 'static'), {path: url})(req, res, next);
});

app.get('/', function(req, res) {
    res.writeHead(302, { Location: 'http://iframely.com'});
    res.end();
});

process.title = "iframely";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var listener = app.listen(process.env.PORT || CONFIG.port, process.env.HOST || CONFIG.host, function(){
    console.log('\niframely is listening on ' + listener.address().address + ':' + listener.address().port + '\n');
});

module.exports = listener;

if (CONFIG.ssl) {
    require('https').createServer(CONFIG.ssl, app).listen(CONFIG.ssl.port);
}

console.log('');
console.log(' - support@iframely.com - if you need help');
console.log(' - twitter.com/iframely - news & updates');
console.log(' - github.com/itteco/iframely - star & contribute');

if (!CONFIG.DEBUG) {
    var GracefulServer = require('graceful-cluster').GracefulServer;
    new GracefulServer({
        server: listener,
        log: sysUtils.log,
        shutdownTimeout: CONFIG.SHUTDOWN_TIMEOUT
    });
}
