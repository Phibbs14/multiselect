if (typeof jQuery === 'undefined') {
    throw new Error('multiselect requires jQuery');
}

;(function ($) {
    'use strict';

    var version = $.fn.jquery.split(' ')[0].split('.');

    if (version[0] < 2 && version[1] < 7) {
        throw new Error('multiselect crequires jQuery version 1.7 or higher');
    }
})(jQuery);

;(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module depending on jQuery.
        define(['jquery'], factory);
    } else {
        // No AMD. Register plugin with global jQuery object.
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var Multiselect = (function($) {
        /** Multiselect object constructor
         *
         *  @class Multiselect
         *  @constructor
        **/
        function Multiselect( $select, settings ) {
            var data = $select.data();

            $.extend(settings, data);

            var id = $select.prop('id');
            this.id = id;
            this.$left = $select;
            this.$right = $( settings.right ).length ? $( settings.right ) : $('#' + id + '_to');
            this.left = this.$left.get(0);
            this.right = this.$right.get(0);

            this.actions = {
                $leftAll:        $( settings.leftAll ).length ? $( settings.leftAll ) : $('#' + id + '_leftAll'),
                $rightAll:       $( settings.rightAll ).length ? $( settings.rightAll ) : $('#' + id + '_rightAll'),
                $leftSelected:   $( settings.leftSelected ).length ? $( settings.leftSelected ) : $('#' + id + '_leftSelected'),
                $rightSelected:  $( settings.rightSelected ).length ? $( settings.rightSelected ) : $('#' + id + '_rightSelected'),
            };

            delete settings.leftAll;
            delete settings.leftSelected;
            delete settings.right;
            delete settings.rightAll;
            delete settings.rightSelected;

            this.options = {
                keepRenderingSort:  settings.keepRenderingSort,
                submitAllLeft:      settings.submitAllLeft !== undefined ? settings.submitAllLeft : true,
                submitAllRight:     settings.submitAllRight !== undefined ? settings.submitAllRight : true,
                leftSearch:         settings.leftSearch,
                rightSearch:        settings.rightSearch,
                leftBulk:           settings.leftBulk,
                stopPropagation:    settings.stopPropagation !== undefined ? settings.stopPropagation : false
            };

            delete settings.keepRenderingSort;
            delete settings.submitAllLeft;
            delete settings.submitAllRight;
            delete settings.leftSearch;
            delete settings.rightSearch;
            delete settings.leftBulk;
            delete settings.stopPropagation;

            this.callbacks = settings;

            this.init();
        }

        Multiselect.prototype = {
            // Vars

            // Functions
            init: function() {
                var self = this;

                if (self.options.keepRenderingSort) {
                    self.skipInitSort = true;

                    self.callbacks.sort = function(a, b) {
                        return $(a).data('position') > $(b).data('position') ? 1 : -1;
                    };

                    self.$left.find('option').each(function(index, option) {
                        $(option).data('position', index);
                    });

                    self.$right.find('option').each(function(index, option) {
                        $(option).data('position', index);
                    });
                }

                if ( typeof self.callbacks.startUp == 'function' ) {
                    self.callbacks.startUp( self.$left, self.$right );
                }

                if ( !self.skipInitSort && typeof self.callbacks.sort == 'function' ) {
                    self.$left.mSort(self.callbacks.sort);
                }

                // Get left filter
                if (self.options.leftSearch) {
                    self.options.$leftSearch = $(self.options.leftSearch);
                } else if ($('#' + self.id + '_leftSearch').length > 0) {
                    self.options.$leftSearch = $('#' + self.id + '_leftSearch');
                }

                // Get right filter
                if (self.options.rightSearch) {
                    self.options.$rightSearch = $(self.options.rightSearch);
                } else if ($('#' + self.id + '_rightSearch').length > 0) {
                    self.options.$rightSearch = $('#' + self.id + '_rightSearch');
                }

                // Get left bulk add
                if (self.options.leftBulk) {
                    self.options.$leftBulk = $(self.options.leftBulk);
                } else if ($('#' + self.id + '_leftBulk').length > 0) {
                    self.options.$leftBulk = $('#' + self.id + '_leftBulk');
                }

                // Initialize events
                self.events();
            },

            events: function() {
                var self = this;

                // prevent events firing from selects unless desired
                if (self.options.stopPropagation) {
                    self.$left.on('change keyup', function(e, shouldPropagate) {
                        if (!shouldPropagate) {
                            e.stopPropagation();
                        }
                    });

                    self.$right.on('change keyup', function(e, shouldPropagate) {
                        if (!shouldPropagate) {
                            e.stopPropagation();
                        }
                    });
                }

                // Attach event to left filter
                if (self.options.$leftSearch) {
                    self.options.$leftSearch.on('keyup', function(e) {
                        self.$left.mfilter(this.value);
                    });
                    if (self.options.stopPropagation) {
                        self.options.$leftSearch.on('change input keyup', function(e) {
                            e.stopPropagation();
                        });
                    }
                }

                // Attach event to right filter
                if (self.options.$rightSearch) {
                    self.options.$rightSearch.on('keyup', function(e) {
                        self.$right.mfilter(this.value);
                    });
                    if (self.options.stopPropagation) {
                        self.options.$rightSearch.on('change input keyup', function(e) {
                            e.stopPropagation();
                        });
                    }
                }

                // Prevent events firing from left bulk
                if (self.options.stopPropagation && self.options.$leftBulk) {
                    self.options.$leftBulk.on('change input keyup', function(e) {
                        e.stopPropagation();
                    });
                }

                // Select all the options from left and right side when submiting the parent form
                self.$right.closest('form').on('submit', function(e) {
                    self.$left.children().prop('selected', self.options.submitAllLeft);
                    self.$right.children().prop('selected', false);
                    // self.$right.children().prop('selected', self.options.submitAllRight);
                    var chosen = self.right.querySelectorAll('option');
                    var chosenIds = [];
                    for (var i = 0; i < chosen.length; i++) {
                        var v = chosen[i].value;
                        if (v.length > 0) {
                            chosenIds.push(v);
                        }
                    }

                    var $combinedHidden = $('<input type="hidden" name="'+self.$right.attr('name')+'">');
                    $combinedHidden.val(chosenIds.join(','));
                    self.$right.before($combinedHidden);
                });

                // Attach event for double clicking on options from left side
                self.$left.on('dblclick', 'option', function(e) {
                    e.preventDefault();

                    var options = self.left.querySelectorAll('option:checked');

                    if ( options.length ) {
                        self.moveToRight(options, e);
                    }
                });

                // Attach event for double clicking on options from right side
                self.$right.on('dblclick', 'option', function(e) {
                    e.preventDefault();

                    var options = self.right.querySelectorAll('option:checked');

                    if ( options.length ) {
                        self.moveToLeft(options, e);
                    }
                });

                // dblclick support for IE
                if ( navigator.userAgent.match(/MSIE/i)  || navigator.userAgent.indexOf('Trident/') > 0 || navigator.userAgent.indexOf('Edge/') > 0) {
                    self.$left.dblclick(function(e) {
                        self.actions.$rightSelected.trigger('click');
                    });

                    self.$right.dblclick(function(e) {
                        self.actions.$leftSelected.trigger('click');
                    });
                }

                self.actions.$rightSelected.on('click', function(e) {
                    e.preventDefault();
                    var options = null;
                    if (self.options.$leftBulk && self.options.$leftBulk.val().length > 0) {
                        options = [];

                        // get and scrub tokens
                        var text = self.options.$leftBulk.val();
                        var tokens = text.split(/\n/).filter(function(item) {
                            if (item.length > 0) {
                                return item.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&").toLowerCase();
                            }
                        });

                        if (tokens.length > 0) {
                            // get all matching options
                            var allOptions = self.left.querySelectorAll("option");
                            for (var i = 0; i < allOptions.length; i++) {
                                var against = allOptions[i].innerHTML.toLowerCase();
                                for (var j = tokens.length - 1; j >= 0; j--) {
                                    if (against.indexOf(tokens[j]) > -1 && against.match(new RegExp("([^0-9]|^)0*"+tokens[j]+"([^0-9]|$)", 'g'))) {
                                        options.push(allOptions[i]);
                                        // tokens.splice(j, 1); performance change is minimal now that it's using indexOf
                                        continue;
                                    }
                                }
                            }
                        }
                        self.options.$leftBulk.val('');
                    } else {
                        options = self.left.querySelectorAll("option:checked");
                    }

                    if (options && options.length) {
                        self.moveToRight(options, e);
                    }

                    $(this).blur();
                });

                self.actions.$leftSelected.on('click', function(e) {
                    e.preventDefault();

                    var options = self.right.querySelectorAll("option:checked");

                    if ( options.length ) {
                        self.moveToLeft(options, e);
                    }

                    $(this).blur();
                });

                self.actions.$rightAll.on('click', function(e) {
                    e.preventDefault();

                    var options = self.left.querySelectorAll("option");

                    if ( options.length ) {
                        self.moveToRight(options, e);
                    }

                    $(this).blur();
                });

                self.actions.$leftAll.on('click', function(e) {
                    e.preventDefault();

                    var options = self.right.querySelectorAll("option");

                    if ( options.length ) {
                        self.moveToLeft(options, e);
                    }

                    $(this).blur();
                });

            },

            moveToRight: function(options, event, silent, skipStack ) {
                var self = this;

                if ( typeof self.callbacks.moveToRight == 'function' ) {
                    return self.callbacks.moveToRight( self, options, event, silent, skipStack );
                } else {
                    if ( typeof self.callbacks.beforeMoveToRight == 'function' && !silent ) {
                        if ( !self.callbacks.beforeMoveToRight( self.$left, self.$right, options ) ) {
                            return false;
                        }
                    }
                    if (self.options.$rightSearch && self.options.$rightSearch.val().length !== 0) {
                        self.options.$rightSearch.val('');
                        self.$right.mfilter('');
                    }

                    var fragment = document.createDocumentFragment();
                    for ( var e = 0; e < options.length; e++ ) {
                        fragment.appendChild( options[e] );
                    }

                    self.right.appendChild(fragment.cloneNode(true) );

                    if ( typeof self.callbacks.sort == 'function' && !silent ) {
                        self.$right.mSort(self.callbacks.sort);
                    }

                    if ( typeof self.callbacks.afterMoveToRight == 'function' && !silent ) {
                        self.callbacks.afterMoveToRight( self.$left, self.$right, options );
                    }

                    self.$right.trigger('change', true);
                    return self;
                }
            },

            moveToLeft: function( options, event, silent, skipStack ) {
                var self = this;

                if ( typeof self.callbacks.moveToLeft == 'function' ) {
                    return self.callbacks.moveToLeft( self, options, event, silent, skipStack );
                } else {
                    if ( typeof self.callbacks.beforeMoveToLeft == 'function' && !silent ) {
                        if ( !self.callbacks.beforeMoveToLeft( self.$left, self.$right, options ) ) {
                            return false;
                        }
                    }

                    if (self.options.$leftSearch && self.options.$leftSearch.val().length !== 0) {
                        self.options.$leftSearch.val('');
                        self.$left.mfilter('');
                    }

                    var fragment = document.createDocumentFragment();
                    for ( var e = 0; e < options.length; e++ ) {
                        fragment.appendChild( options[e] );
                    }

                    self.left.appendChild(fragment.cloneNode(true) );

                    if ( typeof self.callbacks.sort == 'function' && !silent ) {
                        self.$left.mSort(self.callbacks.sort);
                    }

                    if ( typeof self.callbacks.afterMoveToLeft == 'function' && !silent ) {
                        self.callbacks.afterMoveToLeft( self.$left, self.$right, options );
                    }

                    self.$left.trigger('change', true);
                    return self;
                }
            },
        };

        return Multiselect;
    })($);

    $.multiselect = {
        defaults: {
            /** will be executed once - remove from $left all options that are already in $right
             *
             *  @method startUp
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
            **/
            startUp: function( $left, $right ) {
                $right.find('option').each(function(index, option) {
                    var $option = $left.find('option[value="' + option.value + '"]');
                    var $parent = $option.parent();

                    $option.remove();
                });
            },

            /** will be executed each time before moving option[s] to right
             *
             *  IMPORTANT : this method must return boolean value
             *      true    : continue to moveToRight method
             *      false   : stop
             *
             *  @method beforeMoveToRight
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
             *
             *  @default true
             *  @return {boolean}
            **/
            beforeMoveToRight: function($left, $right, $options) { return true; },

            /*  will be executed each time after moving option[s] to right
             *
             *  @method afterMoveToRight
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
            **/
            afterMoveToRight: function($left, $right, $options) {},

            /** will be executed each time before moving option[s] to left
             *
             *  IMPORTANT : this method must return boolean value
             *      true    : continue to moveToRight method
             *      false   : stop
             *
             *  @method beforeMoveToLeft
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
             *
             *  @default true
             *  @return {boolean}
            **/
            beforeMoveToLeft: function($left, $right, $options) { return true; },

            /*  will be executed each time after moving option[s] to left
             *
             *  @method afterMoveToLeft
             *  @attribute $left jQuery object
             *  @attribute $right jQuery object
             *  @attribute $options HTML object (the option[s] which was selected to be moved)
            **/
            afterMoveToLeft: function($left, $right, $options) {},

            /** sort options by option text
             *
             *  @method sort
             *  @attribute a HTML option
             *  @attribute b HTML option
             *
             *  @return 1/-1
            **/
            sort: function(a, b) {
                if (a.innerHTML == 'NA') {
                    return 1;
                } else if (b.innerHTML == 'NA') {
                    return -1;
                }

                return (a.innerHTML > b.innerHTML) ? 1 : -1;
            },
        }
    };

    $.fn.multiselect = function( options ) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data();

            var settings = $.extend({}, $.multiselect.defaults, data, options);

            return new Multiselect($this, settings);
        });
    };

    $.fn.removeIfEmpty = function() {
        if (!this.children().length) {
            this.remove();
        }

        return this;
    };

    $.fn.mfilter = function(filterBy) {
        var fragment = document.createDocumentFragment();
        var _this = this.get(0);
        var options = _this.querySelectorAll("option");
        var _filterBy = filterBy.toLowerCase();

        for ( var e = 0; e < options.length; e++ ) {
            if (_filterBy.length === 0 || options[e].innerHTML.toLowerCase().indexOf(_filterBy) > -1) {

                fragment.appendChild(options[e]);
            } else {
                var span = document.createElement('span');
                span.appendChild(options[e]);
                fragment.appendChild(span);
            }
        }

        this.empty();
        _this.appendChild(fragment.cloneNode(true) );
    };

    // sort options then reappend them to the select
    $.fn.mSort = function(callback) {
        var _this = this.get(0);
        var options = Array.prototype.slice.call(_this.querySelectorAll("option"), 0);
        options.sort(callback);
        var fragment = document.createDocumentFragment();
        for ( var e = 0; e < options.length; e++ ) {
            fragment.appendChild( options[e] );
        }

        _this.appendChild(fragment.cloneNode(true));

        return this;
    };
}));
