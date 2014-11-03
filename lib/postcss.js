var Declaration = require('./declaration');
var Comment     = require('./comment');
var AtRule      = require('./at-rule');
var Result      = require('./result');
var Rule        = require('./rule');
var Root        = require('./root');

// List of functions to process CSS
class PostCSS {
    constructor(processors = []) {
        this.processors = processors.map( (i) => this.normalize(i) );
    }

    // Add another function to CSS processors
    use(processor) {
        processor = this.normalize(processor);
        this.processors.push(processor);
        return this;
    }

    // Process CSS throw installed processors
    process(css, opts = { }) {
        if ( opts.map == 'inline' ) opts.map = { inline: true };

        var parsed;
        if ( css instanceof Root ) {
            parsed = css;
        } else if ( css instanceof Result ) {
            parsed = css.root;
        } else {
            parsed = postcss.parse(css, opts);
        }

        for ( var processor of this.processors ) {
            var returned = processor(parsed, opts);
            if ( returned instanceof Root ) parsed = returned;
        }

        return parsed.toResult(opts);
    }

    // Return processor function
    normalize(processor) {
        var type = typeof(processor);
        if ( (type == 'object' || type == 'function') && processor.postcss ) {
            return processor.postcss;
        } else {
            return processor;
        }
    }
}

// Framework for CSS postprocessors
//
//   var processor = postcss(function (css) {
//       // Change nodes in css
//   });
//   processor.process(css)
var postcss = function (...processors) {
    if ( processors.length == 1 && Array.isArray(processors[0]) ) {
        processors = processors[0];
    }
    return new PostCSS(processors);
};

// Compile CSS to nodes
postcss.parse = require('./parse');

// Nodes shortcuts
postcss.comment = function (defaults) {
    return new Comment(defaults);
};
postcss.atRule = function (defaults) {
    return new AtRule(defaults);
};
postcss.decl = function (defaults) {
    return new Declaration(defaults);
};
postcss.rule = function (defaults) {
    return new Rule(defaults);
};
postcss.root = function (defaults) {
    return new Root(defaults);
};

module.exports = postcss;
