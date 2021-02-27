// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "zoo-1","ZOO: сцена - куча серверов", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );
  
  var pts = vz.vis.addClones( obj );
  var server = vz.vis.addGltf();
  server.inscene = false;
  
  var dir = vz.getDir( import.meta.url );
  //server.setParam("src", dir+"/assets/m1/scene.gltf");
  //server.setParam("src", dir+"/assets/Duck.glb");
  server.track("loaded",function() {
    //  an.scale = 0.1;
    //  an.sceneObject.visible = false;
    console.log("pts setting source",server);
    pts.setSource( server );
    obj.signalTracked( "r" );    
  });

//  var pts = vz.vis.addPoints( obj );
//  pts.positions = [1,2,3, 1,2,5, 1,3,12];
  
//  var pts = vz.vis.addGltfArray( obj, "machines" );

  //pts.source = dir + "/assets/Soldier.glb";

  var lins = vz.vis.addLines( obj );
  lins.positions = [1,2,3, 1,2,5, 1,2,5, 1,3,12];
  
  obj.addCmd( "click", function() {
    obj.signalTracked( "r" );
  });
  obj.addSlider("r",50,0,100,1,function() {
    var acc = []; var r = obj.getParam("r");
    for (var i=0; i<100; i++) acc.push( r*(Math.random()-0.5),0,r*(Math.random()-0.5) );
    pts.positions = acc;
    lins.positions = acc;
  } );
  obj.signalTracked( "r" );

  var models = ["MY FILE","/assets/m2/scene.gltf", "/assets/Duck.glb"]
  obj.addCombo( "model",1,models, function(v) {
    obj.setGuiVisible( "model-file-gltf",v == 0);
    if (typeof(v) == "undefined" || v == 0) return;
    console.log("loading v=",v,dir + models[v]);
    server.setParam("src",models[v]);
  });
  
  obj.signalTracked("model");
  obj.addFile("model-file-gltf","",function(v) {
    if (obj.getParam("model") != 0) return;
    server.setParam("src",v);
  });
  
  obj.addSlider( "scale",1,0.1,20,0.1,function(s) {
    pts.scales = [s];
  });

  return obj;
}
