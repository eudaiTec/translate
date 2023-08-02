const translatte = require("translatte");
const fs = require("fs");
const convert = require("xml-js");
var path = require('path');

(async function () {
  let core_langs = ["ar","de","es","fr","ka","ru"];
  //let all_langs = ["af","sq","ar","az","bn","bg","ca","zh-CN","zh-TW","hr","cs","da","nl","et","fi","fr","gl","ka","de","el","gu","ht","iw","hi","hu","is","id","it","ja","ko","lv","lt","ms","mr","no","fa","pl","pt","pa","ro","ru","sr","sk","sl","es","sw","sv","th","tr","uk","ur","vi","cy"];

  for (const code of core_langs) {
    console.log("\nTranslating en to " + code);

    try {
      let translatedText = "{";

      const data = fs.readFileSync("en/strings.xml", {
        encoding: "utf8",
        flag: "r",
      });
      var json = JSON.parse(
        convert.xml2json(data, { compact: false, spaces: 4 })
      );

      delete json["declaration"];

      var jsonStringsOnly = json.elements[0].elements;

      jsonStringsOnly = jsonStringsOnly.filter(function (obj) {
        return (
          obj.comment !== " NON- TRANSLATABLE " &&
          obj.comment !== " for managing notification  " &&
          obj.comment !== " AdMob ad unit IDs "
        );
      });

      for (var key in jsonStringsOnly) {
        if (Object.hasOwnProperty.call(jsonStringsOnly, key)) {
          if (jsonStringsOnly[key].name === "string") {
            if (jsonStringsOnly[key].attributes?.translatable !== "false") {
              let txt = jsonStringsOnly[key].elements[0].text
                ? jsonStringsOnly[key].elements[0].text
                : jsonStringsOnly[key].elements[0].cdata;
              let res;
              try {
                res = await translatte(txt, {
                  from: "en",
                  to: code,
                  agents: [],
                  proxies: [],
                });
                translatedText +=
                  '"' +
                  jsonStringsOnly[key].attributes.name +
                  '"' +
                  ': "' +
                  res.text +
                  '",';
              } catch (error) {
                console.log("Translation Error :", error);
              }
            } else {
              translatedText +=
                '"' +
                jsonStringsOnly[key].attributes.name +
                '"' +
                ': "' +
                jsonStringsOnly[key].elements[0].text +
                '",';
            }
          }
          process.stdout.write(".");
        }
      }

      translatedText += "}";
      translatedText = translatedText.trim().replace(/,(?![^,]*,)/, "");
     
      var dir = "values-" + code;
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }

      fs.writeFileSync(
        path.join(dir, code + ".json"),
        translatedText,
        (err) => {
          if (err) console.log(err);
          else {
            console.log("File written successfully\n");
            console.log("The written has the following contents:");
          }
        }
      );

      const translatedJson = fs.readFileSync(path.join(dir, code + ".json"), {
        encoding: "utf8",
        flag: "r",
      });

      fs.rmSync(path.join(dir, "strings.xml"), {
        force: true,
      });

      let translatedXml = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
      translatedXml += "<resources>";
      var parsedTranslatedJson = JSON.parse(translatedJson);
      for (var key in parsedTranslatedJson) {
        if (Object.hasOwnProperty.call(parsedTranslatedJson, key)) {
            translatedXml += "<string name=\"" + key + "\">" + parsedTranslatedJson[key] + "</string>"; 
        }
      }
      translatedXml += "</resources>";

      fs.writeFileSync(
        path.join(dir, "strings.xml"),
        formatXml(translatedXml),
        (err) => {
          if (err) console.log(err);
          else {
            console.log("File written successfully\n");
            console.log("The written has the following contents:");
          }
        }
      );

      fs.rmSync(path.join(dir, code + ".json"), {
        force: true,
      });

    } catch (error) {
      console.log("Error :", error);
    }
  }
})();

function formatXml(xml, tab) { // tab = optional indent value, default is tab (\t)
    var formatted = '', indent= '';
    tab = tab || '\t';
    xml.split(/>\s*</).forEach(function(node) {
        if (node.match( /^\/\w/ )) indent = indent.substring(tab.length); // decrease indent by one 'tab'
        formatted += indent + '<' + node + '>\r\n';
        if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;              // increase indent
    });
    return formatted.substring(1, formatted.length-3);
}