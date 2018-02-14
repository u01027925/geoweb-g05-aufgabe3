import 'ol/ol.css';
import "javascript-autocomplete/auto-complete.css";
import AutoComplete from "javascript-autocomplete";
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
import Stamen from 'ol/source/stamen';
import VectorLayer from 'ol/layer/vector';
import Vector from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';
import Style from 'ol/style/style';
import Circle from 'ol/style/circle';
import Fill from 'ol/style/fill';
import Stroke from 'ol/style/stroke';
import Overlay from 'ol/overlay';
import proj from 'ol/proj';
import sync from 'ol-hashed';

import VectorSource from "ol/source/vector";
import { apply } from "ol-mapbox-style";
import IconStyle from 'ol/style/icon';
import XYZSource from 'ol/source/xyz';

//Erstellung der Grundkarte Anfang
const map = new Map({
  target: 'map',
  view: new View({
    center: proj.fromLonLat([16.37, 48.2]),
    zoom: 11,
    minZoom: 11,
  })
});
map.addLayer(new TileLayer({
  source: new Stamen({
    layer: 'terrain'
  })
}));
//Erstellung der Grundkarte Ende

//Adressuche Anfang
function fit() {
map.getView().fit(source.getExtent(), {
    maxZoom: 19,
    duration: 250
  });
}

var selected;
function getAddress(feature) {
  var properties = feature.getProperties();
  return (
    (properties.city || properties.name || "") +
    " " +
    (properties.street || "") +
    " " +
    (properties.housenumber || "")
  );
}

var searchResult = new VectorLayer({
  zIndex: 9999
});

map.addLayer(searchResult);

var onload, source;
new AutoComplete({
  selector: 'input[name="q"]',
  source: function(term, response) {
    if (onload) {
      source.un("change", onload);
    }
    searchResult.setSource(null);
    source = new VectorSource({
      format: new GeoJSON(),
      url: "https://photon.komoot.de/api/?q=" + term
    });
    onload = function(e) {
      var texts = source.getFeatures().map(function(feature) {
        return getAddress(feature);
      });
      response(texts);
      fit();
    };
    source.once("change", onload);
    searchResult.setSource(source);
  },
  onSelect: function(e, term, item) {
    selected = item.getAttribute("data-val");
    source.getFeatures().forEach(function(feature) {
      if (getAddress(feature) !== selected) {
        source.removeFeature(feature);
      }
    });
    fit();
  }
});
searchResult.setStyle(new Style({
  image: new IconStyle({
    scale: 0.5,
    src: 'data/marker.png',
    opacity: 1
  })
}));
//Adressuche Ende

//Feedback Anfang

//Hinzufügen des Layers, der die POIs enthält
const layer = new VectorLayer({
  zIndex: 9998,
  source: new Vector({
    url: 'https://student.ifip.tuwien.ac.at/geoweb/2017/g05/Lieblingsort/postgis_geojson.php',
    format: new GeoJSON()

  })
});
map.addLayer(layer);
document.getElementById('punkt_poi').onclick = function(e){
  if(this.checked==1){
    map.addLayer(layer);
    }else{
      map.removeLayer(layer);
    }
  };

//Stylen der POI Punkte
layer.setStyle(new Style({
    image: new IconStyle({
      scale: 0.02,
      src:'data/poi.png',
      opacity:1,
      zIndex:1,
    })
  }));

sync(map);

var overlay = new Overlay({
  element: document.getElementById('popup-container'),
  positioning: 'bottom-center',
  offset: [0, -10],
  autoPan: true
});
map.addOverlay(overlay);
overlay.getElement().addEventListener('click', function() {
  overlay.setPosition();
});

map.on('singleclick', function(e) {
  var markup = '';
  map.forEachFeatureAtPixel(e.pixel, function(feature) {
    var properties = feature.getProperties();
    markup += `${markup && '<hr>'}<table>`;
    for (var property in properties) {
      if (property != 'geometry') {
        markup += `<tr><th>${property}</th><td>${properties[property]}</td></tr>`;
      }
    }
    markup += '</table>';
  }, {
    layerFilter: (l) => l === layer
  });
  if (markup) {
    document.getElementById('popup-content').innerHTML = markup;
    overlay.setPosition(e.coordinate);
  } else {
    overlay.setPosition();
    var pos = proj.toLonLat(e.coordinate);
    window.location.href =
        'https://student.ifip.tuwien.ac.at/geoweb/2017/g05/Lieblingsort/feedback.php?pos=' +
        pos.join(' ');
  }
});
//Laden des Bezirkselayers zu bestehender Karte
const bezirkeLayer = new VectorLayer({
  source: new Vector({
    url: 'https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:BEZIRKSGRENZEOGD&srsName=EPSG:4326&outputFormat=json',
    format: new GeoJSON()
  })
});
// Ein und Ausblenden Anzahl Feedbacks nach Bezirken
document.getElementById('poly_bezirke').onclick = function(e){
  if(this.checked==1){
    map.addLayer(bezirkeLayer);
    }else{
      map.removeLayer(bezirkeLayer);
    }
  };
