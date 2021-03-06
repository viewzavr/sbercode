

// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "zoo-p1","ZOO: простой график P1", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "simple-graph-P1";
  var obj = vz.createObj( opts );
  
  var pts = vz.vis.addPoints( obj );
  pts.color = [1,0,0];
  obj.setParam("@input",[] );
  
  obj.addSlider( "sx",1/1000.0, 1/1000.0,1, 0.001, qq );
  obj.addSlider( "sy",1,1,200,1, qq );
  
  obj.trackParam("@input",qq );
  
  function qq() {

    var v = obj.getParam("@input");

    if (!v || !v.length) {
      console.error("P1: input is not array",v);
      return;
    }
    
    var acc = [];
    var min = 10e10;
    var max = -10e10;
    for (var i=0; i<v.length; i++) {
      if (isNaN(v[i]))
        acc.push(0);
      else
        acc.push( v[i] );
      if (v[i] < min) min = v[i];
      if (v[i] > max) max = v[i];
    };
    
    var diff = max - min;
    
    if (diff > 0) for (var i=0; i<v.length; i++) {
      acc[i] = (acc[i]-min) / diff;
    }
    
    var coords = [];
    var sx = obj.getParam("sx"); //1 / 1000.0;
    var sy = obj.getParam("sy"); // 200;
    for (var i=0; i<v.length; i++) {
      coords.push( sx*i, sy*acc[i],0 );
    };

    pts.positions = coords;
    
    if (obj.getParam("lines") && lines) {
      coords = []; // new Float32Array( v.length );
      for (var i=0; i<v.length; i++) 
      coords.push( sx*i, sy*acc[i],0,sx*i, 0,0  );
      lines.positions = coords;
    }
    else lines.positions = [];
  };
  
  obj.addCheckbox("lines",true,qq );
  var lines = vz.vis.addLines( obj );

  return obj;
}
