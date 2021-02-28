import parse_csv from "./csv.js";
import * as df from "./df.js";

export function setup( vz ) {
  vz.addItemType( "zoo-csv","ZOO: load csv", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "load_csv";
  var obj = vz.createObj( opts );
  
  obj.assignData = function( ds ) {
    var names = df.get_column_names( ds );
    obj.addText("loaded-columns",names.join("\n") );
    
    names.forEach( function(name) {
      console.log("ADDING DATA PARAM",name );
      obj.setParam( "@"+name, df.get_column( ds, name) );
    });
    // после этого оно доступно там по ссылкам становится в формулах
  }
  
  obj.addFile("file","",function(v) {
    loadFile( v,function(res) { // viewlang's func
      obj.assignData( parse_csv(res) );
    },
    function(err) {

      obj.assignData( parse_csv("") );
    });
  });

  return obj;
}
