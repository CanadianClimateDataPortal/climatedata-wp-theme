const rootElement = document.getElementById('root');
const WP_API_DOMAIN = (rootElement?.getAttribute('data-wp-home-url')) ?? 'https://dev-en.climatedata.ca';

export { WP_API_DOMAIN };
