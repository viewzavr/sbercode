

// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "zoo-points","ZOO: точки", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
//  opts.name ||= "simple-graph-P1";
  var obj = vz.createObj( opts );
  
  var pts = vz.vis.addPoints( obj );

  
  obj.trackParam( "@positions",function() {
    var pp=obj.getParam("@positions");
    pts.positions = pp;
  });
  obj.setParam( "@positions",[0,0,0] );
  
  obj.trackParam( "@colors",function() {
    var pp=obj.getParam("@colors");
    pts.colors = pp;
  });  

  return obj;
}
