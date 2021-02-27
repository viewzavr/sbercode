

// A Viewzavr package is a javascript module. It may do anything, and beside that
// there are following special functions may be exported:
// * setup, which is called when package is loaded
// * create, which is called to create scene when vzPlayer.loadApp function is called.

// setup function may register components in types table, which is used by player's visual interface
// and by Viewzavr.createObjByType function.
export function setup( vz ) {
  vz.addItemType( "zoo-voice","ZOO: голос", function( opts ) {
    return create( vz, opts );
  } );
}

// create function should return Viewzavr object
export function create( vz, opts ) {

  opts.name ||= "voice";
  var obj = vz.createObj( opts );

  obj.addText("text",`Привет мой друг! За сутки четыре отказа, а в остальном все в норме!
Привет мой друг! Наши дела идут хорошо, респонс в порядке!
Привет мой друг! Что-то сервер баз данных подбарахливает!
Привет мой друг! Назови группу серверов для перехода к ним.
Привет мой друг! Сегодня необычайно облачно!
`,function(t) {
    //speak();
  });

  obj.addCmd("say",speak);
  
  var tmr;
  function speak() {
    if (!synth) {
      console.error("synth not avail!");
      return;
    }
    var text = obj.getParam("text");
    
    var t2 = text.split("\n").filter( s => s.length > 0 );
    text = t2[ Math.floor( Math.random() * t2.length ) ];
    console.log("SAY:",text );
    
    /*
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    */
    var utterThis = new SpeechSynthesisUtterance(text);

    utterThis.onend = function (event) {
        console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
    }
    utterThis.pitch = obj.getParam("pitch");
    utterThis.rate = obj.getParam("rate");
    var voice = voices[ vnames.indexOf( obj.getParam("voice") ) ]
    if (voice)
      utterThis.voice = voice;
    synth.speak(utterThis);
    obj.signal("saying");
/*    
    if (tmr) clearInterval( tmr );
    tmr = setInterval( function() {
      obj
    }, 10 );
*/    
  }
  
  obj.addSlider("rate",1,0.1,2,0.1);
  obj.addSlider("pitch",1.2,0.1,2,0.1);
  
  var voices = [];
  var vnames = [];
  setTimeout( function() {
    voices = synth.getVoices();
    vnames = voices.map( v => v.name );
    //console.log(voices);
    var ruvoice = voices.find( v => v.lang.indexOf("ru") >= 0 );
    var runame = ruvoice ? ruvoice.name : "";
    obj.addComboString( "voice",runame,vnames,function() {
    });
  }, 200 );

  return obj;
}

var synth = window.speechSynthesis;