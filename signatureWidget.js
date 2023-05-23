(function ($){
    $.widget("ui.signatureWidget",{
        options: {
            name : '',
            apiUrl: '',
            apiParams: {},
            apiMethod: 'GET',
            apiHeaders: {},
            coor: {x:0, y:0},
            isDrawing: false,
        },

        _create: function(){
            this._createUI();
            this._bindEvents();
        },
        _createUI: function(){
            this.$name = $('<input>',{
                type : 'text',
                name : `${this.options.name}_name`,
                placeholder : 'Enter your name'
            });

            this.$canvas = $('<canvas/>',{
                width: 300,
                height: 150,
                id: `${this.options.name}_canvas`,
                name: `${this.options.name}_canvas`,
            });
            this.$canvas.css({
                border: '1px solid black',
            });

            this.$hidenCanvas = $('<input>',{
                id: `${this.options.name}_hiddenCanvas`,
                name: `${this.options.name}_hiddenCanvas`,
                type: 'hidden',
            });

            this.$currentIP = $('<input>',{
                id: `${this.options.name}_currentIP`,
                name: `${this.options.name}_currentIP`,
                type: 'hidden',
            });

            this.$buttonClear = $('<button>',{
                id: `${this.options.name}_buttonClear`,
                name: `${this.options.name}_buttonClear`,
                text: 'Clear',
            })

            this.$submit = $('<button>',{
                id: `${this.options.name}_submit`,
                name: `${this.options.name}_submit`,
                text: 'Submit',
            });
            
            this.element.append(this.$name, this.$canvas, this.$hidenCanvas, this.$currentIP, this.$buttonClear, this.$submit);
            this.canvasElement = this.$canvas[0];
            this.canvasData = [];
        },
        _bindEvents: function(){
            var self = this;
            var $canvas = $(this.canvasElement);

            $canvas.on('mousedown', function (event) {
                self._startDrawing(event);
            });

            $canvas.on('mouseup', function () {
                self._stopDrawing();
            });

            $canvas.on('mousemove', function (event) {
                self._draw(event);
            });

            self.$buttonClear.on('click', function(){
                self._clearCanvas();
            });

            self.$submit.on('click', function(){
                self.getCurrentIP()
            });

            self.$name.on('keyup', function(event){
                self.addText();
            });
        },
        _clearCanvas: function(){
            let self = this;
            let ctx = this.canvasElement.getContext('2d');
            ctx.clearRect(0, 0, self.canvasElement.width, self.canvasElement.height);
            self.canvasData = [];
            self.$hidenCanvas.val(JSON.stringify(self.canvasData));
            self.$name.val('');
        },
        _restoreCanvas: function(data){
            let self = this;
            let parseData = JSON.parse(data);
            let ctx = this.canvasElement.getContext('2d');
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'black';

            parseData.forEach(function(point,index){
                if (index === 0){
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
        },
        _draw: function(event){
            let self = this;
            if (!self.options.isDrawing) return;
            let ctx = this.canvasElement.getContext('2d'),
                coor = self.options.coor;
            ctx.beginPath();
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'black';
            ctx.moveTo(coor.x, coor.y);
            this.reposition(event);
            ctx.lineTo(coor.x, coor.y);
            ctx.stroke();
            self.saveCanvas(coor);
            
        },
        saveCanvas: function(coor){
            let self = this;
            let ctx = self.canvasElement.getContext('2d');
            console.log(ctx.save())
            self.canvasData.push({x: coor.x, y: coor.y});
            self.$hidenCanvas.val(JSON.stringify(self.canvasData));
        },
        _startDrawing: function(event){
            let self = this;
            self.options.isDrawing = true;
            self.reposition(event);       
        }, 
        _stopDrawing: function(){
            this.options.isDrawing = false;
        },
        reposition: function (event) {
            var self = this;
            var rect = self.canvasElement.getBoundingClientRect();
            self.options.coor.x = event.clientX - rect.left;
            self.options.coor.y = event.clientY - rect.top;
        },
        getCurrentIP: function(){
            let self = this;
            $.getJSON('https://api.ipify.org?format=json', function(data){
                self.$currentIP.val(data.ip);
            })
        },
        addText: function(){
            let self = this;
            let ctx = self.canvasElement.getContext('2d');
            ctx.font = '30px "Rock Salt"';
            ctx.fillText(self.$name.val(), 10, 50);
        },

    });
})(jQuery)