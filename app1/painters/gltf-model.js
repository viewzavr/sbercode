

// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "zoo-gltf","ZOO: gltf 1 штука", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
//  opts.name ||= "simple-graph-P1";
  var obj = vz.createObj( opts );
  
  var g = vz.vis.addGltf( obj, "model" );
  
  obj.addFile("src","",function(v) {
    g.setParam("src",v);
  });
  
/*  obj.addColor("color",[1,1,1],function(c) {
    g.colors = c;
  });*/

  return obj;
}