function calculateStatistics() {
  const feedbacks = layer.getSource().getFeatures();
  const bezirke = bezirkeLayer.getSource().getFeatures();
  if (feedbacks.length > 0 && bezirke.length > 0) {
    for (var i = 0, ii = feedbacks.length; i < ii; ++i) {
      var feedback = feedbacks[i];
      for (var j = 0, jj = bezirke.length; j < jj; ++j) {
        var bezirk = bezirke[j];
        var count = bezirk.get('FEEDBACKS') || 0;
        var feedbackGeom = feedback.getGeometry();
        if (feedbackGeom &&
            bezirk.getGeometry().intersectsCoordinate(feedbackGeom.getCoordinates())) {
          ++count;
        }
        bezirk.set('FEEDBACKS', count);
      }
    }
  }
}
bezirkeLayer.getSource().once('change', calculateStatistics);
layer.getSource().once('change', calculateStatistics);

bezirkeLayer.setStyle(function(feature) {
  var fillColor;
  const feedbackCount = feature.get('FEEDBACKS');
  if (feedbackCount <= 1) {
    fillColor = 'rgba(247, 252, 185, 0.7';
  } else if (feedbackCount < 5) {
    fillColor = 'rgba(173, 221, 142, 0.7)';
  } else {
    fillColor = 'rgba(49, 163, 84, 0.7)';
  }
  return new Style({
    fill: new Fill({
      color: fillColor
    }),
    stroke: new Stroke({
      color: 'rgba(4, 4, 4, 1)',
      width: 1
    })
  });
});

//Feedback Ende

//Layer Museen Hineinladen
const museenlayer = new VectorLayer({
source: new Vector({
url: 'data/MUSEUMOGD.json',
format: new GeoJSON()
})
})
;
//Layer Museen Ein- und Ausblenden
document.getElementById('punkt_museum').onclick = function(e){
  if(this.checked==1){
    map.addLayer(museenlayer);
    }else{
      map.removeLayer(museenlayer);
    }
  };
//Layer Museen Icon Anpassen
museenlayer.setStyle(new Style({
  image: new IconStyle({
    scale: 0.015,
    src: 'data/museum.png',
    opacity: 1
  })
}));

//Layer Burg Hineinladen
const burglayer = new VectorLayer({
source: new Vector({
url: 'data/BURGSCHLOSSOGD.json',
format: new GeoJSON()
})
})
;
//Layer Burg Ein- und Ausblenden
document.getElementById('punkt_burg').onclick = function(e){
  if(this.checked==1){
    map.addLayer(burglayer);
    }else{
      map.removeLayer(burglayer);
    }
  };
//Layer Burg Icon Anpassen
  burglayer.setStyle(new Style({
    image: new IconStyle({
      scale: 0.015,
      src: 'data/burg.png',
      opacity: 1
    })
  }));

//Layer Sehenswuerdigkeiten
const sehenlayer = new VectorLayer({
source: new Vector({
url: 'data/SEHENSWUERDIGOGD.json',
format: new GeoJSON()
})
})
;
//Layer Sehenswuerdigkeiten Ein- und Ausblenden
document.getElementById('punkt_sehen').onclick = function(e){
  if(this.checked==1){
    map.addLayer(sehenlayer);
    }else{
      map.removeLayer(sehenlayer);
    }
  };
  //Layer Sehenswuerdigkeiten Anpassen
    sehenlayer.setStyle(new Style({
      image: new IconStyle({
        scale: 0.015,
        src: 'data/sehen.png',
        opacity: 1
      })
    }));

    //Layer Wlan
    const wlanlayer = new VectorLayer({
    source: new Vector({
    url: 'data/WLANWIENATOGD.json',
    format: new GeoJSON()
    })
    })
    ;
    //Layer Wlan Ein- und Ausblenden
    document.getElementById('punkt_wlan').onclick = function(e){
      if(this.checked==1){
        map.addLayer(wlanlayer);
        }else{
          map.removeLayer(wlanlayer);
        }
      };
      //Layer Wlan Anpassen
        wlanlayer.setStyle(
          function(feature) {
            return new Style({
                image: new IconStyle({
                scale: 0.015,
                src: 'data/wlan.png',
                opacity: 1,
                text: new Text({
                  text: feature.get('properties'),
                  font: 'Arial'
                })
          })
        })
      });
