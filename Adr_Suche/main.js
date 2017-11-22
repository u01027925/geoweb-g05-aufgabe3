import "ol/ol.css";
import "javascript-autocomplete/auto-complete.css";
import proj from "ol/proj";
import GeoJSON from "ol/format/geojson";
import VectorLayer from "ol/layer/vector";
import VectorSource from "ol/source/vector";
import { apply } from "ol-mapbox-style";
import AutoComplete from "javascript-autocomplete";
import Style from 'ol/style/style';
import IconStyle from 'ol/style/icon';

var map = apply(
  "map",
  "data/style.json"
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


