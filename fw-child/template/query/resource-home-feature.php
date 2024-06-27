<div class="card mb-5 mb-lg-0 scroll-card">

    <a href="<?php echo $item['permalink']; ?>" class="">

        <div class="ratio ratio-3x2 bg-dark">

            <?php

                if ( has_post_thumbnail ( $item['id'] ) ) {

            ?>

                <div class="card-img item-thumb h-100 opacity-100" style="background-image: url(<?php echo get_the_post_thumbnail_url( $item['id'], 'medium_large' ); ?>);"></div>

            <?php

                }

            ?>

        </div>

        <div class="card-body text-light">

            <h5 class="card-title item-title text-light">

                <?php

                    echo $item['title'];

                ?>

            </h5>

            <div class="d-none d-lg-block">

                <?php

                    echo apply_filters ( 'the_content', custom_excerpt ( 20, $item['id'] ) );

                ?>

            </div>

            <p class="post-type">

                <i class="me-1 fa-solid icon-<?php the_field ( 'asset_type', $item['id']) ; ?>"></i>

                <?php

                    the_field ( 'asset_type', $item['id'] );

                ?>

            </p>

        </div>

    </a>

</div>
