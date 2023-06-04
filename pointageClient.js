(function ($){
    $.widget("custom.pointageClient", {
        options: {
            name : '',
            apiUrl: 'https://tabatabai-group-bis-detcom.odoo.com/extranet/api',
            apiGroup:'',
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
            this.$geolocationUI = $('<div class="geolocation_ui"></div>').geolocalizer({
                name: this.options.name + '-geolocation',
            });

            this.$input = $('<input>',{
                type : 'text',
                name : `${this.options.name}-code-emp`,
                placeholder : 'Votre matricule'
            });
            this.$resultsList = $('<ul>');
            this.$selectedItemId = $('<input>',{
                type : 'hidden',
                name : `${this.options.name}-emp-id`,
            });
            this.$empCode = $('<input>',{
                type : 'hidden',
                name : `${this.options.name}-emp-code`,
            });
            this.$buttonCheckin = $('<button>',{
                text: 'Checkin',
                class: 'btn btn-primary'
            })
            this.$project_id = $('<input>',{
                type : 'hidden',
                name : `${this.options.name}-project-id`,
            })

            this.element.append(this.$geolocationUI, this.$input, this.$resultsList, this.$selectedItemId, this.$buttonCheckin, this.$empID, this.$project_id);
        },
        _bindEvents: function(){
            let self = this;

            this.$input.on('keyup', function(event){
                let searchTerm = `?code_emp=${self.$input.val()}&limit=10`;
                clearTimeout(self.typingTimer);
                self.typingTimer = setTimeout(function(){
                    self._search(searchTerm);
                }, self.doneTypingInterval)
            });

            this.$resultsList.on('click', 'li', function(){
                let selectedData = $(this).data('data');
                self.options.onSelect(selectedData);
                self.$selectedItemId.val(selectedData.id);
                self.$empCode.val(selectedData.code_emp);
                self.$input.val(selectedData.display_name);
                self.$resultsList.empty();
            });

            this.$buttonCheckin.on('click', function(){
                self._submitCheckin();
            })
        },

        _search: function(searchTerm){
            var self = this;
            apiURI = self._concatAndResolveUrl(self.options.apiGroup, 'check_emp')
            apiUrl = self._concatAndResolveUrl(self.options.apiUrl, apiURI)
            $.ajax({
                url: `${apiUrl}${searchTerm}`,
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
                    text: item.display_name,
                    key : item.id,
                    'data-data': JSON.stringify(item),
                })

                self.$resultsList.append($resultItem);
            });
        },

        _concatAndResolveUrl: function(url, concat) {
            var url1 = url.split('/');
            var url2 = concat.split('/');
            var url3 = [ ];
            for (var i = 0, l = url1.length; i < l; i ++) {
              if (url1[i] == '..') {
                url3.pop();
              } else if (url1[i] == '.') {
                continue;
              } else {
                url3.push(url1[i]);
              }
            }
            for (var i = 0, l = url2.length; i < l; i ++) {
              if (url2[i] == '..') {
                url3.pop();
              } else if (url2[i] == '.') {
                continue;
              } else {
                url3.push(url2[i]);
              }
            }
            return url3.join('/');
        },
        _submitCheckin: async function(){
            let self = this;
            apiURI = self._concatAndResolveUrl(self.options.apiGroup, 'checkin');
            apiUrl = self._concatAndResolveUrl(self.options.apiUrl, apiURI);

            let geolocation = document.getElementsByName(self.options.name + '-geolocation')[0].value;
            console.log(geolocation);

            try{
                const response = await fetch(apiUrl, {
                    method: "POST",
                    headers: {
                        "Authorization" : "Bearer 3bd407c4686e467097ee8d523ccc0294",
                        "Content-Type" : "application/xml"
                    },
                    body: JSON.stringify({
                        code_emp: self.$empCode.val(),
                        emp_id: parseInt(self.$selectedItemId.val()),
                        lat_lng: geolocation,
                        project_id: parseInt(self.$project_id.val()) || 24710
                    }),

                })
                const data = await response.json();
                console.log(data);
            }catch (error){
                throw new Error(error);
            }
        }
    });
})(jQuery)

if(!window.fbControls) window.fbControls = [];
window.fbControls.push(function(controlClass){
    
    class controlPointageClient extends controlClass{
        static get definition(){
            return {
                icon: '',
                i18n: {
                    default: 'Pointage Client',
                }
            }
        }

        configure(){
            this.js = '';
            this.css = '';
        }

        build(){
            return this.markup('div', null, {id: this.config.name});
        }

        onRender(){
            let self = this;
            $(`#${this.config.name}`).pointageClient({
                name: this.config.name,
                apiUrl: 'https://tabatabai-group-bis-detcom.odoo.com/extranet/api',
                apiGroup: 'pointage_client',
                apiHeaders: {
                    "Authorization" : "Bearer 3bd407c4686e467097ee8d523ccc0294",
                },
                apiMethod: 'GET'
            })
        }
    }

    controlClass.register('pointageClient', controlPointageClient);
    return controlPointageClient;
});