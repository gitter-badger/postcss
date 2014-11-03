var CssSyntaxError = require('./css-syntax-error');
var PreviousMap    = require('./previous-map');

var path = require('path');

var sequence = 0;

class Input {
    constructor(css, opts = { }) {
        this.css  = css.toString();
        this.opts = opts;

        sequence += 1;
        this.id   = '<input css ' + sequence + '>';

        this.safe = !!this.opts.safe;

        if ( this.opts.map == 'inline' ) {
            this.opts.map = { inline: true };
        }
        if ( this.opts.from ) {
            this.file = path.resolve(this.opts.from);
        }

        var map = new PreviousMap(this.css, this.opts, this.id);
        if ( map.text ) {
            this.map = map;
            var file = map.consumer().file;
            if ( !this.file && file ) this.file = this.mapResolve(file);
        }

        this.from = this.file ? this.file : this.id;
        if ( this.map ) this.map.file = this.from;
    }

    // Throw syntax error from this input
    error(message, pos) {
        throw new CssSyntaxError(this, pos, message);
    }

    // Get origin position of code if source map was given
    origin(pos) {
        if ( !this.map ) return false;
        var consumer = this.map.consumer();

        var from = consumer.originalPositionFor(pos);
        if ( !from.source ) return false;

        var result = {
            file:   this.mapResolve(from.source),
            line:   from.line,
            column: from.column
        };

        var source = consumer.sourceContentFor(result.file);
        if ( source ) result.source = source;

        return result;
    }

    // Return path relative from source map root
    mapResolve(file) {
        return path.resolve(this.map.consumer().sourceRoot || '.', file);
    }
}

module.exports = Input;
