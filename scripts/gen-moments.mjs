/**
 * Generates public/moments.json — curated iconic World Cup 2026 moments.
 * Run: node scripts/gen-moments.mjs
 * Placeholder media; admin can later swap in real Walrus image blobs.
 */
import { writeFileSync } from 'node:fs'

const C = {
  Argentina: '#75AADB', Portugal: '#C8102E', France: '#1B3A8C', Brazil: '#FFDF00',
  Spain: '#C60B1E', England: '#E6E6E6', Germany: '#111111', Norway: '#BA0C2F',
  Belgium: '#E30613', USA: '#0A3161', Morocco: '#C1272D', Netherlands: '#FF6B00',
  Croatia: '#FF0000', Mexico: '#006847', Japan: '#BC002D', Uruguay: '#5CB8E6',
  Senegal: '#00853F', Colombia: '#FCD116', Canada: '#FF0000', Korea: '#0047A7',
}

// [player, team, opponent, stage, score, stadium, minute, type, title, desc]
const rows = [
  ['Lionel Messi','Argentina','Mexico','Group A','2–1','Estadio Azteca, Mexico City',"78'",'goal','Messi free-kick into the top corner','Messi curls a 25-yard free-kick over the wall into the top-right corner. The Azteca falls silent, then erupts.'],
  ['Cristiano Ronaldo','Portugal','Morocco','Round of 16','1–0','MetLife Stadium, New Jersey',"90+3'",'goal',"Ronaldo's last-minute header",'Ronaldo rises above two defenders to head home a stoppage-time winner, then sprints off for one more Siuuu.'],
  ['Kylian Mbappé','France','Brazil','Quarter-final','2–2 (4–3 p)','AT&T Stadium, Dallas',"61'",'goal','Mbappé solo run from halfway','Mbappé collects on halfway, burns three Brazilians and slots it low. A breathtaking solo goal.'],
  ['Erling Haaland','Norway','Germany','Group E','3–2','Arrowhead Stadium, Kansas City',"55'",'goal',"Haaland's thunderbolt volley",'Haaland meets a cross with a first-time volley that rips the net. Norway stun Germany.'],
  ['Vinícius Júnior','Brazil','Spain','Group F','1–1','SoFi Stadium, Los Angeles',"33'",'skill','Vini Jr nutmeg and finish','Vini dances down the left, nutmegs his man, cuts in and curls it far corner. Pure samba.'],
  ['Emiliano Martínez','Argentina','England','Semi-final','0–0 (5–4 p)','Rose Bowl, Pasadena','Pens','save',"Dibu's decisive penalty save",'Dibu guesses right and pushes away the decisive penalty to send Argentina to the final.'],
  ['Jude Bellingham','England','Netherlands','Quarter-final','2–1','Mercedes-Benz Stadium, Atlanta',"88'",'goal',"Bellingham's late winner",'Bellingham arrives late and smashes home an 88th-minute winner, arms outstretched.'],
  ['Lamine Yamal','Spain','Argentina','Final','2–2 (3–2 p)','MetLife Stadium, New Jersey',"71'",'goal',"Yamal's wonder goal in the final",'Teenage sensation Yamal cuts in from the right and bends an unstoppable shot into the top corner.'],
  ['Kevin De Bruyne','Belgium','Croatia','Group C','2–0','Lumen Field, Seattle',"40'",'skill',"De Bruyne's outside-foot assist",'KDB whips an outside-of-the-boot pass through the defense onto a teammate’s foot.'],
  ['Christian Pulisic','USA','Italy','Group D','1–0',"Levi's Stadium, San Francisco","67'",'goal','Pulisic sends the home crowd wild','Pulisic latches onto a through ball and finishes coolly to send the host nation into raptures.'],
  ['Achraf Hakimi','Morocco','Portugal','Round of 16','1–0','MetLife Stadium, New Jersey',"52'",'skill',"Hakimi's overlapping run",'Hakimi bombs down the right, beats his man and delivers an inch-perfect cross.'],
  ['Pedri','Spain','Germany','Semi-final','1–0','AT&T Stadium, Dallas',"29'",'skill',"Pedri's no-look through ball",'Pedri threads a no-look pass between two defenders to release a runner one-on-one.'],
  ['Julián Álvarez','Argentina','Croatia','Group A','3–0','NRG Stadium, Houston',"24'",'goal',"Álvarez's counter-attack strike",'Álvarez leads a lightning counter and finishes first time across the keeper.'],
  ['Bukayo Saka','England','Senegal','Round of 16','2–1','Gillette Stadium, Boston',"73'",'skill',"Saka's mazy dribble and goal",'Saka glides past three challenges before curling into the bottom corner.'],
  ['Antoine Griezmann','France','Uruguay','Group G','2–1','Hard Rock Stadium, Miami',"81'",'goal',"Griezmann's swerving strike",'Griezmann drops deep, drives forward and unleashes a swerving 30-yarder.'],
  ['Rodrygo','Brazil','Korea Republic','Round of 16','4–1','SoFi Stadium, Los Angeles',"38'",'goal',"Rodrygo's cheeky chip",'Rodrygo dinks a delicate chip over the onrushing keeper. Brazil in full flow.'],
  ['Phil Foden','England','France','Group B','1–1','MetLife Stadium, New Jersey',"58'",'goal',"Foden's curler into the side net",'Foden shifts onto his left and bends one beyond the dive of the keeper.'],
  ['Florian Wirtz','Germany','Japan','Group E','2–2','Arrowhead Stadium, Kansas City',"90'",'goal',"Wirtz's last-gasp equaliser",'Wirtz reacts quickest in a scramble to rescue a point in stoppage time.'],
  ['Federico Valverde','Uruguay','Portugal','Group G','1–0','Hard Rock Stadium, Miami',"63'",'goal',"Valverde's screamer",'Valverde lets fly from distance and the ball flies in off the underside of the bar.'],
  ['Khvicha Kvaratskhelia','Norway','Belgium','Group E','1–1','Lumen Field, Seattle',"47'",'skill','A dazzling wing run','A jinking run down the left leaves two defenders for dead before the cutback.'],
  ['Rafael Leão','Portugal','USA','Group B','2–1','Levi’s Stadium, San Francisco',"70'",'goal',"Leão's burst and finish",'Leão outpaces the defence and rifles it home at the near post.'],
  ['Jamal Musiala','Germany','Mexico','Round of 16','2–0','NRG Stadium, Houston',"35'",'skill',"Musiala's close-control magic",'Musiala wriggles through a packed box, somehow keeping the ball glued to his feet.'],
  ['Nicolò Barella','Italy','Canada','Group D','3–1','BMO Field, Toronto',"50'",'goal','A first-time volley','Barella meets a cleared corner with a dipping first-time volley.'],
  ['Hirving Lozano','Mexico','Germany','Round of 16','2–0','NRG Stadium, Houston',"77'",'goal','Chucky on the break','Lozano races clear and slots past the keeper to seal the upset.'],
  ['Son Heung-min','Korea Republic','Brazil','Round of 16','4–1','SoFi Stadium, Los Angeles',"82'",'goal','Son’s consolation rocket','Son cuts in and thumps a left-footed rocket into the top corner.'],
  ['Wojciech Szczęsny','Spain','Argentina','Final','2–2 (3–2 p)','MetLife Stadium, New Jersey','Pens','save','A fingertip save in the final','A full-stretch fingertip save keeps Spain alive in the shootout.'],
  ['Declan Rice','England','Argentina','Semi-final','0–0 (5–4 p)','Rose Bowl, Pasadena',"104'",'skill','A last-ditch goal-line clearance','Rice slides in to hook the ball off the line in extra time.'],
  ['Ousmane Dembélé','France','Senegal','Quarter-final','2–0','Mercedes-Benz Stadium, Atlanta',"66'",'skill','Dembélé’s double-stepover assist','Dembélé bamboozles his marker with a double stepover before squaring it.'],
  ['Enzo Fernández','Argentina','Spain','Final','2–2 (3–2 p)','MetLife Stadium, New Jersey',"12'",'goal','Enzo opens the final','Enzo arrives at the edge of the box to sweep Argentina ahead early.'],
  ['Gavi','Spain','France','Semi-final','1–0','AT&T Stadium, Dallas',"90+5'",'skill','Gavi’s tireless press wins it','Gavi hounds the defender into a mistake deep in stoppage time.'],
  ['André Onana','Cameroon','Brazil','Group F','1–1','SoFi Stadium, Los Angeles',"85'",'save','Onana denies Brazil','Onana flies to his top corner to tip a curling effort over the bar.'],
  ['Dušan Vlahović','Serbia','England','Group B','2–2','MetLife Stadium, New Jersey',"61'",'goal','Vlahović powers one in','Vlahović bullies his marker and powers a header past the keeper.'],
  ['Cody Gakpo','Netherlands','Croatia','Quarter-final','2–1','Mercedes-Benz Stadium, Atlanta',"44'",'goal','Gakpo’s drive from the left','Gakpo cuts in and drills low across goal into the far corner.'],
  ['Aurélien Tchouaméni','France','Brazil','Quarter-final','2–2 (4–3 p)','AT&T Stadium, Dallas',"19'",'goal','Tchouaméni from range','Tchouaméni steps up and crashes one in from 30 yards.'],
  ['Takefusa Kubo','Japan','Germany','Group E','2–2','Arrowhead Stadium, Kansas City',"71'",'skill','Kubo’s clever turn','Kubo spins away from two markers in a phone-box of space.'],
  ['Alphonso Davies','Canada','Italy','Group D','3–1','BMO Field, Toronto',"26'",'skill','Davies bombs forward','Davies tears 60 yards up the left and whips in the assist.'],
  ['Luka Modrić','Croatia','Belgium','Group C','2–0','Lumen Field, Seattle',"55'",'skill','Modrić’s outside-foot pass','Modrić bends a sumptuous outside-foot ball into the channel.'],
  ['Victor Osimhen','Nigeria','Spain','Group F','1–1','SoFi Stadium, Los Angeles',"68'",'goal','Osimhen rises highest','Osimhen climbs above the defence to thump a header home.'],
  ['Rodri','Spain','Germany','Semi-final','1–0','AT&T Stadium, Dallas',"29'",'goal','Rodri finishes the move','Rodri arrives to side-foot home the winner after Pedri’s pass.'],
  ['Thibaut Courtois','Belgium','Argentina','Quarter-final','1–1','NRG Stadium, Houston',"90+2'",'save','Courtois’ stoppage-time wall','Courtois spreads himself to deny a certain winner at the death.'],
]

