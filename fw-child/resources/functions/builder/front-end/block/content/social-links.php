<?php
/**
 * Social links block.
 */

$lang = 'en';

if ( isset ( $globals[ 'current_lang_code' ] ) ) {
	$lang = $globals[ 'current_lang_code' ];
}

$networks = [
	'linkedin' => [
		'icon' => 'fa-linkedin',
		'name' => 'LinkedIn',
		'brand-color' => '#0a66c2',
	],
	'x-twitter' => [
		'icon' => 'fa-x-twitter',
		'name' => 'X',
		'brand-color' => '#000000',
	],
	'facebook' => [
		'icon' => 'fa-facebook',
		'name' => 'Facebook',
		'brand-color' => '#1877f2',
	],
	'instagram' => [
		'icon' => 'fa-instagram',
		'name' => 'Instagram',
		'brand-color' => '#c13584',
	],
	'soundcloud' => [
		'icon' => 'fa-soundcloud',
		'name' => 'SoundCloud',
		'brand-color' => '#ff5500',
	],
];

$links = [];
$show_network_names = $element[ 'inputs' ][ 'show_name' ] ?? false;
$use_brand_colors = $element[ 'inputs' ][ 'brand_colored' ] ?? false;
// The builder may save checkbox values as the string "true" or the boolean `true`,
// so we normalize.
$show_network_names = ( true === $show_network_names || "true" === $show_network_names );
$use_brand_colors = ( true === $use_brand_colors || "true" === $use_brand_colors );

if ( isset( $element[ 'inputs' ][ 'links' ][ 'rows' ] ) ) {

	foreach ( $element[ 'inputs' ][ 'links' ][ 'rows' ] as $row ) {
		if ( empty ( $row[ 'url' ][ $lang ] ) ) {
			continue;
		};

		if ( ! array_key_exists( $row[ 'network' ], $networks ) ) {
			continue;
		}

		$network = $networks[ $row[ 'network' ] ];

		$link_data = [
			'url' => $row[ 'url' ][ $lang ],
			'icon' => $network[ 'icon' ],
			'label' => $network[ 'name' ],
		];

		if ( $use_brand_colors ) {
			$link_data[ 'brand-color' ] = $network[ 'brand-color' ];
		}

		$links[] = $link_data;
	}
}

?>

<div class="social-networks <?php echo $use_brand_colors ? 'brand-colored' : '' ?>">
	<?php if ( ! empty( $links ) ) : ?>
		<ul>
			<?php foreach ( $links as $link ) : ?>
				<li>
					<a
						href="<?php echo esc_attr( $link[ 'url' ] ) ?>"
						target="_blank"
						rel="noopener"
						title="<?php echo esc_attr( $link[ 'label' ] ) ?>"
						<?php if ( ! empty( $link[ 'brand-color' ] ) ) : ?>
							style="color: <?php echo $link[ 'brand-color' ] ?>;"
						<?php endif; ?>
					>
						<i class="fa-brands <?php echo $link[ 'icon' ] ?>"></i>
						<?php if ( $show_network_names ) : ?>
							<span><?php echo esc_html( $link[ 'label' ] ); ?></span>
						<?php endif; ?>
					</a>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php elseif ( is_user_logged_in() ) : ?>
		<div class="alert alert-warning fw-builder-alert">
			No social links have been defined in this language.
		</div>
	<?php endif; ?>
</div>
