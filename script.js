const $ = (s) => document.querySelector(s);
const pages = [...document.querySelectorAll(".page")];
let currentPage = 0;
function goToPage(index) {
  if (index < 0 || index >= pages.length) return;
  pages[currentPage].classList.remove("active");
  currentPage = index;
  pages[currentPage].classList.remove("active");
  // Force a reflow so the transition plays every time.
  void pages[currentPage].offsetWidth;
  pages[currentPage].classList.add("active");
  $("#stepText").textContent = `CASE FILE ${String(index+1).padStart(2,"0")} / ${String(pages.length).padStart(2,"0")}`;
  $("#stepBar").style.width = `${((index+1)/pages.length)*100}%`;
  window.scrollTo({top:0,behavior:"smooth"});

  // Start the separate Editors song when the final screen opens.
  const editorSong = $("#editorAudio");
  const heartSong = $("#radhimaaAudio");
  if (index === 5 && editorSong) {
    if (heartSong) heartSong.pause();
    editorSong.currentTime = 0;
    editorSong.volume = 0.8;
    editorSong.play().catch(() => {
      // Autoplay may be blocked by browser settings; no player icon is shown by design.
    });
  } else if (editorSong) {
    editorSong.pause();
    editorSong.currentTime = 0;
  }
}
document.querySelectorAll(".next-page").forEach(btn => btn.addEventListener("click",()=>goToPage(currentPage+1)));
document.querySelectorAll(".prev-page").forEach(btn => btn.addEventListener("click",()=>goToPage(currentPage-1)));
$("#brandHome").addEventListener("click", e=>{e.preventDefault();goToPage(0)});
$("#replayBtn").addEventListener("click",()=>location.reload());

function burstConfetti() {
  const emojis=["💗","✨","😂","👑","💥","💕"];
  for(let i=0;i<24;i++){
    const el=document.createElement("span");el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    Object.assign(el.style,{position:"fixed",left:Math.random()*100+"vw",top:"-30px",zIndex:100,fontSize:(18+Math.random()*22)+"px",pointerEvents:"none",transition:"transform 1.8s ease,opacity 1.8s ease"});
    document.body.appendChild(el);requestAnimationFrame(()=>{el.style.transform=`translateY(${innerHeight+80}px) rotate(${Math.random()*720}deg)`;el.style.opacity="0"});setTimeout(()=>el.remove(),1900);
  }
}
const guessCards=[...document.querySelectorAll(".guess-card")];
guessCards.forEach(card=>card.addEventListener("click",()=>{
  if(guessCards.some(c=>c.disabled))return;
  guessCards.forEach(c=>c.disabled=true);
  const correct=card.dataset.answer==="true";card.classList.add(correct?"correct":"wrong");
  $("#reaction").classList.add("show");
  if(correct){$("#guessFeedback").textContent="CORRECT! HOW DID YOU RECOGNISE THE LEGEND? 🏆";$("#reactionImage").src="photos/poovu-funny.png";$("#reactionText").textContent="POOVU HAS BEEN EXPOSED! 😂";burstConfetti();}
  else{$("#guessFeedback").textContent="WRONG! THAT IS AN ANIMAL IMPOSTER. TRY AGAIN AFTER DETECTIVE TRAINING. 🐾";$("#reactionImage").src="photos/poovu-sad.png";$("#reactionText").textContent="POOVU IS SAD YOU DIDN'T RECOGNISE HER. 🥺";}
  $("#reactionImage").onerror=()=>{$("#reactionImage").style.display="none"};
  $("#guessNext").disabled=false;
}));
$("#resetGuess").addEventListener("click",()=>{guessCards.forEach(c=>{c.disabled=false;c.classList.remove("correct","wrong")});$("#guessFeedback").textContent="🕵️ Your mission: identify Poovu!";$("#reaction").classList.remove("show");$("#reactionImage").style.display="inline-block";$("#guessNext").disabled=true;});

