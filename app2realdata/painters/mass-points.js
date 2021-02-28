// вход параметр массив метрик. по нему обращение к.

export function setup( vz ) {
  vz.addItemType( "zoo-mass-points","ZOO: РИСОВАТЕЛЬ точек метрик", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
//  opts.name ||= "simple-graph-P1";
  var obj = vz.createObj( opts );
  
  var pts = vz.vis.addPoints( obj );
  
  obj.setParam("@times",[]);
  obj.setParam("@values",[]);
  
  obj.addSlider( "sy",1/1000.0, 1/1000.0,1, 0.001, go );
  obj.addSlider( "day-len-coef",1,1,200,1, go );  
  
  obj.trackParam("@times",go);
  obj.trackParam("@values",go);
  
   obj.addString("metric-values-amount","pending" );
   obj.addString("metric-times-amount","pending" );  
   obj.addString("metric-first-len","pending" );  
  // это надо сказать массовый рисователь
  
  var daylen = 60 * 60 * 24;
//  var daylencoef = 

  function go() {
   // todo timeout
   
   var tt = obj.getParam("@times");
   var vv = obj.getParam("@values");
   if (!tt) return;
   if (!vv) return;
   
   obj.setParam("metric-values-amount",vv.length.toString() );
   obj.setParam("metric-times-amount",tt.length.toString() );
   obj.setParam("metric-first-len",vv[0] ? vv[0].length.toString() : "-" );
   
    var coords = [];
    var sx = obj.getParam("day-len-coef"); //1 / 1000.0;
    var sy = obj.getParam("sy"); // 200;
    var dasTimeTo = Math.floor( new Date().getTime() / 1000 );
    var k2 = tt.length/2;

/*    
    function tr( x,y,z ) {
      return [sx*(tm[i]-dasTimeTo)/daylen, sy*vm[i], (k-k2)];
    }
*/    
    
   
   for (var k=0; k<tt.length; k++) {
   
    var vm = vv[k];
    var tm = tt[k];
    
    if (!vm || !tm) continue;
    if (vm.length != tm.length) continue;

    for (var i=0; i<vm.length; i++) {
      coords.push( sx*(tm[i]-dasTimeTo)/daylen, sy*vm[i], (k-k2) );
    };
    
   }
   
   pts.positions = coords;
  }

  return obj;
}
