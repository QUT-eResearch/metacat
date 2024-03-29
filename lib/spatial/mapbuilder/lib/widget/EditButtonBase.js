/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
$Id: EditButtonBase.js 3879 2008-02-27 14:20:29Z gjvoosten $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/ButtonBase.js");

/**
 * Base class for tools which update GML by clicking on the mapPane.
 * @constructor
 * @base ButtonBase
 * @author Cameron Shorter cameronATshorter.net
 * @param widgetNode The node from the Config XML file.
 * @param model  The ButtonBar widget.
 */
function EditButtonBase(widgetNode, model) {
  // Extend ButtonBase
  ButtonBase.apply(this, new Array(widgetNode, model));

  // override default cursor by user
  // cursor can be changed by specifying a new cursor in config file
  this.cursor = "crosshair"; 

  this.trm=this.getProperty("mb:transactionResponseModel");

  /** Empty GML to load when this tool is selected. */
  this.defaultModelUrl=this.getProperty("mb:defaultModelUrl");

  /** Reference to GML node to update when a feature is added. */
  this.featureXpath=this.getProperty("mb:featureXpath");

  /** Should a new empty feature be appended after creating one? */
  this.appendOnEdit = Mapbuilder.parseBoolean(this.getProperty("mb:appendOnEdit", true));

  /**
   * OpenLayers DrawFeature control.
   * @param objRef reference to this object.
   * @return {OpenLayers.Control} class of the OL control.
   */
  this.createControl = function(objRef) {
    return OpenLayers.Control.DrawFeature;
  }
  
  /**
   * If tool is selected and the Edit Tool has changed (eg, changed from
   * LineEdit to PointEdit) then load new default feature.
   * This function is called when a tool is selected or deselected.
   * @param objRef Pointer to this object.
   * @param selected True when selected.
   */
  this.doSelect = function(objRef, selected) {
    if (objRef.control.active) {
      // Model that will be populated with the WFS response.
      if (objRef.trm && !objRef.transactionResponseModel){
        objRef.transactionResponseModel=window.config.objects[objRef.trm];
      }
      // Remove the transactionResponseModel (and result of last transaction)
      // when a transaction button is deselected
      if(!selected && objRef.transactionResponseModel){
        objRef.transactionResponseModel.setModel(objRef.transactionResponseModel,null);
      }
      
      config.loadModel(objRef.targetModel.id, objRef.defaultModelUrl);
    }
  }
  
  /**
   * start a new editing session
   * @param objRef reference to this widget
   */
  this.newSession = function(objRef) {
    objRef.modified = false;
  }

  /**
   * This is called by the OL onFeatureInsert handler. It will
   * call the superclass's setFeature() method to handle the
   * created feature.
   * @param feature OpenLayers feature
   */
  this.handleFeatureInsert = function(feature) {
    // use the objRef reference stored by setEditingLayer()
    var objRef = feature.layer.mbButton;
    objRef.feature = OpenLayers.Util.extend({}, feature);
    objRef.geometry = OpenLayers.Util.extend({}, feature.geometry);
    
    var previousFeatureNode = objRef.targetModel.doc.selectSingleNode("/*/*").cloneNode(true);

    // add a new empty node if this is not the first feature
    if (objRef.modified && objRef.appendOnEdit) {
      objRef.targetModel.doc.selectSingleNode("/*").appendChild(previousFeatureNode);
    }

    objRef.setFeature(objRef);
    objRef.modified = true;
    
    // destroy the feature in OL, because we do not use
    // the OL vector layer for displaying the feature
    feature.mbSelectStyle = null;
    feature.destroy();
  }

  /**
   * Set editing layer and register for editing events in OL,
   * called after model loads.
   * @param objRef Pointer to this object.
   */
  this.setEditingLayer = function(objRef) {
    if (!objRef.targetContext.featureLayers[objRef.id]) {
      objRef.featureLayer = new OpenLayers.Layer.Vector(objRef.id);
      // layer should always be visible, independent of the resolution
      objRef.featureLayer.calculateInRange = function() {return true;};
      // set objRef as mbButton attribute of the OL featureLayer,
      // because we otherwise don't have it available in
      // handleFeatureInsert()
      objRef.featureLayer.mbButton = objRef;
      objRef.targetContext.featureLayers[objRef.id] = objRef.featureLayer;
      // register OL event handler
      objRef.featureLayer.onFeatureInsert = objRef.handleFeatureInsert;
    }
  }

  /**
   * Add a geometry to the enclosing GML model.
   * @param objRef      Pointer to this object.
   */
  this.setFeature = function(objRef) {
    if (!objRef.enabled) {
      return;
    }

    var gml = new OpenLayers.Format.GML().write([objRef.feature]);
    var gmlDoc = Sarissa.getDomDocument();
    gmlDoc = (new DOMParser()).parseFromString(gml, "text/xml");
    if (objRef.targetModel.namespace) {
      Sarissa.setXpathNamespaces(gmlDoc, objRef.targetModel.namespace);
    }
    var insertPoint = objRef.featureXpath.lastIndexOf("/")+1;
    var insertXpath = objRef.featureXpath.substring(insertPoint);
    var insertNode = gmlDoc.selectSingleNode("//"+insertXpath);
    if (!insertNode) {
      insertNode = gmlDoc.selectSingleNode("//gml:featureMember/*/*");
    }
    var targetNode = objRef.targetModel.doc.selectSingleNode(objRef.featureXpath);
    if (targetNode.childNodes.length > 0) {
      targetNode.removeChild(targetNode.firstChild);
    }

    try {
      Sarissa.copyChildNodes(insertNode, targetNode);
    } catch(e) {
      alert(mbGetMessage("invalidFeatureXpathEditLine", objRef.featureXpath));      
    }
    objRef.targetModel.setParam("refresh");
  }

  /**
   * Create the array that will hold all OL feature layers
   * for editing buttons. Also register event handler to
   * create feature layers when the OL map is available.
   * @param objRef Pointer to this object.
   */
  this.initButton = function(objRef) {
    // initialize feature layers for the context.
    // each editing button gets its own feature layer,
    // which is not used for displaying the features,
    // because the transaction response model has its
    // own feature renderer.
    if (!objRef.targetContext.featureLayers) {
    	// this array in the context will hold all
    	// featureLayers used by editButton widgets
    	objRef.targetContext.featureLayers = new Array();
    }
    
    // feature layers will be created when the OL map is available
    objRef.targetContext.addFirstListener("refresh",objRef.setEditingLayer, objRef);

    objRef.targetModel.addListener("loadModel", objRef.newSession, objRef);
  }
  this.model.addListener("init",this.initButton, this);
}
