<script setup>
import {ref} from "vue";
const hover = ref("")
const active = ref("")
const elo = ref(1800)
const BotType = ref(null)
function HoverFindMatch(e) {
  let rect = e.target.getBoundingClientRect()
  hover.value = "radial-gradient(circle at "
      + ((e.clientX - rect.x)/rect.width * 100).toFixed(0) + "% "
      + ((e.clientY - rect.y)/rect.height * 100).toFixed(0)
      + "%, #ad965e, #1e2327)"
  active.value = "radial-gradient(circle at " +
      ((e.clientX - rect.x)/rect.width * 100).toFixed(0) + "% "
      + ((e.clientY - rect.y)/rect.height * 100).toFixed(0)
      + "%, #ad965e 0, #1e2327 150%)"
}
function ChangeElo(isIncrease) {
  if (!isIncrease && elo.value > 800) elo.value -= 100
  else if (isIncrease && elo.value < 2800) elo.value += 100
}
function ChooseBot(botType) {
  BotType.value = false
  BotType.value = botType
}
</script>

<template>
  <div class="new-popup">
    <div style="padding-bottom: 4%; font-size: 24px">Choose an opponent:</div>
    <div class="bot-info">
      <div @click="ChooseBot('Amanda')" class="information" :class="BotType === 'Amanda' && 'selected'">
        Amanda
        <div class="details">
          Fist and foremost, an attacker; her second consideration is piece activity. Plays gambit openings.
        </div>
      </div>
      <div @click="ChooseBot('Cloe')" class="information" :class="BotType === 'Cloe' && 'selected'">
        Cloe
        <div class="details">Cloe likes closed positions, pawn storms and sound pawn structure. The only thing she prefers to a closed position is a closed position with a single open file, owned by her rooks. She is a proud practitioner of the French and King’s Indian defenses.
        </div>
      </div>
      <div @click="ChooseBot('Deborah')" class="information" :class="BotType === 'Deborah' && 'selected'">
        Deborah
        <div class="details">
          Picture her as a dark-haired, slender, melancholy woman. She is a defensive player who likes bishops.
        </div>
      </div>
      <div @click="ChooseBot('Defender')" class="information" :class="BotType === 'Defender' && 'selected'">
        Defender
        <div class="details">
          Imagine him in an expensive suit, looking more like a CEO than a chess player. Strong, rational, if mildly pessimistic personality. Plays solid openings. Ready to take draw in dead equal positions.
        </div>
      </div>
      <div @click="ChooseBot('Grumpy')" class="information" :class="BotType === 'Grumpy' && 'selected'">
        Grumpy
        <div class="details">
          Imagine him as a player already past his prime, disrespectful towards his opponents and still quite dangerous. Grumpy likes restricting enemy movement and attacking, enjoys closed positions and expects to win. Because of his age, he plays mostly not too modern openings (ro example, he likes Tarrasch defense).
        </div>
      </div>
      <div @click="ChooseBot('Morphy')" class="information" :class="BotType === 'Morphy' && 'selected'">
        Morphy
        <div class="details">
          Impersonation of Paul Morphy. Emphasizes mobility, then king attack, prefers open positions.
        </div>
      </div>
      <div @click="ChooseBot('Partisan')" class="information" :class="BotType === 'Partisan' && 'selected'">
        Partisan
        <div class="details">
          He starts slowly, using openings that do not occupy much space in the center, but don’t be lulled in a false sense of security. Later he goes for a vicious attacks.
        </div>
      </div>
      <div @click="ChooseBot('Pedrita')" class="information" :class="BotType === 'Pedrita' && 'selected'">
        Pedrita
        <div class="details">
          Pedrita stands for “pawns, defense, restraint”. She plays solid openings and thinks defense first, but don’t be deceived! She can attack all right if position demands it, and with solid pawn play she is a hard nut to crack.
        </div>
      </div>
      <div @click="ChooseBot('Preston')" class="information" :class="BotType === 'Preston' && 'selected'">
        Preston
        <div class="details">
          Mildly materialistic, but fighting for the initiative and close enough to default to avoid unsound plans. Likes to create pressure against enemy pieces. Plays closed openings as white, Slav and Caro-Kann defenses as black. Perhaps the best setup against the weaker engines.
        </div>
      </div>
      <div @click="ChooseBot('Simple')" class="information" :class="BotType === 'Simple' && 'selected'">
        Simple
        <div class="details">
          Plays without more advanced facets of evaluation function, applying sensible default. Slight preference for exchanging queens, in dead equal positions will go for a draw. Perhaps the most computer-like personality.
        </div>
      </div>
      <div @click="ChooseBot('Spitfire')" class="information" :class="BotType === 'Spitfire' && 'selected'">
        Spitfire
        <div class="details">
          Picture him as a tall man in a brown leather jacket. He likes active play but detests being under attack. Likes keeping queens on the board.
        </div>
      </div>
      <div @click="ChooseBot('Strangler')" class="information" :class="BotType === 'Strangler' && 'selected'">
        Strangler
        <div class="details">
          Based on Rodent III personality by Brendan J. Norman. Plays boa constrictor style, but has strong preference for attack, likely to sacrifice for positional reasons. Much more temperamental version of Grumpy, very human-like play. May be overoptimistic in endgames with queens.
        </div>
      </div>
      <div @click="ChooseBot('Tal')" class="information" :class="BotType === 'Tal' && 'selected'">
        Tal
        <div class="details">
          Mikhail Tal loved open positions, sacrifices and complications on the chessboard. Almost no chess player was able to refute his concepts directly at the chessboard.
        </div>
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center">
      Opponent's elo:
      <div style="display: flex; justify-content: center; margin-top: 10%">
        <button @click="ChangeElo(0)" @mousemove="HoverFindMatch" class="pick-button elo-button">-</button>
        <div style="font-size: 21px">{{elo}}</div>
        <button @click="ChangeElo(1)" @mousemove="HoverFindMatch" class="pick-button elo-button">+</button>
      </div>
    </div>
    Play as:
    <div>
      <button @click="$emit('new-bot-match', 0, elo, BotType)" @mousemove="HoverFindMatch" class="pick-button">White</button>
      <button @click="$emit('new-bot-match', Math.round(Math.random()), elo, BotType)" @mousemove="HoverFindMatch" class="pick-button">Random</button>
      <button @click="$emit('new-bot-match', 1, elo, BotType)" @mousemove="HoverFindMatch" class="pick-button">Black</button>
    </div>
  </div>
</template>

<style scoped>
@import "styles/UI.css";
@font-face {
  font-family: gilroy-regular;
  src:url("/assets/fonts/Gilroy-Regular.ttf");
}
.pick-button:hover {
  background: v-bind(hover);
}
.pick-button:active {
  background: v-bind(active);
}
.details {
  font-family: gilroy-regular, sans-serif;
  font-size: 15px;
  margin-top: 1%;
}
.bot-info {
  overflow-y: scroll;
  scrollbar-width: thin;
  scrollbar-color: #484848;
  margin-bottom: 3%;
  width: 60vw;
}
.information {
  margin: 0 1% 1% 1%;
  padding: 1%;
  border-radius: 5px;
}
.information:hover {
  background-color: #3d444d;
}
.elo-button {
  aspect-ratio: 1/1;
  margin: 0 15% 0 15%;
  text-align: center;
  line-height: 0;
}
.selected {
  background-color: #9e8955;
}
.selected:hover {
  background-color: #9e8955;
}
</style>