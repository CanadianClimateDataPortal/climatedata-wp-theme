<?php
/**
 * gen_term preference tiers + hard exclusions for cdc_location_search()
 * and cdc_get_location_by_coords().
 *
 * geocoder.all_areas has 648 distinct gen_term values and no categorization
 * column. Filtering is by string. The "right" answer for a coord lookup
 * (locate-me) or for ranking autocomplete suggestions is the closest
 * settlement-class place, not the closest *anything* — parks, lakes,
 * cemeteries, parishes, and admin groupings should never beat a real city.
 *
 * --- Preference tiers ---
 * Lower key = higher preference. Within a tier, distance breaks ties.
 * Anything not listed here falls into the implicit "rest" tier (rank 99)
 * and only wins if no Tier-1/2/3 row exists in the search bounding box.
 *
 * Tier 1: City / Town / Separated Town / Metropolitan Area / Municipality —
 *         addressable population centers. Metropolitan Area is reinstated
 *         from the legacy two-pass logic so Halifax-class metros (which
 *         carry that gen_term in geocoder.all_areas rather than 'City')
 *         resolve correctly. 'Municipality' joins City/Town/Metropolitan
 *         Area here because in Quebec — and broadly across Canada — Ville
 *         and Municipalité are equivalent municipal types: both are
 *         populated places governed by an elected council. Keeping the
 *         generic 'Municipality' in Tier 2 produced wrong-place behavior
 *         (clicking near Verchères returned L'Assomption because Tier-1
 *         Town beat Tier-2 Municipality regardless of distance). The
 *         specialized municipality variants (Specialized / District /
 *         Rural / Parish / Resort / Mountain Resort / Township /
 *         United Townships / Village / Northern Village / Cree Village /
 *         Naskapi Village Municipality) stay in Tier 2 — they signal
 *         special-purpose context (parish = legacy religious admin,
 *         rural = prairie units, resort = tourism zoning) that shouldn't
 *         outrank a generic Municipality or Town nearby.
 *         'Community' is intentionally NOT in Tier 1: it is
 *         double-purpose in geocoder.all_areas — it serves both as a
 *         canonical city name (e.g. Toronto downtown) AND as neighborhood
 *         names within larger cities (West End in Vancouver, Mount Pleasant,
 *         Fairfield, …). The neighborhood usage is far more common and
 *         produces the wrong-name-for-search/locate-me/click pathology
 *         this ticket is fixing (Atom 11 promoted Community and regressed
 *         Vancouver to "West End, BC" at 919m beating "Vancouver, BC" City
 *         at 2.5km — exactly the original Carrington-class bug). Community
 *         falls to the implicit Tier 99 fallback and only wins when no
 *         Tier-1/2/3 row exists in the bounding box.
 * Tier 2: Township / Village / Hamlet variants and specialized
 *         Municipality sub-types — named settlements smaller than a
 *         City/Town, plus special-purpose municipal designations.
 *         Townships sit here (not Tier 1) so a Geographic Township can't
 *         outrank a nearby City (the York-vs-Toronto symptom from Atom
 *         10). Specialized Municipality variants sit here (not Tier 1)
 *         so a Parish/Rural/Resort Municipality can't outrank a generic
 *         Municipality or Town nearby.
 * Tier 3: Borough (Arrondissement) — sub-divisions of cities, returned
 *         when a user is inside one (e.g. Saint-Hubert in Longueuil).
 *
 * --- Hard exclusions ---
 * Never returned regardless of distance. Admin shells with no addressable
 * population center, plus Atoms 4/5/7's territory from CLIM-1322_2_ folded
 * in here. Code documents the rationale; easy to adjust later.
 */

