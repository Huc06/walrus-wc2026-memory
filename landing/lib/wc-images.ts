/**
 * Real, CC-licensed World Cup / football photos (Wikimedia Commons).
 * CORS-enabled (access-control-allow-origin: *) so they work as WebGL textures.
 */
const W = "https://upload.wikimedia.org/wikipedia/commons";

export const WC_IMAGES: string[] = [
  `${W}/thumb/0/07/Air_Force%E2%80%99s_Zahra_Friess_celebrates_a_goal_during_a_home_game_against_University_of_Denver_at_the_Academy%E2%80%99s_Cadet_Soccer_Stadium_in_Colorado_Springs%2C_Colorado%2C_August_14%2C_2025.jpg/960px-thumbnail.jpg`,
  `${W}/thumb/5/52/Michigan_v_indiana_soccer_2011_06.jpg/960px-Michigan_v_indiana_soccer_2011_06.jpg`,
  `${W}/thumb/d/df/USF_at_UC_2019_-_Bulls_goal_celebration_%2848958641357%29.jpg/960px-USF_at_UC_2019_-_Bulls_goal_celebration_%2848958641357%29.jpg`,
  `${W}/thumb/f/f1/DFC_5331_A_late-night_match_at_Klet_Kaeo_a_player_in_red_sprints_toward_goal_as_defenders_close_in_under_the_floodlights.jpg/960px-DFC_5331_A_late-night_match_at_Klet_Kaeo_a_player_in_red_sprints_toward_goal_as_defenders_close_in_under_the_floodlights.jpg`,
  `${W}/thumb/c/cc/Michigan_v_indiana_soccer_2011_18.jpg/960px-Michigan_v_indiana_soccer_2011_18.jpg`,
  `${W}/thumb/0/04/Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200668%29.jpg/960px-Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200668%29.jpg`,
  `${W}/thumb/2/2c/Camp_Arifjan_soccer_team_takes_on_Kuwaiti_team_in_friendly_match_140522-A-OP586-999.jpg/960px-Camp_Arifjan_soccer_team_takes_on_Kuwaiti_team_in_friendly_match_140522-A-OP586-999.jpg`,
  `${W}/thumb/2/27/Americans_lose_3-1_to_Germans_in_15th_Annual_Sportsfest_soccer_match_%288531011%29.jpg/960px-Americans_lose_3-1_to_Germans_in_15th_Annual_Sportsfest_soccer_match_%288531011%29.jpg`,
  `${W}/thumb/3/3b/Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200677%29.jpg/960px-Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200677%29.jpg`,
  `${W}/thumb/4/42/Football_in_Bloomington%2C_Indiana%2C_1995.jpg/960px-Football_in_Bloomington%2C_Indiana%2C_1995.jpg`,
];

/** Indexed access that always returns a string (wraps around the list). */
export const wc = (i: number): string =>
  WC_IMAGES[((i % WC_IMAGES.length) + WC_IMAGES.length) % WC_IMAGES.length]!;

