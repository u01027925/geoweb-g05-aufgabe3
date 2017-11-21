import "ol/ol.css";
import "javascript-autocomplete/auto-complete.css";
import proj from "ol/proj";
import GeoJSON from "ol/format/geojson";
import VectorLayer from "ol/layer/vector";
import VectorSource from "ol/source/vector";
import { apply } from "ol-mapbox-style";
import AutoComplete from "javascript-autocomplete";

var map = apply(
  "map",
  "https://gist.githubusercontent.com/anonymous/efb8d2ab014796b45817954ed4e188ba/raw/4e15466382a261a6e7da9cecfc34c5dc05f28525/style.json"
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
