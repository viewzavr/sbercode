import * as jLIST from "./json-loader/app-metrics-list.js";
import * as jLOAD from "./json-loader/mass-loader.js";
import  * as csvload from "./csv-loader/app.js";
import * as csvloadLIST from "./csv-loader/app-metrics-list.js";
import * as S1 from "./scenes/scene1.js";

export function setup( vz ) {

  jLIST.setup( vz );  
  jLOAD.setup( vz );
  csvload.setup( vz );
  csvloadLIST.setup( vz );
  
  return vzPlayer.loadPackage( vz.getDir( import.meta.url ) + "/painters/files.txt" );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );
  
  var metrics = jLIST.create( vz, {parent:obj,name:"metrics"} );
  var mloader = jLOAD.create( vz, {parent:obj,name:"metrics-mass-loader"} );
  
  metrics.trackParam("@metrics_output",function() {
    var v = metrics.getParam("@metrics_output");
    mloader.setParam("@metrics_input",v);
  });
  
  obj.trackParam("filter_regexp",function() {
    var v = obj.getParam("filter_regexp");
    metrics.setParam("filter_regexp",v);
  });

/*  
  var authdlg = vz.addQml( vz.getDir(import.meta.url) + "auth/SberCloudLogin.qml", { parent: obj } );
  authdlg.open();

  authdlg.successChanged.connect( obj, function() {
    var r = authdlg.success;
    console.log("AUTH RESULT=",r);
  });
*/  

  return obj;
}
