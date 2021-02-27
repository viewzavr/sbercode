import * as csvload from "./csv-loader/app.js";
import * as S1 from "./scene1/app.js";
import * as P1 from "./painters/p1.js";
import * as P2 from "./painters/p2.js";

// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  csvload.setup( vz );
  S1.setup( vz );
//  P1.setup( vz );
//  P2.setup( vz );
  
  return vzPlayer.loadPackage( vz.getDir( import.meta.url ) + "/painters/files.txt" );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
  opts.name ||= "demoscene";
  var obj = vz.createObj( opts );

  return obj;
}
