import UIController from "./ui";

let modelController = (() => {

    let DOM = UIController.DOM();
    let nodes = [];
    let links = [];
    const storage = {
        nodes: [],
        links: [],
        idCounter: 0,
        addNew: function(newItem){
            this.nodes.push(newItem);
        },
        getAllNodes: function(){
            return this.nodes;
        },
        getNode: function(id){
            let nodeIndex = this.nodes.findIndex((obj => obj.id === id));
            return this.nodes[nodeIndex];
        },
        updateNode: function(id, key, value){
            let nodeIndex = this.nodes.findIndex((obj => obj.id === id));
            value ? this.nodes[nodeIndex][key] = value : '';
        },
        updateNodeFullData: function(id, nodeObj){
            let nodeIndex = this.nodes.findIndex((obj => obj.id === id));
            for (var key in nodeObj) {
                if (nodeObj.hasOwnProperty(key)) {
                    this.nodes[nodeIndex][key] = nodeObj[key];
                }
            }
        },
        removeNode: function(id){
            let nodeIndex = this.nodes.findIndex((obj => obj.id === id));
            this.nodes.splice(nodeIndex,1);
            saveStorageToLocalStorage();
        },
        genId: function(){
            this.idCounter ++;
            return 'state'+this.idCounter;
        },
        getAllLinks: function(){
            return this.links;
        },
        getIdCounter: function(){
            return this.idCounter;
        }
    };

    
    // --------------- Load Init Tree
    function loadInitTree(){
        if(!localStorage.nodes){
            let nodes = [{"name":"Catelyn","gender":"woman","id":"state26","top":"92px","left":"846px","lastName":"Stark","maidenName":"Arryn","photoLink":"http://piesnloduiognia.pl/wp-content/uploads/2015/04/catelyn.jpg"},{"name":"Robb","gender":"man","id":"state27","top":"593px","left":"269px","photoLink":"https://www.theworkprint.com/wp-content/uploads/2015/03/robb-stark-game-of-thrones.jpg","date":" ","lastName":"Stark"},{"name":"Eddard","gender":"man","id":"state28","top":"82px","left":"443px","lastName":"Stark","photoLink":"https://vignette.wikia.nocookie.net/p__/images/6/64/IMG_6734.jpg/revision/latest?cb=20170914162623&path-prefix=protagonist"},{"id":"state29","class":"spouse","top":"156px","left":"718px"},{"name":"Sansa","lastName":"Stark","gender":"woman","photoLink":"https://cdn.images.express.co.uk/img/dynamic/20/590x/secondary/Sansa-Stark-1253311.jpg","id":"state31","top":"496px","left":"479px"},{"name":"Arya","lastName":"Stark","gender":"woman","photoLink":"https://pbs.twimg.com/profile_images/894833370299084800/dXWuVSIb_400x400.jpg","id":"state32","top":"612px","left":"607px"},{"name":"Bran","lastName":"Stark","gender":"man","photoLink":"https://upload.wikimedia.org/wikipedia/en/thumb/f/fa/Bran_Stark_-_Isaac_Hempstead-Wright.jpeg/220px-Bran_Stark_-_Isaac_Hempstead-Wright.jpeg","id":"state33","top":"505px","left":"752px"},{"name":"Rickon","lastName":"Stark","gender":"man","photoLink":"http://assets.viewers-guide.hbo.com/large575ae85b3c3ba@2x.jpg","id":"state34","top":"606px","left":"938px"}]
            let links = [{"linkId":"con_12","from":"jsPlumb_1_2","to":"state29"},{"linkId":"con_17","from":"jsPlumb_1_3","to":"state29"},{"linkId":"con_22","from":"jsPlumb_1_4","to":"state29"},{"linkId":"con_27","from":"jsPlumb_1_1","to":"state29"},{"linkId":"con_32","from":"jsPlumb_1_5","to":"state29"},{"linkId":"con_37","from":"jsPlumb_1_6","to":"state29"},{"linkId":"con_42","from":"jsPlumb_1_7","to":"state29"}];
            let idCounter = 34;
            let settings = {"connectionType":"Flex"};
            localStorage.setItem('nodes', JSON.stringify(nodes));
            localStorage.setItem('links', JSON.stringify(links));
            localStorage.setItem('idCounter', JSON.stringify(idCounter));
            localStorage.setItem('settings', JSON.stringify(settings));
        }
    }


    // --------------- Build Node structure on Load
    function buildNodeStructure(item){

        let initPosition;

        // If new Node - position it left bottom
        let windowHeight = $( window ).height();
        let windowWidth = $( window ).width();
        item.top ? '' : item.top = (windowHeight - 300) + 'px';
        item.left ? '' : item.left = (windowWidth - 200) + 'px';

        let newNode;

        if(item.class === DOM.spouse){
            newNode = `
                <div id="${item.id}" class="${DOM.nodeClassName} ${DOM.spouse}" style="top: ${item.top}; left: ${item.left}">
                    <!--<div class="connect"></div>-->
                    <button data-target="${DOM.confirmModalId}" class="${DOM.removeClassName}"><i class="${DOM.iconsClassName}">clear</i></button> 
                    <div class="${DOM.clickAreaClassName}"></div>
                </div>
            `;
        }else{
            let name = item.name;
            let lastName = item.lastName;
            let maidenName = item.maidenName;
            let date = item.date;
            let photoLink = item.photoLink;
            let gender = item.gender;
            let avatar;
            let noPhotoClass = '';

            // Name
            name ? '' : name = '';
            lastName ? '' : lastName = '';
            maidenName ? maidenName = ' ('+item.maidenName+')' : maidenName = '';

            // Avatar
            gender === 'man' ? avatar = DOM.manAvatarPath : avatar = DOM.womanAvatarPath;

            // Photo
            photoLink ? '' : noPhotoClass = DOM.noPhotoClassName;
            photoLink ? '' : photoLink = avatar;

            // Date
            date ? '' : date = '';

            newNode = `
                <div id="${item.id}" class="${DOM.nodeClassName} ${gender}" style="top: ${item.top}; left: ${item.left}">
                    <div class="${DOM.photoClassName} ${noPhotoClass}"><img src="${photoLink}" /></div>
                    <div class="${DOM.nameClassName}">
                        <div>
                            <span>${name}</span>
                            <span>${lastName}</span>
                        </div>   
                        <span class="${DOM.maidenClassName}">${maidenName}</span>
                        <div class="${DOM.dateClassName}">${date}</div>
                    </div>

                    <div class="${DOM.connecClassName}"></div>
                    <!--<button class="${DOM.removeClassName}"><i class="${DOM.iconsClassName}">clear</i></button>   -->
                    <button data-target="${DOM.confirmModalId}" class="${DOM.removeClassName} modal-trigger"><i class="${DOM.iconsClassName}">clear</i></button>                
                    <button data-target="${DOM.editModalId}" class="${DOM.editClassName} modal-trigger"><i class="${DOM.iconsClassName}">edit</i></button>

                    <!--<div class="${DOM.clickAreaClassName}"></div>-->
                </div>
            `;
        }

        return $(newNode);
    }


    // --------------- Add target, source, draggable to DOM nodes
    function addSettings(node, nodeId){
        jsPlumb.makeTarget(node, {
            anchor: 'Continuous'
        });
        jsPlumb.makeSource($("#"+nodeId+" .connect"), {
            parent: node,
            anchor: 'Continuous'
        });
        jsPlumb.draggable(node, {
            containment: 'parent'
        });
    }


    // --------------- Update Nodes in Storage
    function updateDomPositionInStorage(){
        $(DOM.node).each(function() {
            let id = $(this)[0].id;
            let top = $(this)[0].style.top;
            let left = $(this)[0].style.left;
            let item = {'id': id, 'top': top, 'left': left};

            // Check "Spouse"
            let className = '';
            $(this).hasClass(DOM.spouse) ? className = DOM.spouse : '';
            className ? item.className = className : '';

            // Update
            storage.updateNode(id, 'top', top);
            storage.updateNode(id, 'left', left);
        });
    }

    // --------------- Build and Save Links
    function saveLinks(){
        $.each(jsPlumb.getConnections(), function (idx, connection) {
            links.push({
                linkId: connection.id,
                from: connection.sourceId,
                to: connection.targetId
            });
        });
        saveLinksToLocalStorage();
        links = [];
    }

    // --------------- Load ID counter
    function loadIdCounter(){
        storage.idCounter = JSON.parse(localStorage.getItem('idCounter') || 0);
    }

    // --------------- Load Nodes from  localStorage
    function loadNodes(){
        storage.nodes = JSON.parse(localStorage.getItem('nodes') || '[]');
    }

    // --------------- Load Links from  localStorage
    function loadLinks(){
        storage.links = JSON.parse(localStorage.getItem('links') || '[]');
    }

    // --------------- Save Nodes to localStorage
    function saveStorageToLocalStorage(){
        //localStorage.removeItem('nodes');
        localStorage.setItem('nodes', JSON.stringify(modelController.storage.getAllNodes()));
    }

    // --------------- Save Links to localStorage
    function saveLinksToLocalStorage(){
        //localStorage.removeItem('links');
        localStorage.setItem('links', JSON.stringify(modelController.storage.getAllLinks()));
    }

    // --------------- Save ID counter
    function saveIdCounter(){
        localStorage.setItem('idCounter', JSON.stringify(storage.getIdCounter()));
    }

    // --------------- Save Settings
    function saveSettings(settings){
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    // --------------- Load Settings from  localStorage
    function loadSettings(){
        return JSON.parse(localStorage.getItem('settings'));
    }

    // --------------- Build New Item from "Add new"
    function getFormData(context){
        let formData = {};
        $(context).serializeArray().forEach(function (item, i, arr) {
            item.value ? formData[item.name] = item.value : '';
        });
        return formData;
    }


    // --------------- Download
    function download(){
        let arrDownload={};
        arrDownload.nodes = storage.getAllNodes();
        arrDownload.links = storage.links;
        arrDownload.idCounter = storage.idCounter;
        let data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(arrDownload));
        let today = new Date();
        let todayDate = (today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear());
        $(DOM.download).prop({
            'href': 'data:' + data,
            'download': 'tree_'+todayDate +'.tree'
        });
    }

    
    return {
        storage: storage,
        updateDomPositionInStorage: updateDomPositionInStorage,
        saveLinks: saveLinks,
        buildNodeStructure: buildNodeStructure,
        addSettings: addSettings,
        loadNodes: loadNodes,
        loadLinks: loadLinks,
        saveIdCounter: saveIdCounter,
        loadIdCounter: loadIdCounter,
        getFormData: getFormData,
        saveStorageToLocalStorage: saveStorageToLocalStorage,
        download: download,
        saveLinksToLocalStorage: saveLinksToLocalStorage,
        loadInitTree: loadInitTree,
        saveSettings: saveSettings,
        loadSettings: loadSettings
    };

})();

export default modelController;
