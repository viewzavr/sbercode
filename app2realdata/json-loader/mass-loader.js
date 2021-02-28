// вход параметр массив метрик. по нему обращение к.

export function setup( vz ) {
  vz.addItemType( "zoo-mass-loader","ZOO: загрузчик многих метрик", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
//  opts.name ||= "simple-graph-P1";
  var obj = vz.createObj( opts );

  var values = [];
  var times = [];
  obj.trackParam( "@metrics_input",function() {
    console.log("mass loader metrics-input tracked");
  
    var m = obj.getParam("@metrics_input");
    if (!m) {
      values = [];
      times = [];
      return;
    }
    
    var len = m.length;
    values = new Array(len);
    times = new Array(len);
    
    var dasTimeTo = Math.floor( new Date().getTime() / 1000 );
    var dasTimeFrom = dasTimeTo - 1000 * 60 * 60 * 24 * 2; // здесь 2 это кол-во дней
    var period = m.length < 100 ? 1 : 300;    
    
    for (var i=0; i<len; i++) {
      doload( i,ticker );
    }
    
    /*
    
Получение данных о метрике:
https://sber-metrics.*.com/metrics-data?
   namespace=SYS.VPC
  &project=0b9655f7470024af2f88c0179e61425e
  &metric=upstream_bandwidth_usage
  &subject_type=publicip_id
  &subject_uuid=dd1eb966-4d1c-4ec7-9d65-3c9a975e5019
  &time_from=1614422296
  &time_to=1614425898
  &period=1

Дополнительно надо указывать time_from, time_to и period в секундах. Период может быть: 1, 300, 1200, 3600, 14400 или 86400
    */

    function doload( k,tick ) {
      var me = m[k];
      var courl = `https://sber-metrics.viewzavr.com/metrics-data?namespace=${me.namespace}&project=${me.project}&metric=${me.metric}&subject_type=${me.subject_type}&subject_uuid=${me.subject_uuid}&time_from=${dasTimeFrom}&time_to=${dasTimeTo}&period=${period}`;
      console.log("computed cour=",courl);
    
      // courl = "/m2.json";
      // вот тут то и ага
    
      loadFile( courl,function(res) { // viewlang's func
         var metric_data = JSON.parse(res).msg;
         var vv=[];
         var tt=[];
         metric_data.forEach( function(m) {
           vv.push( m.value );
           tt.push( m.timestamp );
         });
         values[k]=vv;
         times[k]=tt;
         tick(k);
      },
      function(err) {
         values[k]=[];
         times[k]=[];
         tick(k);
      });
    }
    // todo: stop all loads when requirement over, todo: cache
    
  });
  
  function ticker(ki) {
    console.log("ticker ",ki );
    obj.setParam("@times",times );
    obj.setParam("@values",values );
  }

  return obj;
}
