var  data = {
    items: [
        { id: 1, label: "First item" }, 
        { id: 2, label: "Second item parent", items: [
            { id: 3, label: "Sub First item" }, 
            { id: 4, label: "Sub Second item" },
            { id: 5, label: "Sub item parent", items: [
                { id: 6, label: "Sub sub First item" }, 
                { id: 7, label: "Sub sub Second item" },
                { id: 8, label: "Sub sub item parent", items: [
                    { id: 9, label: "Sub sub sub First item" }, 
                    { id: 10, label: "Sub sub sub Second item" }
                ]}
            ]}
        ]}
   ]
};


var init_data_list_dir = (function(){

    var dir = {};

    dir._items = [];

    dir.inspect_init = function(items, id){ 
        if ( !items && typeof items != 'object' ) { console.error('no items was provided'); return true; }
        if ( !id && typeof id != 'string' ) { console.error('no id was provided'); return true; }
        if ( !document.querySelector(id) ) { console.error('no el with such id was provided'); return true; } 
    }; 

    dir.inspect_node = function(el){ 
                if ( !el ) { console.error('no el was provided ' ); return true; }        
                if ( !el.id ) { console.error('empty id was provided ' ); return true; }
                if ( !el.label ) console.error('empty label was provided by el with ', el.id );
    };

    dir.set_items = function(items){
        dir._items = items;
    };

    dir.get_parent = function(parent_tag){
        if( typeof parent_tag === 'string' ) {
            var parent = document.createElement(parent_tag);
        } 
        if( typeof parent_tag === 'object' ) {
            var parent = parent_tag;
        }
        return parent;
    };

    dir.create_node = function(parent_tag, child_tag, items, id){
        var parent = dir.get_parent(parent_tag);         
        items.forEach(function(el){
            if ( typeof el === 'object' && !dir.inspect_node(el) ) {
                var child = document.createElement(child_tag);
                child.setAttribute("el-id", id + '' + el.id );
                child.setAttribute("class", 'data-list-li' );
                child.innerHTML = el.label || 'empty';
                parent.appendChild(child);
                if( el.items ) {
                    dir.create_node(child, 'li', el.items, id);
                }; 
            }
        });
        return parent;
    };

    dir.add_new_node_inp = function(id){
        var input = document.createElement('input');
        input.setAttribute( "type", 'number' );
        input.setAttribute( "id", 'add_new_node_inp_'+id );
        input.setAttribute("class", 'data-list-add-new-node-input' );
        return input;
    };

    dir.add_new_node_btn = function(id){
        var button = document.createElement('button');
        button.innerHTML = 'add new node' ;
        button.setAttribute( "id", 'add_new_node_btn_'+id );
        button.setAttribute("class", 'data-list-add-new-node-btn' );
        return button;
    };

    dir.add_new_node = function(id){
        var div = document.createElement('div');
        div.setAttribute("class", 'data-list-add-new-node-div' );
        div.appendChild( dir.add_new_node_inp(id) );
        div.appendChild( dir.add_new_node_btn(id) );
        return div;
    };

    dir.set_new_node_btn_listener = function(id){
        document.getElementById('add_new_node_btn_'+id).onclick = (function(){
            var cl_id = id;
            return function () {
                var val = document.getElementById('add_new_node_inp_'+cl_id).value;
                var el = dir.find_el_by_id( dir._items, id, val );
                console.log( el )
            };
        })();
    };

    dir.find_el_by_id = function(items, id, val){
        var value = Number(val);
        console.log( id +''+ value );
        var element = '';
        items.forEach(function(el){
            console.log( el.id , value );
            if( el.id == value ) element = document.getElementById(id + '' + value); console.log(id + '' + value);
            if( el.items ) dir.find_el_by_id(el.items, id, value);
        });
        return element;
    };


    return function init(items, id){
        if( dir.inspect_init(items, id ) ) return false;
        dir.set_items(items);
        var list_node = dir.create_node( 'ul', 'li', dir._items, id );

        document.querySelector(id).appendChild(list_node);
        document.querySelector(id).appendChild( dir.add_new_node(id) );
        dir.set_new_node_btn_listener(id);

        //console.log( 'awesome - ' , document.querySelector(id) );
    };
    

})();

init_data_list_dir(data.items, 'data-list');
