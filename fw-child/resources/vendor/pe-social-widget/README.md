# social widget

Appends a sharing dropdown menu to an element.

© Phil Evans

## files

- share-widget.js
  - plugin
- share-widget.scss
  - default styles

## current version

1.0

## dependencies

- jQuery

## usage

```javascript
$('#share').share_widget({
  site_url: '//' + window.location.hostname,
  theme_dir: null,
  share_url: window.location.href,
  title: document.title,
  
  elements: {
    facebook: {
      display: false,
      label: 'Facebook',
      icon: 'icon-facebook'
    },
    twitter: {
      display: false,
      label: 'Twitter',
      icon: 'icon-twitter',
      text: null,
      via: null
    },
    pinterest: {
      display: false,
      label: 'Pinterest',
      icon: 'icon-pinterest'
    },
    permalink: {
      display: false,
      label: 'Copy Permalink',
      icon: 'icon-permalink'
    }
  },
  callback: null // callback function
});
```

```javascript
$('#follow').follow_widget({
  elements: {
    facebook: {
      url: null,
      icon: 'icon-facebook'
    },
    twitter: {
      url: null,
      icon: 'icon-twitter'
    }
  }
});
```

## change log
