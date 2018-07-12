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
                this.container = $('<div />').addClass('jSelect').addClass(self.settings.cssClass).attr('id', self.settings.id);
                self.$elem.before(this.container);

                this.selected = $('<div />').addClass('jSelect-selected').text(self.settings.placeholder);

                this.container.append(this.selected);

                this.wrapper = $('<div />').addClass('jSelect-wrapper');
                this.container.append(this.wrapper);
                this.container.append(self.$elem);

                this.createOptions();

                self.$elemParent = self.$elem.parent();
                self.$elemWrapper = $('.jSelect-wrapper', self.$elemParent);
                self.$elemWrapperChildren = self.$elemWrapper.children();

                var value = self.$elem.val();

                if (value && value.length > 0) {
                    methods.updateValue.call(self.elem, value);
                } else if(self.settings.value.length > 0) {
                    methods.updateValue.call(self.elem, self.settings.value);
                } else {
                    this.selected.addClass('placeholder');
                }
            },

            createOptions: function () {
                for (var i = 0; i < self.$elem.children().length; i++) {
                    var option = self.$elem.children()[i];
                    if(!$(option).attr('disabled')) {
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
                });
            },

            showDropdown: function (e) {
                methods.open.call(self, e);
            },

            hideDropdown: function (e) {
                methods.close.call(self, e);
            },

            addEventHandlers: function () {
                self.$elemParent.click(function (e) {
                    _private.showDropdown(e);

                    return false;
                });

                $(document).click(_private.hideDropdown);
                $(document).on("keydown", _private.triggerKeys);
            },
            
            removeEventHandlers: function() {
                self.$elemParent.off();
                $(document).off();
            },

            triggerKeys: function (e) {
                if (self.$elemParent.hasClass('open')) {

                    if (e.keyCode === 40) {
                        _private.keyPresses++;
                        _private.moveDown();
                    } else if (e.keyCode === 38) {
                        _private.keyPresses--;
                        _private.moveUp();
                    } else if (e.keyCode === 13) {
                        if (_private.keyPresses > -1) {
                            var option = $(self.$elemWrapperChildren[_private.keyPresses]);
                            methods.selectOption.call(self.elem, option);
                        }

                        if (e.stopPropagation) {
                            e.stopPropagation();
                            e.preventDefault();
                        } else {
                            e.returnValue = false;
                        }

                        methods.close.call(self, e);
                    } else if (e.keyCode !== 0) {
                        _private.textSearch(e);
                    }

                    if (_private.keyPresses >= 0) {
                        var option = $(self.$elemWrapperChildren[_private.keyPresses]);
                        _private.scrollOptions(self.$elemWrapper, option);
                    }
                }
            },

            moveDown: function () {
                if (_private.keyPresses >= self.$elemWrapperChildren.length) {
                    _private.keyPresses = 0;
                }

                $(self.$elemWrapperChildren).removeClass('active');
                $(self.$elemWrapperChildren[_private.keyPresses]).addClass('active');
            },

            moveUp: function () {
                if (_private.keyPresses < 0) {
                    _private.keyPresses = self.$elemWrapperChildren.length - 1;
                }
                
                $(self.$elemWrapperChildren).removeClass('active');
                $(self.$elemWrapperChildren[_private.keyPresses]).addClass('active');
            },

            textSearch: function (e) {
                clearTimeout(_private.enterTimeout);
                _private.enteredText += String.fromCharCode(e.keyCode);
                
                self.$elemWrapperChildren.removeClass('active');

                for (var i = 0; i < self.$elemWrapperChildren.length; i++) {
                    var option = $(self.$elemWrapperChildren[i]);
                    if (option.text().toLowerCase().indexOf(_private.enteredText.toLowerCase()) === 0) {
                        option.addClass('active')
                        _private.scrollOptions(self.$elemWrapper, option); 
                        _private.keyPresses = i;
                    }
                }
                                               
                _private.enterTimeout = setTimeout(function () {
                    _private.enteredText = '';
                }, 500);
            },
            
            setWidth: function() {
                var containerWidth = self.$elemParent[0].getBoundingClientRect().width;

                self.$elemWrapper.css({
                    width: containerWidth
                });  
            },

            setNumberOfOptionsShown: function () {
                if (self.settings.size > 0 && self.$elemWrapperChildren.length > self.settings.size) {
                    var option = $(self.$elemWrapperChildren[0]);
                    var height = option.outerHeight();
                    var wrapperHeight = (height * self.settings.size);
                    
                    self.$elemWrapper.css({
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

            if(!$(element).parent().hasClass('jSelect')) {
                _private.createMarkup();

                if(self.settings.disabled) {
                    $(element).parent().addClass('disabled');
                } else {
                    _private.addEventHandlers();
                }
            }
            
            if(methods[options]) {
                methods[options].call(element, args[0]);
            }
        };
        
        var methods = {
            
            open: function() {
                _private.setWidth();
                
                if (this.$elemParent.hasClass('open')) {
                    this.$elemParent.removeClass('open');

                    if (this.$elem.val() === null) {
                        this.$elem.val(null).trigger('change');
                    }
                } else {
                    this.$elemParent.addClass('open');
                    _private.setNumberOfOptionsShown();
                }
            },
            
            close: function() {
                if (this.$elemParent.hasClass('open')) {
                    this.$elemParent.removeClass('open');
                
                    if (this.$elem.val() === null) {
                        this.$elem.val(null).trigger('change');
                        self.$elemWrapperChildren.removeClass('active');
                    }
                }
            },
            
            updateValue: function(value) {
                for (var i = 0; i < this.$elemWrapperChildren.length; i++ ) {
                    if ($(this.$elemWrapperChildren[i]).attr('data-option-value') === value) {
                        methods.selectOption.call(select, $(this.$elemWrapperChildren[i]));
                    }
                }
            },
            
            selectOption: function(option) {
                var optionText = option.text(),
                    optionValue = option.attr('data-option-value')

                self.$elemWrapperChildren.removeClass('active');
                option.addClass('active');
                
                $('.jSelect-selected', self.$elemParent).text(optionText).removeClass('placeholder');  
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
                self.$elemParent.removeClass('disabled');
                select.attr('disabled', false);
                
                self.settings.disabled = false;
                _private.addEventHandlers.call(self.elem);
            },
            
            disable: function() {
                self.$elemParent.addClass('disabled');
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
        cssClass: '',
        placeholder: 'Please select an option',
        onChange: function (value) {},
        size: 0,
        keyBoardInput: true,
        value: '',
        disabled: false
    }
})(jQuery);