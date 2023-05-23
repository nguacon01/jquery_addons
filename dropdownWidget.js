(function ($){
    $.widget("custom.dropdownWidget", {
        options: {
            name : '',
            apiUrl: '',
            apiParams: {},
            apiMethod: 'GET',
            apiHeaders: {},
            onSelect : function(data){}
        },

        _create: function(){
            this.doneTypingInterval = 900;
            this._createUI();
            this._bindEvents();
        },

        _createUI: function(){
            this.$input = $('<input>',{
                type : 'text',
                name : `${this.options.name}_input`,
                placeholder : 'Enter your search string'
            });
            this.$resultsList = $('<ul>');
            this.$selectedItemId = $('<input>',{
                type : 'hidden',
                name : `${this.options.name}_id`,
            });

            this.element.append(this.$input, this.$resultsList, this.$selectedItemId);
        },
        _bindEvents: function(){
            let self = this;

            this.$input.on('keyup', function(event){
                let searchTerm = `?query=${self.$input.val()}&limit=10`;
                clearTimeout(self.typingTimer);
                self.typingTimer = setTimeout(function(){
                    self._search(searchTerm);
                }, self.doneTypingInterval)
            });

            this.$resultsList.on('click', 'li', function(){
                let selectedData = $(this).data('data');
                self.options.onSelect(selectedData);
                self.$selectedItemId.val(selectedData.id);
                self.$input.val(selectedData.ref_dossier);
                self.$resultsList.empty();  
            });
        },

        _search: function(searchTerm){
            var self = this;
            $.ajax({
                url: `${self.options.apiUrl}${searchTerm}}`,
                method: self.options.apiMethod,
                headers: self.options.apiHeaders,
                success: function(data){
                    self._populateResults(data);
                },
                error: function(error){
                    self.$resultsList.empty();
                    console.log(error);
                }
            })
        },

        _populateResults: function(data){
            let self = this;
            this.$resultsList.empty();

            $.each(data.data, function(index, item){
                let $resultItem = $('<li>', {
                    text: item.ref_dossier,
                    key : item.id,
                    'data-data': JSON.stringify(item),
                })

                self.$resultsList.append($resultItem);
            });
        },
    });
})(jQuery)