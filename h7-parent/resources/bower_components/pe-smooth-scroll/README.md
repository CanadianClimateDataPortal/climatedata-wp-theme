# smooth scroll

Simple smooth scroll plugin

© Phil Evans

## files

- smooth-scroll.js

## current version

1.1.1

## dependencies

- jQuery

## usage

smooth scroll all #hash and .smooth-scroll links:

```javascript
$('a').click(function(e) {
      	
	var link_href = $(this).attr('href');
	
	if (typeof(link_href) !== 'undefined' && (link_href != '#' && ($(this).hasClass('smooth-scroll') || link_href.charAt(0) == '#'))) {
  	e.preventDefault();
  	
  	$(document).smooth_scroll({
    	id: link_href,
    	speed: 2000,
    	ease: 'easeInOutQuart'
    });
	}
	
});
```

## changelog

#### 1.1

- console logging setting

#### 1.1.1

- replaced complete function with promise/then
- added 'cancel' setting to turn on/off animation cancelling on mouse interaction