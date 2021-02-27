// Загружает индексный файл метрик, объявляет все найденные метрики своими параметрами
// после чего другие модули могут к ним линковаться (addParamRef) т.е. работает тема Формула

import parse_csv from "./csv.js";
import * as df from "./df.js";

export function setup( vz ) {
  vz.addItemType( "zoo-csv-metrics-list","ZOO: список метрик", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
//#  opts.name ||= "load_csv";
  var obj = vz.createObj( opts );
  
  
  var datadir;
  function fixpath(p) {
    if (p.indexOf("/") >= 0) return p;
    return datadir + p;
  }
  obj.assignData = function( ds ) {
    var names = df.get_column( ds, "metric" );
    var urls =  df.get_column( ds, "metric" ).map( fixpath );

    obj.addText("@loaded-names",names.join("\n") );
    obj.addText("@loaded-metric-urls",urls.join("\n") );
    
    names.forEach( function(name,index) {

      
      // todo times
      var coname = "@" + name + "-values";
      var courl = urls[index];
      
      console.log("ADDING INDEXED DATA PARAM",coname );      
      
      obj.setParam( coname, [] );
      
      var loaded;
      function load_that_metric() {
        debugger;
        if (loaded) return;
        console.log("app-metrics-list: loading metric file",courl);
        loadFile( courl,function(res) { // viewlang's func
          var metric_data = parse_csv(res);
          loaded = true;
          obj.setParam( coname,df.get_column( metric_data, "value"));
        },
        function(err) {
          console.error("super-load: err=",err );
        });
      }
        

      
      if (obj.hasLinksToParam( coname )) load_that_metric();
      else
      obj.track( coname + "Linked", load_that_metric);      
      
    });
    // после этого оно доступно там по ссылкам становится в формулах
  }
  
  obj.trackParam("metric",function() {
    var m = obj.getParam("metric");
    // m сиречь есть список метрик - урлей
  });
  
  obj.addFile("file","",function(v) {
    datadir = vz.getDir( v );
    loadFile( v,function(res) { // viewlang's func
      obj.assignData( parse_csv(res) );
    },
    function(err) {

      obj.assignData( parse_csv("") );
    });
  });

  return obj;
}
