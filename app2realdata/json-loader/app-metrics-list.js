// Загружает индексный файл метрик, объявляет все найденные метрики своими параметрами
// после чего другие модули могут к ним линковаться (addParamRef) т.е. работает тема Формула

export function setup( vz ) {
  vz.addItemType( "zoo-json-metrics-list","ZOO: список метрик json", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {

  var obj = vz.createObj( opts );
  obj.addFile("file","https://sber-metrics.viewzavr.com/metrics",function(v) {
    datadir = vz.getDir( v );
    loadFile( v,function(res) { // viewlang's func
      obj.assignData( JSON.parse(res).msg );
    },
    function(err) {
      obj.assignData( {msg:[]} );
    });
  });  

  var datadir;
  function fixpath(p) {
    if (p.indexOf("/") >= 0) return p;
    return datadir + p;
  }

  obj.assignData = function( metrics ) {
    console.log("assign data, metrics received" );
    obj.setParam( "@metrics",metrics );
    filterThem();
  }
  
  ////// toodo move filter to mass-loader
  obj.addString("filter_regexp","ECS.*load_average",filterThem);
  
  function filterThem() {
    var m = obj.getParam("@metrics");
    var f = obj.getParam("filter_regexp");

    if (!m || !f) {
      obj.setParam("@metrics_output",[] );
      return;
    }

    var re;
    
    try {
      re = new RegExp( f );
    } catch(ex) {
      console.error(ex);
      return;
      
    }
    
    var filtered = m.filter( function(rec) {
      var string_repr = Object.values( rec ).join("/");
      return string_repr.match( re );
    } );
    
    obj.setParam("@metrics_output",filtered );
  }

  return obj;
}
