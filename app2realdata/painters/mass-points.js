// вход параметр массив метрик. по нему обращение к.

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

  var values = [];
  var times = [];
  obj.trackParam( "@metrics-input",function() {
    var m=obj.getParam("@metrics-input");
    if (!m) {
      values = [];
      times = [];
      return;
    }
    
    var len = m.length;
    values = new Array(len);
    timer = new Array(len);
    
  });

  return obj;
}
