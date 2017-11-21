import 'ol/ol.css';
import 'javascript-autocomplete/auto-complete.css'; 
import VectorLayer from 'ol/layer/vector';
import VectorSource from 'ol/source/vector';
import GeoJSON from 'ol/format/geojson';
import Style from 'ol/style/style';
import IconStyle from 'ol/style/icon';
import proj from 'ol/proj';
import {apply} from 'ol-mapbox-style';             
import AutoComplete from 'javascript-autocomplete'; 
import Overlay from 'ol/overlay';
import coordinate from 'ol/coordinate';


var map = apply(
  'map',
  'style.json'
);


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
    (properties.city || properties.name || '') +
    ' ' +
    (properties.street || '') +
    ' ' +
    (properties.housenumber || '')
  );
}

var searchResult = new VectorLayer({
  zIndex: 1 //
});
map.addLayer(searchResult);
searchResult.setStyle(new Style({
  image: new IconStyle({
    src: './data/marker1.png'
  })
}));

var onload, source;
new AutoComplete({
  selector: 'input[name="q"]',
  source: function(term, response) {
    if (onload) {
      source.un('change', onload);
    }
    searchResult.setSource(null);
    source = new VectorSource({
      format: new GeoJSON(),
      url: 'https://photon.komoot.de/api/?q=' + term
    });
    onload = function(e) {
      var texts = source.getFeatures().map(function(feature) {
        return getAddress(feature);
      });
      response(texts);
      fit();
    };
    source.once('change', onload);
    searchResult.setSource(source);
  },
  onSelect: function(e, term, item) {
    selected = item.getAttribute('data-val');
    source.getFeatures().forEach(function(feature) {
      if (getAddress(feature) !== selected) {
        source.removeFeature(feature);
      }
    });
    fit();
  }
});
