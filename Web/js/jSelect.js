(function ($) {
    "use strict";

    $.jSelect = function (element, options, test) {
        var self;

        var _private = {
            container: '',
            selected: '',
            wrapper: '',
            keyPresses: -1,
            enterTimeout: function () {},
            enteredText: '',

            createMarkup: function () {
                this.container = $('<div />').addClass('jSelect').attr('id', self.settings.id);
                self.$elem.before(this.container);

                this.selected = $('<div />').addClass('jSelect-selected').text(self.settings.placeholder);

                if (self.settings.value.length > 0) {
                    methods.updateValue.call(self.elem, self.settings.value);
                } else {
                    this.selected.addClass('placeholder');
                }

                this.container.append(this.selected);

                this.wrapper = $('<div />').addClass('jSelect-wrapper');
                this.container.append(this.wrapper);
                this.container.append(self.$elem);

                this.createOptions();
            },

            createOptions: function () {
                for (var i = 0; i < self.$elem.children().length; i++) {
                    var option = self.$elem.children()[i];
                    if(!$(option).attr('disabled') && !$(option).attr('selected')) {
                        _private.createOption(option);
                    }
                }
            },

            createOption: function (option) {
                var newOption = $('<div />').addClass('jSelect-option')
                    .attr('data-option-value', $(option).val())
                    .text($(option).text());

                this.wrapper.append(newOption);
                this.listenForOptionClick(newOption);
            },

            listenForOptionClick: function (option) {
                option.click(function() {
                    methods.selectOption.call(self.elem, option);
                    methods.close.call(self);
                });
            },

            showDropdown: function (e) {
                methods.open.call(self, e);
            },

            hideDropdown: function (e) {
                methods.close.call(self, e);
            },

            addEventHandlers: function () {
                var select = $(self.elem),
                    jSelect = select.parent();

                jSelect.find('.jSelect-selected').click(function (e) {
                    jSelect.removeClass('open');
                    _private.showDropdown(e);

                    return false;
                });

                $(document).click(_private.hideDropdown);
                $(document).on("keydown", _private.triggerKeys);
            },

            removeEventHandlers: function() {
                var select = $(self.elem),
                    jSelect = select.parent();

                jSelect.off();
                $(document).off();
            },

            triggerKeys: function (e) {
                var select = $(self.elem),
                    jSelect = select.parent(),
                    jSelectWrapper = $('.jSelect-wrapper', jSelect);

                if (jSelect.hasClass('open')) {

                    if (e.keyCode === 40) {
                        _private.keyPresses++;
                        _private.moveDown();
                    }

                    if (e.keyCode === 38) {
                        _private.keyPresses--;
                        _private.moveUp();
                    }

                    if (e.keyCode === 13) {
                        if (_private.keyPresses > -1) {
                            var option = $(jSelectWrapper.children()[_private.keyPresses]);
                            methods.selectOption.call(self.elem, option);
                        }

                        if (e.stopPropagation) {
                            e.stopPropagation();
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }

                        methods.close.call(self, e);
                    }

                    if (e.keyCode !== 0) {
                        _private.textSearch(e);
                    }

                    if (_private.keyPresses >= 0) {
                        var option = $(jSelectWrapper.children()[_private.keyPresses]);
                        _private.scrollOptions(jSelectWrapper, option);
                    }
                }
            },

            moveDown: function () {
                var select = $(self.elem),
                    jSelect = select.parent(),
                    jSelectWrapper = $('.jSelect-wrapper', jSelect);

                if (_private.keyPresses >= jSelectWrapper.children().length) {
                    _private.keyPresses = 0;
                }

                $(jSelectWrapper.children()).removeClass('active');
                $(jSelectWrapper.children()[_private.keyPresses]).addClass('active');
            },

            moveUp: function () {
                var select = $(self.elem),
                    jSelect = select.parent(),
                    jSelectWrapper = $('.jSelect-wrapper', jSelect);

                if (_private.keyPresses < 0) {
                    _private.keyPresses = jSelectWrapper.children().length - 1;
                }

                $(jSelectWrapper.children()).removeClass('active');
                $(jSelectWrapper.children()[_private.keyPresses]).addClass('active');
            },

            textSearch: function (e) {
                var select = $(self.elem),
                    jSelect = select.parent(),
                    jSelectWrapper = $('.jSelect-wrapper', jSelect);

                clearTimeout(_private.enterTimeout);
                _private.enteredText += String.fromCharCode(e.keyCode);

                for (var i = 0; i < jSelectWrapper.children().length; i++) {
                    var option = $(jSelectWrapper.children()[i]);
                    if (option.text().toLowerCase().indexOf(_private.enteredText.toLowerCase()) === 0) {
                        option.addClass('active')
                        _private.scrollOptions(jSelectWrapper, option);
                        _private.keyPresses = i;
                    } else {
                        option.removeClass('active');
                    }
                }

                _private.enterTimeout = setTimeout(function () {
                    _private.enteredText = '';
                }, 500);
            },

            setWidth: function() {
                var select = $(self.elem),
                    jSelect = select.parent(),
                    jSelectWrapper = $('.jSelect-wrapper', jSelect);

                var containerWidth = jSelect[0].getBoundingClientRect().width;

                jSelectWrapper.css({
                    width: containerWidth
                });
            },

            setNumberOfOptionsShown: function () {
                var select = $(self.elem),
                    jSelect = select.parent(),
                    jSelectWrapper = $('.jSelect-wrapper', jSelect);

                if (self.settings.size > 0 && jSelectWrapper.children().length > self.settings.size) {
                    var option = $(jSelectWrapper.children()[0]);
                    var height = option.outerHeight();
                    var wrapperHeight = (height * self.settings.size);

                    jSelectWrapper.css({
                        maxHeight: wrapperHeight
                    });
                }
            },

            scrollOptions: function (optionsWrapper, nextOption) {
                var scrollWrapper = optionsWrapper[0].getBoundingClientRect(),
                    option = nextOption[0].getBoundingClientRect();

                if (scrollWrapper.top > option.top) {
                    optionsWrapper.scrollTop(optionsWrapper.scrollTop() - scrollWrapper.top + option.top);
                } else if (scrollWrapper.bottom < option.bottom) {
                    optionsWrapper.scrollTop(optionsWrapper.scrollTop() - scrollWrapper.bottom + option.bottom);
                }
            }
        };

        this.init = function (args) {
            self = this;

            this.elem = element;
            this.$elem = $(element);
            this.settings = $.extend(true, {}, $.jSelect.defaults, options);
            this.settings.id = this.settings.id || this.$elem.attr('id') || new Date().toString();

            if (!$(element).parent().hasClass('jSelect')) {
                _private.createMarkup();
                if (self.settings.disabled) {
                    $(element).parent().addClass('disabled');
                } else {
                    _private.addEventHandlers();
                }
            }

            if (methods[options]) {
                methods[options].call(element, args[0]);
            }
        };

        var methods = {

            open: function() {
                var select = this.$elem,
                    jSelect = select.parent();

                _private.setWidth()
                _private.setNumberOfOptionsShown();

                if (jSelect.hasClass('open')) {
                    jSelect.removeClass('open');

                    if (this.$elem.val() === null) {
                        this.$elem.val(null).trigger('change');
                    }
                } else {
                    jSelect.addClass('open');
                }
            },

            close: function() {
                var select = this.$elem,
                    jSelect = select.parent();

                if (jSelect.hasClass('open')) {
                    jSelect.removeClass('open');

                    if (this.$elem.val() === null) {
                        this.$elem.val(null).trigger('change');
                    }
                }
            },

            updateValue: function(value) {
                var select = $(this),
                    jSelect = select.parent(),
                    jSelectOptions = $('.jSelect-wrapper', jSelect).children();

                for (var i = 0; i < jSelectOptions.length; i++ ) {
                    if ($(jSelectOptions[i]).attr('data-option-value') === value) {
                        methods.selectOption.call(select, $(jSelectOptions[i]));
                    }
                }
            },

            selectOption: function(option) {
                var select = $(this),
                    jSelect = select.parent(),
                    optionText = option.text(),
                    optionValue = option.attr('data-option-value')

                $('.jSelect-wrapper', jSelect).children().removeClass('active');
                option.addClass('active');

                $('.jSelect-selected', jSelect).text(optionText).removeClass('placeholder');  
                self.settings.currentValue = optionValue;

                for (var i = 0; i < self.$elem.children().length; i++) {
                    var selectedChild = $(self.$elem.children()[i]);

                    if (selectedChild.val() === optionValue) {
                        selectedChild.attr("selected", true);
                    } else {
                        selectedChild.removeAttr("selected");
                    }
                }

                self.$elem.val(optionValue).trigger('change');
                self.settings.onChange(self.settings.value);
            },

            enable: function() {
                var select = $(this),
                    jSelect = select.parent();

                jSelect.removeClass('disabled');
                select.attr('disabled', false);

                self.settings.disabled = false;
                _private.addEventHandlers.call(self.elem);
            },

            disable: function() {
                var select = $(this),
                    jSelect = select.parent();

                jSelect.addClass('disabled');
                select.attr('disabled', true);

                self.settings.disabled = true;
                _private.removeEventHandlers.call(self.elem);
            }
        }
    };

    $.fn.jSelect = function (options) {

        var args = Array.prototype.slice.call(arguments, 1);

        return this.each(function () {
            var jSelect = new $.jSelect(this, options);
            $(this).data('jSelect', jSelect);
            jSelect.init(args);
        });
    };

    $.jSelect.defaults = {
        id: '',
        placeholder: 'Please select an option',
        value: '',
        size: 0,
        keyBoardInput: true,
        disabled: false,
        onChange: function (value) {},
    }
})(jQuery);
