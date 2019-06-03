Leaflet.Grid
------------

Display a grid overlay on a Leaflet map.

Usage
-----
Leaflet.Grid needs some CSS to look pretty:
```CSS
.leaflet-grid-label .lng {
	margin-left: 8px;
	-webkit-transform: rotate(90deg);
	transform: rotate(90deg);
}
```
Then, after including the `L.Grid.js` file and creating the `map`, just call:

```JavaScript
L.grid().addTo(map);
```

You can redraw the grid on every movement (default) or on the end of the movement by setting the option `redraw: 'moveend'`:

```JavaScript
L.grid({
	redraw: 'moveend'
}).addTo(map);
```

TODO
----
 - Fix snapping / tick size for small zoomlevels

Ideas
-----
 - Make center fixable
 - Wrapping of big longitudes


