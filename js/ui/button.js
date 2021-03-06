/*
 * Copyright (c) 2014 Jesse van den Kieboom. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above
 *      copyright notice, this list of conditions and the following disclaimer
 *      in the documentation and/or other materials provided with the
 *      distribution.
 *    * Neither the name of Google Inc. nor the names of its
 *      contributors may be used to endorse or promote products derived from
 *      this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var Widget = require('./widget');
var utils = require('../utils/utils');

function Button(settings) {
    if (typeof settings === 'string') {
        settings = {
            value: settings
        };
    }

    Widget.call(this, 'button', this.create('div'), utils.merge({}, settings));

    this.e.addEventListener('click', this._onClick.bind(this));
    this.e.addEventListener('dblclick', this._onDblclick.bind(this));

    this._onClickEvent = this.registerSignal('click');
    this._onDblclickEvent = this.registerSignal('dblclick');
}

Button.prototype = Object.create(Widget.prototype);
Button.prototype.constructor = Button;

Button.prototype._valueUpdated = function() {
    if (typeof this._value === 'string') {
        this.e.textContent = this._value;
    } else if (typeof this._value.text !== 'undefined') {
        this.e.textContent = this._value.text;
    } else if (typeof this._value.markup !== 'undefined') {
        this.e.innerHTML = this._value.markup;
    }
};

Button.prototype._onClick = function(e) {
    if (this.sensitive()) {
        this._onClickEvent(e);
    }

    e.preventDefault();
    e.stopPropagation();
};

Button.prototype._onDblclick = function(e) {
    if (this.sensitive()) {
        this._onDblclickEvent(e);
    }

    e.preventDefault();
    e.stopPropagation();
};

module.exports = Button;

// vi:ts=4:et
