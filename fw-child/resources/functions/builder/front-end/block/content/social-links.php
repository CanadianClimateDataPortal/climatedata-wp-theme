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
	],
	'x-twitter' => [
		'icon' => 'fa-x-twitter',
		'name' => 'X',
	],
	'facebook' => [
		'icon' => 'fa-facebook',
		'name' => 'Facebook',
	],
	'instagram' => [
		'icon' => 'fa-instagram',
		'name' => 'Instagram',
	],
	'soundcloud' => [
		'icon' => 'fa-soundcloud',
		'name' => 'SoundCloud',
	],
];

$links = [];
$show_network_names = $element[ 'inputs' ][ 'show_name' ] ?? false;
// The builder may save the value as the string "true" or the boolean `true`,
// so we normalize.
$show_network_names = ( true === $show_network_names || "true" === $show_network_names );

if ( isset( $element[ 'inputs' ][ 'links' ][ 'rows' ] ) ) {

	foreach ( $element[ 'inputs' ][ 'links' ][ 'rows' ] as $row ) {
		if ( empty ( $row[ 'url' ][ $lang ] ) ) {
			continue;
		};

		if ( ! array_key_exists( $row[ 'network' ], $networks ) ) {
			continue;
		}

		$network = $networks[ $row[ 'network' ] ];

		$links[] = [
			'url' => $row[ 'url' ][ $lang ],
			'icon' => $network[ 'icon' ],
			'label' => $network[ 'name' ],
		];
	}
}

?>

<div class="social-networks">
	<?php if ( ! empty( $links ) ) : ?>
		<ul>
			<?php foreach ( $links as $link ) : ?>
				<li>
					<a
						href="<?php echo esc_attr( $link[ 'url' ] ) ?>"
						target="_blank"
						rel="noopener"
						title="<?php echo esc_attr( $link[ 'label' ] ) ?>"
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
