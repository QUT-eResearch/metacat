/*
Author:       Andreas Hocevar andreas.hocevarATgmail.com
License:      LGPL as per: http://www.gnu.org/copyleft/lesser.html

$Id: GmlRendererConfig.js 3879 2008-02-27 14:20:29Z gjvoosten $
*/

// Ensure this object's dependancies are loaded.
mapbuilder.loadScript(baseDir+"/widget/GmlRendererBase.js");

/**
 * Configuration for GmlRendererOL.
 * This widget is used in models that merge into a MergeModel to specify
 * a GmlRenderer configuration (sld, cursor style). The GmlRendererOL in
 * the MergeModel will check for configurations in source models and use
 * them.
 * @constructor
 * @base GmlRendererBase
 * @param widgetNode  The widget's XML object node from the configuration document.
 * @param model       The model object that this widget belongs to.
 */
function GmlRendererConfig(widgetNode, model) {
  GmlRendererBase.apply(this,new Array(widgetNode, model));
  
  var targetWidget = this.getProperty('mb:targetWidget');
  
  this.init = function(objRef) {
    if (targetWidget) {
      if (!model.config) {
        model.config = {};
      }
      model.config[targetWidget] = objRef.config;
    }
  }
  model.addListener('init', this.init, this);
}
