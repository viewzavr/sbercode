SimpleDialog {
  title: "SberCloud.Advanced login"
  
  id: dlg
  property var status: "waiting input"
  property bool success
  
  height: col.height +35+20 
  
  TabView {
  
  id: tabview
  width: 400
  
  Tab {
    title: "User"
  
  Column {
    spacing: 5
    id: col
    
    Text { text: "domain" }    
    TextEdit {
      id: td
      width: 200
      text: "hackathon107"
    }
    
    Text { text: "user" }
    TextEdit {
      id: tu
      width: 200
      text:"demo"
    }
    Text { text: "password" }
    TextEdit {
      id: tp
      width: 200
      text:"XXX"
    }
    
    Button {
      text: "ENTER"
      
      onClicked: {
        dlg.status = "entering";

        jQuery.getJSON( "https://sber-metrics.alexbers.com/auth?user="+tu.text+"&password="+tp.text+"&domain="+td.text+"&project=ru-moscow-1", function( data ) {
              console.log("response",data)
             if (data && data.msg) dlg.status = JSON.stringify(data.msg);
             dlg.success = data.status == "ok";
             if (dlg.success)
               dlg.close();
        });

      }
    }
    
    Row {
      spacing: 5
      
      Text {
        text: "status:"
      }
      Text {
        text: status
      }
    }    
    
  } 
  
  } // tab user
  
  Tab {
    title: "Admin"
  
  Column {
    spacing: 5
    id: col2

    Text { text: "user" }
    TextEdit {
      id: tu2
      width: 200
      text:"demo"
    }
    Text { text: "password" }
    TextEdit {
      id: tp2
      width: 200
      text:"XXX"
    }
    
    Button {
      text: "ENTER"
      
      onClicked: {
        dlg.status = "entering";

        jQuery.getJSON( "https://sber-metrics.alexbers.com/auth?user="+tu2.text+"&password="+tp2.text+"&domain="+tu2.text+"&project=ru-moscow-1", function( data ) {
              console.log("response",data)
             if (data && data.msg) dlg.status = JSON.stringify(data.msg);
             dlg.success = data.status == "ok";
             if (dlg.success)
               dlg.close();
        });

      }
    }
    
    Row {
      spacing: 5
      
      Text {
        text: "status:"
      }
      Text {
        text: status
      }
    }    
    
  } 
  
  } // tab admin

  }
}