//
// GLOBAL VARS
//

;(function($) {

	$(function() {

		console.log('region')
		
		// map
		
		var region_map = L.map('region-map', {
			center: [55,-120],
			zoom: 4,
			zoomControl: false,
			scrollWheelZoom: false
		});
		
		region_map.dragging.disable()
		
		region_map.createPane('basemap')
		region_map.getPane('basemap').style.zIndex = 399
		region_map.getPane('basemap').style.pointerEvents = 'none'
		
		L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
			attribution: '',
			subdomains: 'abcd',
			pane: 'basemap',
			maxZoom: 12
		}).addTo(region_map);
		
		region_map.createPane('labels')
		region_map.getPane('labels').style.zIndex = 550
		region_map.getPane('labels').style.pointerEvents = 'none'
		
		L.tileLayer('//cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
			attribution: '',
			subdomains: 'abcd',
			pane: 'basemap',
			maxZoom: 12,
			minZoom: 3,
		}).addTo(region_map);

	});
})(jQuery);
