import modelController from './model.js';

let UIController = (() => {

    let DOM = {
        mainWrap:           '#main',
        nodeContainerId:    'node-container',
        nodeContainer:      '#node-container',
        nodeClassName:      'item',
        node:               '.item',
        addNewSpouse:       '#add-new-spouse',
        save:               '#save',
        spouse:             'spouse',
        remove:             '.remove',
        removeClassName:    'remove',
        edit:               '.edit',
        editClassName:      'edit',
        nameClassName:      'name',
        dateClassName:      'date',
        photoClassName:     'photo',
        noPhotoClassName:   'no-photo',
        maidenClassName:    'maiden',
        connect:            '.connect',
        connecClassName:    'connect',
        clickAreaClassName: 'clickArea',
        visibleClassName:   'visible',
        addNewModalForm:    '#add-new-modal form',
        manAvatarPath:      'img/m-avatar.png',
        womanAvatarPath:    'img/w-avatar.png',
        iconsClassName:     'material-icons',

        // Edit Modal
        editModalId:        'edit-modal',
        editName:           '#edit-first_name',
        editLastName:       '#edit-last_name',
        editMaidenName:     '#edit-maiden_name',
        editDate:           '#edit-date',
        editPhotoLink:      '#edit-photoLink',
        editDescription:    '#edit-description',

        confirmModalId:     'confirm-modal',
        confirmModal:       '#modal-confirm',

        pellEditor:         '#editor',
        download:           '#download',
        sidenav:            '.sidenav',
        
        settingsConnectionType: '.connection-type input'
    };


    let nodeSettings = {
        anchors:["RightMiddle", "LeftMiddle"],
        connectionStraight: [ "Flowchart", { curviness: 1, stub: 10 }, {cssClass:"connectorClass"} ],
        connectionFlex: '',
        newConnection: true
    };


    //------------ Load nodes
    function drawNodes(){
        $.each(modelController.storage.nodes, function(i, item) {
            buildNode(item);
        });

        function buildNode(item){
            let node = modelController.buildNodeStructure(item);
            $(DOM.nodeContainer).append(node);

            modelController.addSettings(node, item.id);
        }
    }


    //------------ Load connections
    function drawLinks(settings){
        let storedSettings = modelController.loadSettings();
        let connectionType = nodeSettings['connection'+storedSettings.connectionType];

        $.each(modelController.storage.links, function(i, item) {
            loadConnections(item);
        });
        function loadConnections(item){
            jsPlumb.connect({
                source: item.from,
                target: item.to,
                connector: connectionType
            });
        }
    }


    function addNewNode(newNode){
        $(DOM.nodeContainer).append(newNode);
    }


    // --------------- Fill data in Edit Modal
    function editModalFillForm(nodeId){
        let node = modelController.storage.getNode(nodeId);

        $(DOM.editName).val(node.name);
        $(DOM.editLastName).val(node.lastName);
        $(DOM.editMaidenName).val(node.maidenName);
        $(DOM.editDate).val(node.date);
        $(DOM.editPhotoLink).val(node.photoLink);
        // $(DOM.editDescription).val(node.description);
        $('input[value='+ node.gender +']').trigger( "click" );

        $(".pell-content").html(node.description);
    }


    // --------------- Display Stored Settings
    function displayStoredSettings(){
        let settings = modelController.loadSettings();
        $('input[value='+ settings.connectionType +']').trigger( "click" );
    }


    return {
        DOM: function(){
            return DOM;
        },
        drawNodes: drawNodes,
        addNewNode: addNewNode,
        drawLinks: drawLinks,
        editModalFillForm: editModalFillForm,
        nodeSettings: nodeSettings,
        displayStoredSettings: displayStoredSettings
    };

})();
export default UIController;