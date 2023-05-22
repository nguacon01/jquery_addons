(function ($){
    $.fn.apiDropdown = function(options) {
        let settings = $.extend({
            'apiUrl': '',
            'apiParams': {},
            'apiMethod': 'GET',
            'apiHeaders': {},
            'apiData': {},
            'apiDataType': 'json',
            'apiContentType': 'application/json',
        }, options);

        let $input = $('<input name="apiDropdownInput" placeholder="Enter your search string">');
        let $dropdownMenu = $('<ul name="apiDropdownMenu">');

        // console.log(settings)
        async function search(searchInputValue){
            try{
                const response = await fetch(settings.apiUrl + '?ref_dossier='+searchInputValue+'&limit=10', {
                    method: settings.apiMethod,
                    headers: settings.apiHeaders,
                })
                const data = await response.json();
                $dropdownMenu.html('');
                $.each(data.data, function(index, item){
                    let $option = $(`<li class="apiDropdownOption" key=${item.id}>`).html(item.ref_dossier);
                    $dropdownMenu.append($option);
                })
            }catch (error){
                throw new Error(error);
            }
        }
        
        $input.on('keyup', function(event){
            if (event.keyCode === 13) {
                let searchInputValue = $(this).val();
                console.log(searchInputValue);
                search(searchInputValue)
            }
        });

        return this.each(function(){
            $(this).append($input);
            $(this).append($dropdownMenu);
        });
    }
})(jQuery);