var Editor = require('./editor');
var Document = require('./document');
var widgets = require('../widgets/widgets');
var glsl = require('../glsl/glsl');
var Store = require('./store');

function App() {
    if (document.readyState === 'complete') {
        this._init();
    } else {
        document.addEventListener('DOMContentLoaded', this._init.bind(this));
    }
}

App.prototype.find = function(elems) {
    var ret = {};

    for (var k in elems) {
        ret[k] = document.querySelector(elems[k]);
    }

    return ret;
}

App.prototype.new_document = function() {
    var doc = new Document(this);

    this._load_doc(doc);
    this._save_current_doc();
}

App.prototype.load_document = function(doc) {
    if (doc === null) {
        this.new_document();
        return;
    }

    doc = Document.deserialize(doc);

    this._load_doc(doc);
}

App.prototype._load_doc = function(doc) {
    this._loading = true;

    this.vertex_editor.value(doc.active_program.vertex);
    this.vertex_editor.history(doc.active_program.vertex_history);

    this.fragment_editor.value(doc.active_program.fragment);
    this.fragment_editor.history(doc.active_program.fragment_history);

    this.js_editor.value(doc.js);
    this.js_editor.history(doc.js_history);

    this.document = doc;

    if (doc.active_editor !== null) {
        var editor = null;

        switch (doc.active_editor.name) {
        case 'js':
            editor = this.js_editor;
            break;
        case 'vertex':
            editor = this.vertex_editor;
            break;
        case 'fragment':
            editor = this.fragment_editor;
            break;
        }

        if (editor !== null) {
            editor.focus();
            editor.cursor(doc.active_editor.cursor);
        }
    } else {
        this.canvas.focus();
    }

    this._loading = false;
}

App.prototype._save_current_doc = function() {
    var doc = this.document;

    this._store.save(doc.serialize(), function(store, retdoc) {
        if (retdoc !== null) {
            doc.id = retdoc.id;
        }
    });
}

App.prototype._save_current_doc_with_delay = function() {
    if (this._save_timeout !== 0) {
        clearTimeout(this._save_timeout);
        this._save_timeout = 0;
    }

    this._save_timeout = setTimeout((function() {
        this._save_timeout = 0;
        this._save_current_doc();
    }).bind(this), 1000);
}

App.prototype._init_panels = function() {
    var panels = document.querySelectorAll('.panel');

    this.panels = {};

    for (var i = 0; i < panels.length; i++) {
        var p = panels[i];

        this.panels[p.id] = new widgets.Panel(p);
    }

    this.panels['panel-main'].on('resized', (function() {
        this.vertex_editor.editor.refresh();
        this.fragment_editor.editor.refresh();
        this.js_editor.editor.refresh();
    }).bind(this));

    this.panels['panel-program'].on('resized', (function() {
        this.vertex_editor.editor.refresh();
        this.fragment_editor.editor.refresh();
    }).bind(this));

    this.panels['panel-js'].on('resized', (function() {
        this.js_editor.editor.refresh();
    }).bind(this));
}

App.prototype._update_document_by = function(opts) {
    if (this._loading) {
        return;
    }

    this.document.update(opts);
    this._save_current_doc_with_delay();
}

App.prototype._update_document = function(name, editor) {
    if (this._loading) {
        return;
    }

    var up = {};

    up[name] = {
        data: editor.value(),
        history: editor.history()
    };

    this._update_document_by(up);
}

App.prototype._init_canvas = function() {
    this.canvas = document.getElementById('view');

    var t = this.canvas.parentElement.querySelector('.editor-title');

    this.canvas.addEventListener('focus', (function(title) {
        t.classList.add('hidden');
        this._update_document_by({active_editor: null});
    }).bind(this, t));

    this.canvas.addEventListener('blur', (function(title) {
        t.classList.remove('hidden');
    }).bind(this, t));
}

App.prototype._init_editors = function() {
    var elems = this.find({
        vertex_editor: '#vertex-editor',
        fragment_editor: '#fragment-editor',
        js_editor: '#js-editor'
    });

    var opts = {
        theme: 'default webgl-play',
        indentUnit: 4,
        lineNumbers: true
    };

    for (var k in elems) {
        this[k] = CodeMirror(elems[k], opts);

        var p = elems[k].parentElement;
        var t = p.querySelector('.editor-title');

        this[k].on('focus', (function(title, k) {
            var n = k.slice(0, k.indexOf('_'));

            title.classList.add('hidden');

            this._update_document_by({
                active_editor: {
                    name: n,
                    cursor: this[k].cursor()
                }
            });
        }).bind(this, t, k));

        this[k].on('blur', (function(title) {
            title.classList.remove('hidden');
        }).bind(this, t));
    }

    var ctx = this.canvas.getContext('webgl');

    this.vertex_editor = new Editor(this.vertex_editor, ctx, glsl.source.VERTEX);
    this.fragment_editor = new Editor(this.fragment_editor, ctx, glsl.source.FRAGMENT);
    this.js_editor = new Editor(this.js_editor, ctx, 'javascript');

    var editors = {
        'vertex': this.vertex_editor,
        'fragment': this.fragment_editor,
        'js': this.js_editor
    };

    for (var n in editors) {
        editors[n].editor.on('changes', (function(n) {
            this._update_document(n, editors[n]);
        }).bind(this, n));

        editors[n].editor.on('cursorActivity', (function(n) {
            this._update_document_by({
                active_editor: {
                    name: n,
                    cursor: editors[n].cursor()
                }
            });
        }).bind(this, n));
    }
}



App.prototype._init = function() {
    this._store = new Store((function(store) {
        store.last((function(_, doc) {
            this.load_document(doc);
        }).bind(this));
    }).bind(this));

    this._init_canvas();
    this._init_editors();
    this._init_panels();
};

var app = new App();
module.exports = app;

// vi:ts=4:et
