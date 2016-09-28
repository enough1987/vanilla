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
        if ( !document.querySelector("#"+id) ) { console.error('no el with such id was provided'); return true; } 
    }; 

    dir.inspect_node = function(el){ 
                if ( !el ) { console.error('no el was provided ' ); return true; }        
                if ( !el.id ) { console.error('empty id was provided ' ); return true; }
                if ( !el.label ) console.error('empty label was provided by el with ', el.id );
    };

    dir.set_items = function(items){
        dir._items = items;
    };

    dir.create_element = function(opt){
        var el = document.createElement(opt.name);
        if( opt.type ) el.setAttribute( "type", opt.type );
        if( opt.id ) el.setAttribute( "id", opt.id );
        if( opt.class ) el.setAttribute("class", opt.class );
        if( opt.placeholder ) el.setAttribute("placeholder", opt.placeholder );
        if( opt.innerHTML ) el.innerHTML = opt.innerHTML ;
        if( opt['el-id'] ) el.setAttribute("el-id", opt['el-id'] );
        return el;
    };

    dir.get_parent = function(parent_tag){
        if( typeof parent_tag === 'string' ) {
            var parent = dir.create_element({name:parent_tag});
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
                var child = dir.create_element({
                    name: child_tag, "el-id": id + '' + el.id, 
                    class: 'data-list-li', innerHTML: el.label + ' ' + el.id || 'empty' + ' ' + el.id
                });
                parent.appendChild(child);
                if( el.items ) {
                    dir.create_node(child, 'li', el.items, id);
                }; 
            }
        });
        return parent;
    };

    dir.add_new_node = function(id){
        var div = dir.create_element({
            name: 'div', class: 'data-list-add-new-node-div', 
        });
        div.appendChild( dir.create_element({
            name: 'input', type: 'number', id: 'add_new_node_inp_'+id, 
            class: 'data-list-add-new-node-input', placeholder : 'parent id'
        }));
        div.appendChild( dir.create_element({
            name: 'button', innerHTML: 'add new node', id: 'add_new_node_btn_'+id, class: 'data-list-add-new-node-btn'
        }));
        return div;
    };

    dir.add_relocate_node = function(id){
         var div = dir.create_element({
            name: 'div', class: 'data-list-add-new-node-div', 
        });
        div.appendChild( dir.create_element({
            name: 'input', type: 'number', id: 'relocate_node_old_inp_'+id, 
            class: 'relocate-node-old-inp-input', placeholder : 'old parent id'
        }));
        div.appendChild( dir.create_element({
            name: 'input', type: 'number', id: 'relocate_node_new_inp_'+id, 
            class: 'relocate-node-new-inp-input', placeholder : 'new parent id'
        }));
        div.appendChild( dir.create_element({
            name: 'button', innerHTML: 'relocate node', id: 'relocate_btn_'+id, class: 'data-list-relocate-btn'
        }));
        return div;
    };  

 
    dir.add_delete_node = function(id, deep){
        var div = dir.create_element({
            name: 'div', class: 'data-list-delete-node-div', 
        });
        div.appendChild( dir.create_element({
            name: 'input', type: 'number', id: (deep? 'deep_': '')+'delete_node_inp_'+id, 
            class: 'data-list-delete-node-input', placeholder : ' element id'
        }));
        div.appendChild( dir.create_element({
            name: 'button', innerHTML: 'delete node'+ (deep ? ' (deep)' : ''), 
            id: (deep? 'deep_': '')+'delete_node_btn_'+id, class: 'data-list-delete-node-btn'
        }));
        return div;
    };  

    dir.find_el_by_id = function(items, id, val, element ){
        var value = Number(val);
        var element = '';
        items.forEach(function(el){
            if( el.id == value ) {
                element = document.querySelector("li[el-id="+id + '' + value+"]"); 
            }
            if( el.items ) {
                var loc_el = dir.find_el_by_id(el.items, id, value, element );
                element = loc_el ? loc_el : element;
            }
        });
        return element;
    };

    dir.set_new_node_btn_listener = function(id){
        document.getElementById('add_new_node_btn_'+id).onclick = (function(){
            var cl_id = id;
            return function () {
                var val = document.getElementById('add_new_node_inp_'+cl_id).value;
                var el = dir.find_el_by_id( dir._items, id, val );
                if ( !el ) { console.error('no such el id'); return false; };
                el.appendChild( dir.create_element({name: 'li', innerHTML: "new el"}) ); 
            };
        })();
    };

    dir.set_relocate_node_btn_listener = function(id){
        document.getElementById('relocate_btn_'+id).onclick = (function(){
            var cl_id = id;
            return function () {
                var val_old = document.getElementById('relocate_node_old_inp_'+cl_id).value;
                var val_new = document.getElementById('relocate_node_new_inp_'+cl_id).value;
                var el_old = dir.find_el_by_id( dir._items, id, val_old );
                var el_new = dir.find_el_by_id( dir._items, id, val_new );
                if ( !el_old ) { console.error('no such old el id'); return false; };
                if ( !el_new ) { console.error('no such new el id'); return false; };
                var clone = el_old.cloneNode(true);
                el_new.appendChild( clone ); 
                el_old.parentNode.removeChild(el_old);
            };
        })();
    };

    dir.set_delete_deep_btn_listener = function(id){
        document.getElementById('deep_delete_node_btn_'+id).onclick = (function(){
            var cl_id = id;
            return function () {
                var val = document.getElementById('deep_delete_node_inp_'+cl_id).value;
                var el = dir.find_el_by_id( dir._items, id, val );
                if ( !el ) { console.error('no such el id'); return false; };
                el.parentNode.removeChild(el);
            };
        })();
    };

    dir.set_delete_btn_listener = function(id){
        document.getElementById('delete_node_btn_'+id).onclick = (function(){
            var cl_id = id;
            return function () {
                var val = document.getElementById('delete_node_inp_'+cl_id).value;
                var el = dir.find_el_by_id( dir._items, id, val );
                if ( !el ) { console.error('no such el id'); return false; };
                console.log( 'el ', el );
                for (var i = 0; i < el.childNodes.length; ++i) {
                    console.log( 'childNodes ', el.childNodes[i], ' ', el.childNodes[i].nodeType );
                    if( el.childNodes[i] && el.childNodes[i].nodeType == 1 ) {
                        el.parentNode.appendChild( el.childNodes[i].cloneNode(true) ); 
                    }                 
                }
                el.parentNode.removeChild(el);

            };
        })();
    };

    dir.init = function(items, id){
        if( dir.inspect_init(items, id ) ) return false;
        dir.set_items(items);
        var list_node = dir.create_node( 'ul', 'li', dir._items, id );
        
        document.getElementById(id).innerHTML = '';
        document.getElementById(id).appendChild(list_node);
        document.getElementById(id).appendChild( dir.add_new_node(id) );
        document.getElementById(id).appendChild( dir.add_relocate_node(id) );
        document.getElementById(id).appendChild( dir.add_delete_node(id, 'deep') );
        document.getElementById(id).appendChild( dir.add_delete_node(id) );

        dir.set_new_node_btn_listener(id);
        dir.set_relocate_node_btn_listener(id);
        dir.set_delete_deep_btn_listener(id);
        dir.set_delete_btn_listener(id);
    };
    
    return dir.init;

})();

document.getElementById("init-component").onclick = (function(){
    return function(){
        init_data_list_dir(data.items, 'data-list');
    };
})();