// Personality quiz
const questions=[
{q:"What is Poovu's most suspicious superpower?",a:["Being cute and escaping blame","Turning a tiny issue into a full movie","Finding snacks from another dimension","Making everyone laugh mid-argument"]},
{q:"If Poovu says “I'm ready,” what does that mean?",a:["She is already outside","She has just started getting ready","She is waiting for everyone else","Time itself has stopped"]},
{q:"Choose Poovu's official warning label.",a:["Handle with extra snacks","May cause dramatic plot twists","Cute but highly unpredictable","Do not disturb during gossip"]},
{q:"What would Poovu win an award for?",a:["Best dramatic entrance","Most convincing innocent face","Professional snack detection","Making a simple story 45 minutes long"]},
{q:"What happens when someone teases Poovu?",a:["She laughs and roasts them back","She says “I'm not talking to you”","She saves it for future revenge","All of the above, obviously"]}
];
let qi=0,score=0,selected=null;
function renderQuestion(){
 const q=questions[qi];$("#questionText").textContent=`Q${qi+1}. ${q.q}`;$("#answerOptions").innerHTML="";
 q.a.forEach((a,i)=>{const b=document.createElement("button");b.className="answer-option";b.textContent=`${String.fromCharCode(65+i)}. ${a}`;b.addEventListener("click",()=>{if(selected!==null)return;selected=i;b.classList.add("selected");[...$("#answerOptions").children].forEach(x=>x.disabled=true);if(i===1||i===3)score++;$("#nextQuestion").disabled=false});$("#answerOptions").appendChild(b)});
 $("#quizProgress").style.width=`${qi/questions.length*100}%`;$("#nextQuestion").disabled=true;$("#nextQuestion").textContent=qi===4?"Reveal the verdict 🎭":"Next question ➜";
}
$("#nextQuestion").addEventListener("click",()=>{
 if(selected===null)return;qi++;selected=null;
 if(qi<questions.length){renderQuestion();return}
 $("#quizArea").hidden=true;$("#quizProgress").style.width="100%";const types=[["THE SWEET LITTLE MENACE 🍭","Cute face. Criminal levels of chaos."],["THE DRAMA DIRECTOR 🎬","Every small event gets a soundtrack and a sequel."],["THE CHAOS QUEEN 👑","A walking plot twist with excellent timing."],["THE FAMILY'S FAVOURITE SUSPECT 🕵️","Always suspicious. Somehow always loved."]];
 const type=types[Math.min(3,Math.floor(score/2))];$("#quizResult").hidden=false;$("#quizResult").innerHTML=`<p>INVESTIGATION COMPLETE • SCORE ${score}/5</p><h2>${type[0]}</h2><p>${type[1]}</p><p><b>FINAL VERDICT:</b> Guilty of being Poovu. Sentence: unlimited cousin teasing. 💗</p>`;$("#quizNext").hidden=false;$("#restartQuiz").hidden=false;burstConfetti();
});
$("#quizNext").addEventListener("click",()=>goToPage(3));
$("#restartQuiz").addEventListener("click",()=>{qi=0;score=0;selected=null;$("#quizArea").hidden=false;$("#quizResult").hidden=true;$("#quizNext").hidden=true;$("#restartQuiz").hidden=true;renderQuestion()});
renderQuestion();

// Rigged wheel: visual spin, result always Minhaj.
let spinning=false,rotation=0;
$("#spinBtn").addEventListener("click",()=>{
 if(spinning)return;spinning=true;$("#spinBtn").disabled=true;$("#wheelResult").textContent="Spinning… family secrets loading 👀";
 const targetAngle=30;const currentAngle=((rotation%360)+360)%360;const adjustment=(targetAngle-currentAngle+360)%360;rotation+=360*6+adjustment;$("#wheelGraphic").style.transform=`rotate(${rotation}deg)`;
 setTimeout(()=>{$("#wheelResult").textContent="💘 IT'S MINHAJ! THE WHEEL HAS SPOKEN. (Very suspiciously.)";$("#spinBtn").disabled=false;$("#spinBtn").textContent="SPIN AGAIN? 🎡";$("#wheelNext").disabled=false;spinning=false;burstConfetti()},4100);
});
$("#heartButton").addEventListener("click",()=>{
  $("#heartReveal").hidden=false;
  $("#heartButton").querySelector(".heart-hint")?.replaceChildren(document.createTextNode("SECRET UNLOCKED 💌"));
  $("#heartButton").lastElementChild.textContent="SECRET UNLOCKED 💌";
  $("#heartButton").disabled=true;
  $("#heartNext").disabled=false;
  burstConfetti();
  const song=$("#radhimaaAudio");
  const status=$("#musicStatus");
  if(song){
    song.volume=0.8;
    const playAttempt=song.play();
    if(playAttempt && typeof playAttempt.then==="function"){
      playAttempt.then(()=>{if(status)status.textContent="Now playing: Radhimaa 💗";})
        .catch(()=>{if(status)status.textContent="If the song didn't start, tap play once 💗";});
    }
  }
});
const roasts={hiba:"HIBA: Sweet smile, suspicious screenshots, elite-level commentary. 💅",zaya:"ZAYA: Came for the vibes, stayed to cause chaos. 😎"};
document.querySelectorAll(".editor-card").forEach(card=>card.addEventListener("click",()=>{$("#editorPop").textContent=roasts[card.dataset.editor];burstConfetti()}));