// Real, CC-licensed football photos from Wikimedia Commons, grouped by moment
// type. Hotlinked for now (CORS-enabled); will move to Walrus blobs later.
const W = 'https://upload.wikimedia.org/wikipedia/commons'
const IMG = {
  goal: [
    `${W}/thumb/0/07/Air_Force%E2%80%99s_Zahra_Friess_celebrates_a_goal_during_a_home_game_against_University_of_Denver_at_the_Academy%E2%80%99s_Cadet_Soccer_Stadium_in_Colorado_Springs%2C_Colorado%2C_August_14%2C_2025.jpg/960px-thumbnail.jpg`,
    `${W}/thumb/5/52/Michigan_v_indiana_soccer_2011_06.jpg/960px-Michigan_v_indiana_soccer_2011_06.jpg`,
    `${W}/thumb/d/df/USF_at_UC_2019_-_Bulls_goal_celebration_%2848958641357%29.jpg/960px-USF_at_UC_2019_-_Bulls_goal_celebration_%2848958641357%29.jpg`,
    `${W}/thumb/f/f1/DFC_5331_A_late-night_match_at_Klet_Kaeo_a_player_in_red_sprints_toward_goal_as_defenders_close_in_under_the_floodlights.jpg/960px-DFC_5331_A_late-night_match_at_Klet_Kaeo_a_player_in_red_sprints_toward_goal_as_defenders_close_in_under_the_floodlights.jpg`,
    `${W}/thumb/c/cc/Michigan_v_indiana_soccer_2011_18.jpg/960px-Michigan_v_indiana_soccer_2011_18.jpg`,
  ],
  skill: [
    `${W}/thumb/0/04/Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200668%29.jpg/960px-Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200668%29.jpg`,
    `${W}/thumb/2/2c/Camp_Arifjan_soccer_team_takes_on_Kuwaiti_team_in_friendly_match_140522-A-OP586-999.jpg/960px-Camp_Arifjan_soccer_team_takes_on_Kuwaiti_team_in_friendly_match_140522-A-OP586-999.jpg`,
    `${W}/thumb/2/27/Americans_lose_3-1_to_Germans_in_15th_Annual_Sportsfest_soccer_match_%288531011%29.jpg/960px-Americans_lose_3-1_to_Germans_in_15th_Annual_Sportsfest_soccer_match_%288531011%29.jpg`,
    `${W}/thumb/3/3b/Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200677%29.jpg/960px-Bulgaria_hosts_exhibition_soccer_match_for_U_S_Soldiers_%287200677%29.jpg`,
    `${W}/thumb/4/42/Football_in_Bloomington%2C_Indiana%2C_1995.jpg/960px-Football_in_Bloomington%2C_Indiana%2C_1995.jpg`,
  ],
  save: [
    `${W}/d/d3/Penalty_save_on_the_match_of_UEFA_league.jpg`,
    `${W}/thumb/d/d3/Soccer_goalkeeper.jpg/960px-Soccer_goalkeeper.jpg`,
  ],
}
const typeCount = {}

const moments = rows.map((r, i) => {
  const [player, team, opponent, stage, score, stadium, minute, type, title, description] = r
  const teamColor = C[team] || '#888888'
  const pool = IMG[type] || IMG.goal
  const n = typeCount[type] = (typeCount[type] ?? 0) + 1
  return {
    id: `wc26_${String(i + 1).padStart(3, '0')}`,
    player, team, teamColor, opponent,
    match: `${stage} · ${team} ${score} ${opponent}`,
    stadium, minute, type, title, description,
    image: pool[(n - 1) % pool.length],
  }
})

writeFileSync(new URL('../public/moments.json', import.meta.url), JSON.stringify(moments, null, 2))
console.log(`Wrote ${moments.length} moments`)