$gen_term_preference_tiers = [
	1 => [
		// Major settlements with addressable population centers.
		// "City" / "Town" are the dominant Canadian municipal types.
		// "Metropolitan Area" reinstated from the legacy two-pass logic
		// because Halifax-class metros carry that gen_term in
		// geocoder.all_areas rather than 'City'/'Town'.
		// "Municipality" (the generic, NOT specialized variants) sits
		// here because in Quebec — Ville and Municipalité — and
		// broadly across Canada, both are equivalent municipal types:
		// populated places governed by an elected council. Without
		// this, Tier-1 Town beat Tier-2 Municipality regardless of
		// distance (e.g. clicking near Verchères returned L'Assomption).
		// Specialized variants (Specialized / District / Rural / Parish
		// / Resort / Mountain Resort / Township / United Townships /
		// Village / Northern Village / Cree Village / Naskapi Village
		// Municipality) stay in Tier 2 — they signal special-purpose
		// context (parish = legacy religious admin, rural = prairie
		// units, resort = tourism zoning) that shouldn't outrank a
		// generic Municipality or Town nearby.
		// "Community" is deliberately excluded here — it is double-
		// purpose in geocoder.all_areas (canonical city names AND
		// neighborhood names within larger cities). The neighborhood
		// usage produces the wrong-name pathology this ticket fixes
		// (West End-Community at 919m beating Vancouver-City at 2.5km).
		// Community falls through to the implicit Tier 99 fallback.
		'City',
		'Town',
		'Separated Town',
		'Metropolitan Area',
		'Municipality',
	],
	2 => [
		// Township-class. In Canadian municipal hierarchies a Township
		// is roughly equivalent to a Town/Village in size, but a
		// Geographic Township is a survey-grid artifact and shouldn't
		// outrank an actual City when both are nearby (e.g. York-Geographic-
		// Township beating Toronto-City was the symptom that motivated
		// this re-tiering).
		'Township',
		'Township Municipality',
		'Geographic Township',
		'United Townships Municipality',
		// Named settlements smaller than City/Town.
		'Village',
		'Village Municipality',
		'Northern Village',
		'Northern Village Municipality',
		'Resort Village',
		'Summer Village',
		'Rural Village',
		'Police Village',
		'Forest Village',
		'Provincial Historic Village',
		'Cree Village',
		'Cree Village Municipality',
		'Naskapi Village',
		'Naskapi Village Municipality',
		'First Nation Village',
		'Former First Nation Village',
		'Specialized Municipality',
		'District Municipality',
		'Rural Municipality',
		'Parish Municipality',
		'Resort Municipality',
		'Mountain Resort Municipality',
		'Hamlet',
		'Northern Hamlet',
		'Organized Hamlet',
		'Townsite',
	],
	3 => [
		// Sub-divisions of cities (Saint-Hubert, Greenfield Park, etc.).
		'Borough',
	],
];

$gen_term_excluded = [
	// Original baseline (autocomplete-aligned).
	'Administrative Region',
	'Province',
	'Territory',
	// Census-statistical groupings — never an addressable place.
	'Census Division',
	'Census Subdivision',
	// Admin shells without an identifiable population center.
	'Regional Municipality',
	'County Regional Municipality',
	'County Municipality',
	'Municipal County',
	'Municipal District',
	'Region',
	'Regional District',
	'Restructured County',
	'County',
	'Improvement District',
	'Local Government District',
	'Local Service District',
	'Local Urban District',
	'Subdivision',
	'Unorganized Territory',
	// Misc admin / data-quality outliers (Atoms 4/5/7 territory).
	'Urban Community',
	'Administrative Sector',
	'Railway Point',
	'Railway Junction',
];

/**
 * Build the SQL fragments needed to apply gen_term preference tiers and
 * hard exclusions in a prepared statement.
 *
 * Given the tiers map, returns:
 *   - case_sql:   "CASE WHEN gen_term IN (?, ?, ...) THEN 1 WHEN ... ELSE 99 END"
 *                 — used in SELECT (aliased as preference_tier) and ORDER BY.
 *   - excl_sql:   "gen_term NOT IN (?, ?, ...)" — used in WHERE.
 *   - case_values: flat array of strings for the CASE WHEN binds, in order.
 *   - excl_values: flat array of strings for the NOT IN binds, in order.
 *   - case_types:  's' repeated for each case_value (for mysqli_stmt_bind_param).
 *   - excl_types:  's' repeated for each excl_value.
 *
 * Both endpoints (cdc_location_search, cdc_get_location_by_coords) call
 * this and stitch the fragments into their own query.
 *
 * @param array $tiers     Map of int rank => list of gen_term strings.
 * @param array $excluded  Flat list of gen_term strings to exclude.
 * @return array{case_sql:string,excl_sql:string,case_values:string[],excl_values:string[],case_types:string,excl_types:string}
 */
function cdc_build_gen_term_fragments ( array $tiers, array $excluded ) {

	$case_parts = [];
	$case_values = [];

	// Sort tiers by key ascending so lower rank = earlier WHEN.
	ksort ( $tiers );

	foreach ( $tiers as $rank => $terms ) {

		if ( empty ( $terms ) ) {
			continue;
		}

		$placeholders = implode ( ', ', array_fill ( 0, count ( $terms ), '?' ) );
		$case_parts[] = "WHEN gen_term IN ($placeholders) THEN " . intval ( $rank );

		foreach ( $terms as $term ) {
			$case_values[] = $term;
		}
	}

	$case_sql = 'CASE ' . implode ( ' ', $case_parts ) . ' ELSE 99 END';

	$excl_placeholders = implode ( ', ', array_fill ( 0, count ( $excluded ), '?' ) );
	$excl_sql = "gen_term NOT IN ($excl_placeholders)";

	return [
		'case_sql' => $case_sql,
		'excl_sql' => $excl_sql,
		'case_values' => $case_values,
		'excl_values' => array_values ( $excluded ),
		'case_types' => str_repeat ( 's', count ( $case_values ) ),
		'excl_types' => str_repeat ( 's', count ( $excluded ) ),
	];
}
