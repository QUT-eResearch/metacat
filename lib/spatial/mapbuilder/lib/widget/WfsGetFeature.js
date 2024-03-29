/*
License: LGPL as per: http://www.gnu.org/copyleft/lesser.html
Dependancies: Context
$Id: WfsGetFeature.js 3899 2008-03-03 10:33:30Z ahocevar $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/ButtonBase.js");
mapbuilder.loadScript(baseDir+"/util/openlayers/OpenLayers.js");
/**
 * Builds then sends a WFS GetFeature GET request based on the WMC
 * coordinates and click point.
 * @constructor
 * @base ButtonBase
 * @author Cameron Shorter
 * @param widgetNode The XML node in the Config file referencing this object.
 * @param model The Context object which this tool is associated with.
 */
function WfsGetFeature(widgetNode, model) {
  // Extend ButtonBase
  ButtonBase.apply(this, new Array(widgetNode, model));

  this.widgetNode = widgetNode;
  // id of the transactionResponseModel
  this.trm = this.getProperty("mb:transactionResponseModel");
  this.httpPayload = new Object({
    method: "get",
    postData: null
  });
  this.typeName = this.getProperty('mb:typeName');
  this.maxFeatures = this.getProperty('mb:maxFeatures', 1);
  this.webServiceUrl= this.getProperty('mb:webServiceUrl');
  this.webServiceUrl += this.webServiceUrl.indexOf("?") > -1 ? '&' : '?';
  this.webServiceSrs= new OpenLayers.Projection(this.getProperty('mb:webServiceSrs', "EPSG:4326"));
  
  // override default cursor by user
  // cursor can be changed by spefying a new cursor in config file
  this.cursor = "pointer"; 

  this.createControl = function(objRef) {
  	var transactionResponseModel = config.objects[objRef.trm];
  	
    var Control = OpenLayers.Class( OpenLayers.Control, {
      CLASS_NAME: 'mbControl.WfsGetFeature',
      type: OpenLayers.Control.TYPE_TOOL, // constant from OpenLayers.Control
  	  tolerance: new Number(objRef.getProperty('mb:tolerance')),
  	  httpPayload: objRef.httpPayload,
  	  maxFeatures: objRef.maxFeatures,
  	  webServiceUrl: objRef.webServiceUrl,
  	  transactionResponseModel: transactionResponseModel,
  	  
      draw: function() {
        this.handler = new OpenLayers.Handler.Box( this,
          {done: this.selectBox}, {keyMask: this.keyMask} );
      },
      
      selectBox: function (position) {
        var bounds, minXY, maxXY;
        if (position instanceof OpenLayers.Bounds) {
        // it's a box
          minXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.left, position.bottom));
          maxXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.right, position.top));
        } else {
        // it's a pixel
          minXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.x-this.tolerance, position.y+this.tolerance));
          maxXY = this.map.getLonLatFromPixel(
            new OpenLayers.Pixel(position.x+this.tolerance, position.y-this.tolerance));
        }
        
        bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat, maxXY.lon, maxXY.lat);
        if (this.map.projection.projCode != this.objRef.webServiceSrs.projCode) {
          bounds.transform(this.map.projection, this.objRef.webServiceSrs);
        }

      var typeName = objRef.typeName;

      if (!typeName) {
        var queryList=objRef.targetModel.getQueryableLayers();
        if (queryList.length==0) {
          alert(mbGetMessage("noQueryableLayers"));
          return;
        }
        else {
          typeName = "";
          for (var i=0; i<queryList.length; ++i) {
            var layerNode = queryList[i];
            
            // Get the name of the layer
            var layerName = layerNode.selectSingleNode("wmc:Name");
            layerName=(layerName)?getNodeValue(layerName):"";

            // Get the layerId. Fallback to layerName if non-existent
            var layerId = layerNode.getAttribute("id") || layerName;

            var hidden = objRef.targetModel.getHidden(layerId);
            if (hidden == 0) { //query only visible layers
              if (typeName != "") {
                typeName += ",";
              }
              typeName += layerName;
            }
          }
        }
      }

      if (typeName=="") {
        alert(mbGetMessage("noQueryableLayersVisible"));
        return;
      }

        // now create request url
        this.httpPayload.url = this.webServiceUrl+OpenLayers.Util.getParameterString({
          SERVICE: "WFS",
          VERSION: "1.0.0",
          REQUEST: "GetFeature",
          TYPENAME: typeName,
          MAXFEATURES: this.maxFeatures,
          BBOX: bounds.toBBOX()
        });
        this.transactionResponseModel.newRequest(this.transactionResponseModel, this.httpPayload);
      }
    });
    return Control;
  }
}
