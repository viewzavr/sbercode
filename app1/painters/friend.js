import * as TWEEN from "../lib/tween.es.js";
import * as V from "./voice.js";
import * as M from "./gltf-model.js";

// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "zoo-friend","ZOO: говорящий друг", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {
//  opts.name ||= "simple-graph-P1";
  var obj = vz.createObj( opts );
  
  var voice = V.create( vz,{parent:obj} );
  
//  var g = M.create( vz, {parent:obj} ); //vz.vis.addGltf( obj, "model" );
  var g = vz.vis.addGltf( obj, "model" );
//  g.setParam("src",vz.getDir( import.meta.url ) + "../../friend.glb" );
  obj.addFile("src",vz.getDir( import.meta.url ) + "../../../assets/friend.glb",function(v) {
    g.setParam("src",v);
  });
  g.signalTracked("src");
  g.colors = [0,1,0];
  g.positions = [10,20,30];
  
  g.track("loaded",function() { 
    setTimeout( function() {
      g.colors = [0,1,0];
    }, 500 );
    }
  );
  
  var tween;
  var tmr;
  
  var callme = "Позвать друга";
  obj.addCmd(callme,function() {
    var q = vzPlayer.getParam("cameraPos");
    console.log(q);
    var tt = qmlEngine.rootObject.cameraPosReal;
    var tta = qmlEngine.rootObject.cameraCenter;
    var coef = 0.7;
    tt = [ tta[0] + coef * (tt[0]-tta[0]), tta[1] + coef * (tt[1]-tta[1]), tta[2] + coef * (tt[2]-tta[2]) ];
    
    var cc = g.positions;
    
    const coords = {x: cc[0], y: cc[1], z: cc[2]} // Start at (0, 0)
    
    if (tween && tween.isPlaying()) tween.stop();
    
    tween = new TWEEN.Tween(coords) // Create a new tween that modifies 'coords'.
      .to({x: tt[0], y: tt[1], z:tt[2]}, 3000) // Move to (300, 200) in 1 second.
      .easing(TWEEN.Easing.Quadratic.Out) // Use an easing function to make the animation smooth.
    .onUpdate(() => {
    // Called after tween.js updates 'coords'.
    // Move 'box' to the position described by 'coords' with a CSS translation.
    //box.style.setProperty('transform', `translate(${coords.x}px, ${coords.y}px)`)
      g.positions = [ coords.x, coords.y, coords.z ];
      })
      .start() // Start the tween immediately.    
    
    if (tmr) clearInterval( tmr );
    tmr = setInterval( function() {
      tween.update();
      if (!tween.isPlaying()) {
        //console.log("FINISHED, going say");
        clearInterval( tmr );
        tmr = undefined;
        //debugger;
        voice.signalTracked("say");
      }
    },5 );
  });
  
  /*
  obj.addCmd("Послать друга",function() {
  });
  */
  
  var atmr;
  voice.track("saying",function() {
    if (atmr) clearInterval( atmr );
    atmr = setInterval( function() {
      g.setParam( "animation_0", (g.getParam("animation_0")+3)%100 );
    }, 10 );
    setTimeout( function() {
      clearInterval( atmr );
      atmr = undefined;
      g.setParam( "animation_0",0);
    }, 4000 );
  
  });
  
  // friend icon
  friend_counter++;
  var dir = vz.getDir( import.meta.url );
  var str = `<div class='friend_${friend_counter}'> <img src='${dir}/friend.png'/></div>`;
  jQuery("#friendSpace").append( str );
  jQuery(`.friend_${friend_counter}`).on('click',function() { obj.signalTracked( callme ); console.log("called") } );

  return obj;
}

var friend_counter  = 0;
jQuery("body").append( `
<div id='friendSpace'/>
<style>
  #friendSpace {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 30000;
    cursor:pointer;
  }
  #friendSpace img {
    border: 0px;
    width: 32px;
  }
</style>
` );

var synth = window.speechSynthesis;