'use strict';

// import jquery from './jquery-3.3.1.min.js'
// window.jQuery = window.$ = jQuery;
// import panzoom from './panzoom.js';

import materialize from './materialize.min.js';
import jsplumb from './jsplumb.js';
import modelController from './model.js';
import UIController from './ui.js';
import pell from './pell.js';

let controller = (() => {

    let DOM = UIController.DOM();

    //------------------ Event Listeners ------------------

    let setupEventListeners = () => {
        $(document).ready(function(){

            // Init Modals
            $('.modal').modal({
                onOpenEnd: function(modal, trigger) { // When any modal has been opened
                    let nodeId = $(trigger).parent()[0].id;
                    // Add existing Node data to modal form
                    if(modal.id === DOM.editModalId){
                        UIController.editModalFillForm(nodeId);
                        submitEditEventListener(nodeId);
                        M.updateTextFields(); // Move labels up to not overlap data
                    }
                }
            });

            function submitEditEventListener(nodeId){
                // ----------- Edit Node - Submit
                $('#'+DOM.editModalId + ' form').on( "submit", function(event) {
                    event.preventDefault();

                    // Save All data In DOM, in case edited item haven't been saved
                    modelController.updateDomPositionInStorage();
                    modelController.saveStorageToLocalStorage();
                    modelController.saveLinks();

                    let formData = modelController.getFormData(this);
                    modelController.storage.updateNodeFullData(nodeId, formData);
                    modelController.saveStorageToLocalStorage();
                    location.reload();
                });
            }

            //------------ Add Spouse
            $(DOM.addNewSpouse).click(function(e){
                let id = modelController.storage.genId();

                let spouseNode = {'id': id, 'class': DOM.spouse};
                let newNode = modelController.buildNodeStructure(spouseNode);

                UIController.addNewNode(newNode);
                modelController.addSettings(newNode, id);
                modelController.storage.addNew(spouseNode);
            });

            //------------ Save all data
            $(DOM.save).click(function() {
                modelController.updateDomPositionInStorage();
                modelController.saveStorageToLocalStorage();
                modelController.saveLinks();
                modelController.saveIdCounter();
            });

            //------------ Node click listener
            $(DOM.nodeContainer).on('click', function (e) {
                nodeClick(e);
            });

            // ----------- Add New Node - Submit
            $(DOM.addNewModalForm).on( "submit", function(event) {
                event.preventDefault();
                let formData = modelController.getFormData(this);
                let id = modelController.storage.genId();
                formData.id = id;
                let newNode = modelController.buildNodeStructure(formData);
                UIController.addNewNode(newNode);
                modelController.addSettings(newNode, id);
                formData.id = id;
                modelController.storage.addNew(formData);

                // Need to reload page to fix issue "b-001" with wrong connections
                modelController.updateDomPositionInStorage();
                modelController.saveStorageToLocalStorage();
                modelController.saveLinks();
                modelController.saveIdCounter();
                location.reload();
            });

            //------------- Settings
            $(DOM.settingsConnectionType).click(function() {
                var $this = $(this);
                let connectionType = $this[0].defaultValue;

                if(connectionType){
                    modelController.saveSettings({'connectionType':connectionType});
                    jsPlumb.deleteEveryConnection();
                    UIController.drawLinks();
                }
            });


        });
    };


    // --------------- Node click Handler ------------------
    function nodeClick(e){
        //------------ Display Remove/Edit btns
        let parent = $(e.target).closest(DOM.node);
        if(parent.hasClass(DOM.nodeClassName)){            // If clicked on Item, to get right parent
            // Hide btns on previous opened nodes
            $(DOM.remove).removeClass(DOM.visibleClassName);
            $(DOM.edit).removeClass(DOM.visibleClassName);
            $(DOM.connect).removeClass(DOM.visibleClassName);
            // Show btns on clicked node
            parent.find(DOM.remove).addClass(DOM.visibleClassName);
            parent.find(DOM.edit).addClass(DOM.visibleClassName);
            parent.find(DOM.connect).addClass(DOM.visibleClassName);
        }

        //------------ Remove node
        let target = e.target;
        if($(e.target).hasClass(DOM.iconsClassName)){ // If click on icon inside ".remove"
            target = $(e.target).parent();
        }
        if($(target).hasClass(DOM.removeClassName)){
            let nodeId = parent.attr('id');
            if($(target).parent().hasClass='spouse'){ // If Spouse
                removeNode(nodeId);
            }else {
                $('#modal-confirm').click(function(){ // If Node
                    removeNode(nodeId);
                });
            }
        }
        function removeNode(nodeId){
            jsPlumb.deleteConnectionsForElement($('#'+nodeId));
            jsPlumb.remove($('#'+nodeId));
            modelController.storage.removeNode(nodeId);
            modelController.saveLinks();
        }
        
        //------------ Hide Remove/Edit btns when click outside
        if($(e.target).attr('id') === DOM.nodeContainerId){
            $(DOM.remove).removeClass(DOM.visibleClassName);
            $(DOM.edit).removeClass(DOM.visibleClassName);
            $(DOM.connect).removeClass(DOM.visibleClassName);
        }
    }


    let displayItems =()=> {
        jsPlumb.ready(function() {
            var minScale = 0.4;
            var maxScale = 2;
            var incScale = 0.1;
            (function() {
                var $section = $(DOM.mainWrap);
                var $panzoom = $section.find('.panzoom').panzoom({
                    minScale: minScale,
                    maxScale: maxScale,
                    increment: incScale,
                    // cursor: "",
                    ignoreChildrensEvents:true
                });
                $panzoom.parent().on('mousewheel.main', function( e ) {
                    e.preventDefault();
                    var delta = e.delta || e.originalEvent.wheelDelta;
                    var zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
                    $panzoom.panzoom('zoom', zoomOut, {
                        animate: false,
                        main: e
                    });
                });
            })();

            modelController.loadNodes();
            modelController.loadLinks();
            modelController.loadIdCounter();
            UIController.drawNodes();
            UIController.drawLinks();
            UIController.displayStoredSettings();
        });
    };
    
    //------------ Download
    $(DOM.download).click(function(e) {
        modelController.download();
    });

    //------------ Upload
    $('#upload').click(function(){
        $("#upload-input").trigger("click"); // click to hidden input
    });
    $("#upload-input").change(function(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
        function onReaderLoad(event){
            var obj = JSON.parse(event.target.result);
            modelController.storage.nodes = obj.nodes;
            modelController.storage.links = obj.links;
            modelController.storage.idCounter = obj.idCounter;
            modelController.saveStorageToLocalStorage();
            modelController.saveLinksToLocalStorage();
            modelController.saveIdCounter();
            location.reload();
        }
    });

    //------------  Init Pel Editor
    function initPellEditor(){
        var editor = pell.init({
            element: $(DOM.pellEditor)[0],
            defaultParagraphSeparator: 'p',
            onChange: function (html) {
                $(DOM.editDescription).val(html);
            }
        })
    }

    //------------  Init Side Naw
    $(document).ready(function(){
        $(DOM.sidenav).sidenav();
    });


    return {
        init: function(){
            console.log('Init');
            modelController.loadInitTree();
            displayItems();
            initPellEditor();   // Init Pell Editor
            setupEventListeners();
        }
    };

})();

controller.init();