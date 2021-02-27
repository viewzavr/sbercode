// A function to convert text in csv format into JS hash object in a form of DataFrame (see df.js)

// data - input text (string with \n)
// separator - regexp encoded as string
// output - an object with a field .colnames and fields for each of columns, e.g. h[columnname] => array-of-values

import * as df from "./df.js";

export default function parse_csv(data,separator) { // data is text blob
  if (df.is_df(data)) {
    return data; // this is already a dataframe
  }
  if (!data || data.length == 0)
    return df.create();

  var lines = data.split("\n"); 
  //console.log("lines=",lines.length)
/* ну вот что она делает.. ну парсит таблицу.. выдает массивчег.. из массивчегов.. ну хоть так для начала
   а дальше.. а дальше нам надо создать из этой штуки поле..
*/
   var trim1 = function (str) {
     return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
   }
   
   var splittrim = function( str,sep ) {
     return str.split( sep ).map( function(e) { return e.trim(); } );
   }

   var filter = function ( item ) {
     return parseFloat( item );
   }

   var skip="";
   // if (typeof(separator)=="undefined") separator="(\\s|,)";
   //if (typeof(separator)=="undefined") separator="[,;]"; // чето второй раз сепаратор в csv мне попался запятая )))
   if (typeof(separator)=="undefined") separator=","; // чето второй раз сепаратор в csv мне попался запятая )))

   var separator_rx = new RegExp( separator );
   //console.log("using separator:",separator_rx );

   var proj_names = splittrim( lines[0], separator_rx );
   var acc = [];
   var string_attrs_mask = {};

    for (var i=1; i<lines.length; i++) {
      var line = trim1( lines[i] );
      if (skip.length > 0 && line.indexOf(skip) >= 0) continue;

      if (line.length == 0) continue;

      //var s = line.split(/\s+/);

      // todo вытаскивать закавыченные данные надо уметь

      var attrs = splittrim(line,separator_rx).map( function(item, index) {
        if (string_attrs_mask[ index ]) return item;
        
        // хотя.. может быть стоит сделать такую штуку, которая потом уже csv прочитанный таким методом оснащает данными (парсит)
        // float?

        if (/^[+-]?([0-9]*[.])?[0-9]+((e[+-]?\d+)?)$/.test(item)) // https://stackoverflow.com/questions/12643009/regular-expression-for-floating-point-numbers
          return parseFloat( item );
        // date?
        if (/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))/.test(item)) // 2019-10-18
          return Date.parse( item );
        if (/^((0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/[12]\d{3})/.test(item)) { // 31/04/2015 - но это не обрабатывается date.parse, засим перевернем месяц и год для него, см ниже 
          // ehh
          var s = item.split("/");
          var s2 = s[1] + "/" + s[0] + "/" + s[2]; // в s[2] окажется и остаток
          return (Date.parse( s2 ) || item);
        }
        if (/^((0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])\.[12]\d{3})/.test(item)) { // 31.04.2015 - но это не обрабатывается date.parse, засим перевернем месяц и год для него, см ниже 
          var s = item.split(".");
          var s2 = s[1] + "/" + s[0] + "/" + s[2]; // в s[2] окажется и остаток
          return (Date.parse( s2 ) || item);
        }

        string_attrs_mask[ index ] = true;
        if (i > 1 && item.length > 0) { // fix previous values - if item looks like real string
          acc[index] = acc[index].map( toString );
        }
        return item;
      } );

      for (var j=0; j<attrs.length; j++) {
        acc[j] = acc[j] || [];
        acc[j].push( attrs[j] );
      }
    }
      
    var res = df.create();
    for (var j=0; j<proj_names.length; j++) df.add_column( res, proj_names[j], acc[j] );
    
    Object.keys(string_attrs_mask).forEach( function(index) { 
      df.set_column_type_string( res, proj_names[index] );
    });

    return res;
    
    // todo позаниматься загрузкой во флоаты 
    // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/from
    // https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Float32Array
}