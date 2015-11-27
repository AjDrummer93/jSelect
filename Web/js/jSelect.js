var JSelect = function(elem, options) {
    this.originalSelectElement = elem;
    this.originalOptions = this.originalSelectElement.children;
    this.selectId = options.id || "";
    this.placeholder = options.placeholder || "Please choose an option";
    this.callback = options.onChange || function(value) {};
    this.size = options.size || 0;
    this.borderThickness = options.borderThickness || 2;
    this.keyBoardInput = options.keyBoardInput || true;
    this.currentValue = options.currentValue || "";
    this.currentSelectedText = options.currentSelectedText || "";

    this.isOpen = false;
    this.keyPresses =  -1;

    this.container = document.createElement("div");
    this.selected = document.createElement("div");
    this.wrapper = document.createElement("div");

    this.originalSelectElement.style.display = "none";
    
    if(!window.getComputedStyle) {
        window.getComputedStyle = function(element) { 
            return element.currentStyle; 
        };
    }

    this.create();
};

JSelect.prototype = function() {

    var private = {
        
        enteredText: "",
        enterTimeout: function() {},

        createMarkUp: function() {
            this.container.setAttribute("id", this.selectId);
            utils.addClass(this.container, "jselect");
            this.originalSelectElement.parentNode.insertBefore(this.container, this.originalSelectElement);

            var cssClass = this.currentValue.length > 0 ? "jselect-selected" :  "jselect-selected placeholder";
            utils.addClass(this.selected, cssClass);
            this.selected.innerHTML = this.currentSelectedText.length > 0 ? this.currentSelectedText : this.placeholder;
            this.container.appendChild(this.selected);

            utils.addClass(this.wrapper, "jselect-wrapper");
            this.container.appendChild(this.wrapper);
            this.container.appendChild(this.originalSelectElement, this.wrapper);
        },

        createOptions: function() {
            var self = this;

            for(var i = 0; i < self.originalOptions.length; i++) {
                var child = self.originalOptions[i];
                if(!child.selected || !child.disabled) {
                    private.createOption.call(this, child);
                }   
            }
        },

        createOption: function(optionToCreate) {
            var option = document.createElement("div");

            utils.addClass(option, "jselect-option");
            option.setAttribute("data-option-value", optionToCreate.value);
            option.innerHTML = optionToCreate.innerHTML;

            this.wrapper.appendChild(option);

            private.listenForOptionClick.call(this, option);
        },

        listenForOptionClick: function(option) {
            var self = this;

            if(option.addEventListener) {
                option.addEventListener("click", function(e) {
                    self.selectOption(e);
                });
            } else {
                option.attachEvent("onclick", function(e) {
                    self.selectOption(e);
                });
            }
        },

        triggerKeys: function(e) {
            var self = this;

            if(self.isOpen) {
                if(e.keyCode === 40) {
                    self.keyPresses++;
                    private.moveDown.call(this);
                }

                if(e.keyCode === 38) {
                    self.keyPresses--;
                    private.moveUp.call(this);
                }

                if(e.keyCode === 13 || e.keyCode === 9) {
                    if(self.keyPresses > -1) {
                        self.selectOption(self.wrapper.children[self.keyPresses]);
                    }
                    
                    if(e.stopPropagation) {
                        e.stopPropagation();
                        e.preventDefault();
                    } else {
                        e.returnValue = false;
                    }
                    
                    self.close(e);
                }
                
                if(e.keyCode !== 0) {
                    clearTimeout(private.enterTimeout);
                    private.enteredText += String.fromCharCode(e.keyCode);
                    
                    for(var i = 0; i < this.wrapper.children.length; i++) {
                        var option = this.wrapper.children[i];
                        if(option.innerText.toLowerCase().indexOf(private.enteredText.toLowerCase()) === 0) {
                            utils.addClass(option, "active");
                            private.scrollOptions(self.wrapper, option);
                            self.keyPresses = i;
                        }
                    }
                    
                    private.enterTimeout = setTimeout(function() {
                        private.enteredText = "";
                    }, 500);
                }

                if(self.keyPresses >= 0) {
                    private.scrollOptions(self.wrapper, self.wrapper.children[self.keyPresses]);
                }
            }
        },

        moveDown: function() {
            var self = this;

            if(self.keyPresses >= self.wrapper.children.length) {
                self.keyPresses = 0;
            }

            var childNumber = self.keyPresses > 0 ? self.keyPresses - 1 : self.keyPresses;
            
            utils.removeClass(self.wrapper.children[childNumber], "active");
            utils.removeClass(self.wrapper.children[self.wrapper.children.length - 1], "active");
            utils.addClass(self.wrapper.children[self.keyPresses], "active");
        },

        moveUp: function() {
            var self = this;

            if(self.keyPresses < 0) {
                self.keyPresses = self.wrapper.children.length - 1;
            }

            var childNumber = self.keyPresses < 0 ? self.keyPresses: self.keyPresses + 1;
            childNumber = childNumber >= self.wrapper.children.length ? self.wrapper.children.length - 1 : childNumber;

            utils.removeClass(self.wrapper.children[childNumber], "active");
            utils.removeClass(self.wrapper.children[0], "active");
            utils.addClass(self.wrapper.children[self.keyPresses], "active");
        },

        scrollOptions: function(optionsWrapper, nextOption) {
            var scrollWrapper = optionsWrapper.getBoundingClientRect(),
                option = nextOption.getBoundingClientRect();

            if (scrollWrapper.top > option.top ) {
                optionsWrapper.scrollTop = optionsWrapper.scrollTop - scrollWrapper.top + option.top;
            } else if (scrollWrapper.bottom < option.bottom ) {
                optionsWrapper.scrollTop = optionsWrapper.scrollTop - scrollWrapper.bottom + option.bottom;
            }
        },

        setNumberOfOptionsShown: function() {
            var self = this;

            if(self.size > 0) {
                var option = self.wrapper.children[0].getBoundingClientRect();
                var height = option.height || option.bottom - option.top;
                
                var borderThickness = private.getBorderThickness(self.wrapper);
                var wrapperHeight = (height * self.size) + (borderThickness * 2);
                self.wrapper.style.maxHeight = wrapperHeight + "px";
            }
        },
        
        getBorderThickness: function(element) {
            var self = this;
            
            var borderWidth = window.getComputedStyle(element).borderWidth.split("px")[0];
            return borderWidth.length > 0 ? borderWidth : 1;
        },
        
        showDropdown: function(e) {
            var self = this;
            
            self.open(e);
            private.setNumberOfOptionsShown.call(self);

            var container = self.container.getBoundingClientRect();
            var width = container.width || container.right - container.left;
            
            
            var borderThickness = private.getBorderThickness(self.wrapper);
            var wrapperWidth = width - (borderThickness * 2) + "px";
            self.wrapper.style.width = wrapperWidth;
        }
    };

    var utils = {
        
        hasClass: function(element, cssClass) {
            return !!element.className.match(new RegExp("(\\s|^)" + cssClass + "(\\s|$)"));
        },

        addClass: function(element, cssClass) {
            if (!this.hasClass(element,cssClass)) {
                element.className += " " + cssClass;
            }
        },

        removeClass: function(element, cssClass) {
            if (this.hasClass(element, cssClass)) {
                var reg = new RegExp("(\\s|^)" + cssClass + "(\\s|$)");
                element.className = element.className.replace(reg, "  ");
            }
        }
    };
    
    var create = function() {
        var self = this;

        private.createMarkUp.call(this);
        private.createOptions.call(this);

        if(self.container.addEventListener) {
            self.container.addEventListener("click", function(e) {
                private.showDropdown.call(self, e);
            });
        } else {
            self.container.attachEvent("onclick", function(e) {
                private.showDropdown.call(self, e);
            });
        }

        if(self.keyBoardInput) {
            
            if(document.addEventListener) {
                document.addEventListener("keydown", function(e) {
                    private.triggerKeys.call(self, e);
                });
            } else {
                document.attachEvent("onkeydown", function(e) {
                    private.triggerKeys.call(self, e);
                });
            }
        }
        
        if(document.addEventListener) {
            document.addEventListener("click", function(e) {
                self.close(e);
            });
        } else {
            document.attachEvent("onclick", function(e) {
                self.close(e);
            });
        }

        return self;
    },

    open = function(e) {
        var self = this;

        var currentClass = self.container.className;

        if(currentClass.indexOf("open") < 0) {
            self.isOpen = true;
            utils.addClass(self.container, "open");
        } else {
            utils.removeClass(self.container, "open");
        }
    },

    close = function(e) {
        var self = this;

        if(e !== undefined) {
            var parentElement = e.target !== undefined ? e.target.parentElement : e.srcElement.parentElement;
            
            if((e.keyCode === 13 || e.keyCode === 9) || (parentElement !== self.container)) {
                if(self.container.className.indexOf("open") > 0) {
                    self.isOpen = false;
                    utils.removeClass(self.container, "open");
                }
            }
        } else {
            if(self.container.className.indexOf("open") > 0) {
                self.isOpen = false;
                utils.removeClass(self.container, "open");
            }
        }
        
        for(var i = 0; i < self.wrapper.children.length; i++) {
            var option = self.wrapper.children[i];
            if(option.innerText !== self.currentSelectedText) {
                utils.removeClass(option, "active");
            }
        }
    },

    selectOption = function(selectedOption) {
        var self = this;
        
        var option = selectedOption.innerText ? selectedOption : selectedOption.srcElement;
        
        var selectedOptionText = option.innerText,
            selectedOptionValue = option.getAttribute("data-option-value");

        self.selected.innerText = selectedOptionText;
        self.updateCurrentValue(selectedOptionValue);
        self.updateCurrentSelectedText(selectedOptionText);
        utils.removeClass(self.selected, "placeholder");

        for(var i = 0; i < self.originalOptions.length; i++) {
            var selectedChild = self.originalOptions[i];

            if(selectedChild.value === selectedOptionValue) {
                selectedChild.setAttribute("selected", true);
            } else {
                selectedChild.removeAttribute("selected");
            }
        }
        
        if(self.callback !== undefined) {
            self.callback(self.currentValue);
        }
    },

    updateCurrentValue = function(value) {
        this.currentValue = value;
    },
        
    updateCurrentSelectedText = function(value) {
        this.currentSelectedText = value;
    };

    return {
        create: create,
        open: open,
        close: close,
        selectOption: selectOption,
        updateCurrentValue: updateCurrentValue,
        updateCurrentSelectedText: updateCurrentSelectedText
    };
}();