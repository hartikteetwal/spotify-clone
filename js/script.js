console.log("let's write javascript");

let songs;
let songIndex = 0
// let foldersIndex = 0
let folders =[];
let CurrFolder;

function secondsToMinutesSeconds(seconds) {

  if (isNaN(seconds) || seconds <0){
    return '00:00'
  }
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = seconds % 60;
  
  // Format minutes and seconds with leading zeros if necessary
  var formattedMinutes = String(minutes).padStart(2, '0');
  var formattedSeconds = String(remainingSeconds).padStart(2, '0');
  
  return formattedMinutes + ':' + formattedSeconds;
}


const getSongs = async (folder) => {
  CurrFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  }
  return songs;
};

var audio = new Audio();
const playMusic = (track,pause=false)=>{
  audio.src= `/${CurrFolder}/` + track
  if(!pause){
    audio.play();
    play.classList.remove("bx-play-circle")
    play.classList.add("bx-pause-circle")
  }
  
  document.querySelector('.songInfo').innerHTML = `<marquee>${decodeURI(track)}</marquee>`
  document.querySelector('.songTime').innerHTML ='00:00/00:00'
}

async function main(foldersIndex) {
  // Get the list of all the song
  

  songs = await getSongs(`songs/${foldersIndex}/`);


  // show all the song in the playList
  let songUL = document.querySelector('.songList').getElementsByTagName("ul")[0]
  songUL.innerHTML = '';
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li>
    <i class='bx bxs-music'></i>
    <div class="info">
        <div><p>${(song.split(CurrFolder)[1])}</p></div>
        <div>Unknown</div>
    </div>
    <div class="playNow">
        <i class='bx bx-play-circle'></i>
    </div>
</li>`
  }
  playMusic(`${document.querySelector('.songList').getElementsByTagName("li")[0].children[1].children[0].firstChild.innerHTML}`,true)
// Attach EventListener to each song 
Array.from(document.querySelector('.songList').getElementsByTagName("li")).forEach((element,index) => {
  element.addEventListener('click',(e)=>{
    songIndex = index;
    playMusic(`${element.children[1].children[0].firstChild.innerHTML}`)
  })
});



// Listen for time update event
audio.addEventListener("timeupdate",()=>{
  document.querySelector('.songTime').innerHTML = `${secondsToMinutesSeconds(audio.currentTime.toFixed(0))}/${secondsToMinutesSeconds(audio.duration.toFixed(0))}`

  // if song end then next song play 
  if(secondsToMinutesSeconds(audio.currentTime.toFixed(0)) == secondsToMinutesSeconds(audio.duration.toFixed(0)) && secondsToMinutesSeconds(audio.currentTime.toFixed(0)) != '00:00'){
    if(songIndex+1 == songs.length){
      songIndex = 0
      playMusic(songs[songIndex].split(CurrFolder)[1])
      songIndex = songIndex+1
    }
    else{
      playMusic(songs[songIndex+1].split(CurrFolder)[1])
      songIndex = songIndex+1
    }
  }

  
  document.querySelector('.circle').style.left = (audio.currentTime/audio.duration)*100-1 + '%'
})

// Add event listner to the seekbar
document.querySelector('.seekbar').addEventListener('click',(e)=>{
  let precent =  (e.offsetX/e.target.getBoundingClientRect().width)*100
  document.querySelector('.circle').style.left = precent + '%'
  audio.currentTime = (audio.duration*precent)/100
})

// addEventListener to menubar
document.querySelector('.bx-menu').addEventListener('click',()=>{
    document.querySelector('.left').style.left = '0%'
})

document.querySelector('.bx-x').addEventListener('click',()=>{
  document.querySelector('.left').style.left = '-200%'
})


// addEventListener to volume 
document.querySelector('.range').getElementsByTagName('input')[0].addEventListener("change",(e)=>{
  audio.volume = parseInt(e.target.value)/100
  if (parseInt(e.target.value)/100 == 0){
    (document.querySelector('.TimeVol').children[1].classList.remove('bxs-volume-full',))
    (document.querySelector('.TimeVol').children[1].classList.add('bxs-volume-mute'))
  }
  else{
    (document.querySelector('.TimeVol').children[1].classList.remove('bxs-volume-mute'))
    (document.querySelector('.TimeVol').children[1].classList.add('bxs-volume-full'))
  }
})
}

async function allFolder(){
  let a = await fetch(`/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");

  for (let index = 3; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(`${element.title}`)) {
      folders.push(element.title);
    }
  }
return folders
}
  
let main2 =async()=>{
    folders = await allFolder();

    // get the mataData of the Folder 
    let arr = []
    // temp = 0;
    for (let i = 0; i < folders.length; i++) { 
      let a = await fetch(`/songs/${folders[i]}/info.json`);
      let response = await a.json();
      arr.push(response)
    }
    
    for (let i = 0; i < folders.length; i++) { 
      // hartik = `${folders[i]}`
      document.querySelector('.cardContainer').innerHTML =  document.querySelector('.cardContainer').innerHTML + `<div class="card">
      <div class="play">
        <i class="bx bx-play flex justify-center items-center"></i>
      </div>
      <img
        src="/songs/${folders[i]}/cover.jpg"
        alt=""
      />
      <h2>${folders[i]}</h2>
      <p>${arr[i].discription}</p>
    </div>`
  }

// addEventListener to card for folder 
  Array.from(document.getElementsByClassName('bx-play')).forEach((e,index)=>{
    e.addEventListener('click',async()=>{
      await  main(folders[index])
      document.querySelector('.circle').style.left = '0%'
      document.querySelector(".heading").querySelector("li").children[1].innerHTML = folders[index]
      audio.pause()
      setTimeout(() => {
        playMusic(songs[0].split(CurrFolder)[1])
      }, 1000);
      play.classList.remove("bx-pause-circle")
      play.classList.add("bx-play-circle")
      songIndex = 0
    })
  })
  
  
  // addEventListener to prev or next 
  prev.addEventListener('click',()=>{
  if(songIndex == 0){
    songIndex = songs.length
    audio.src = songs[songIndex-1];
    playMusic(audio.src.split(CurrFolder)[1])
    songIndex = songIndex-1;
  }
  else{
    audio.src = songs[songIndex-1];
    playMusic(audio.src.split(CurrFolder)[1])
    songIndex = songIndex-1;
  }
})
next.addEventListener('click',()=>{
  if (songIndex+1 == songs.length){
    songIndex = 0
    audio.src = songs[songIndex];
    playMusic(audio.src.split(CurrFolder)[1])
    songIndex = songIndex+1;
  }
  else{
    audio.src = songs[songIndex+1];
    playMusic(audio.src.split(CurrFolder)[1])
    songIndex = songIndex+1;
  }
})

play = document.querySelector('#play')
play.addEventListener('click',()=>{
  if(play.classList[1] == "bx-pause-circle"){
    document.querySelector("#rotate").classList.remove("disk1");  
  }
  else{ 
    document.querySelector("#rotate").classList.add("disk1");  
  }
  if(audio.paused){
    audio.play()
    play.classList.remove("bx-play-circle")
    play.classList.add("bx-pause-circle")
  }
  else{
    audio.pause()
    play.classList.remove("bx-pause-circle")
  play.classList.add("bx-play-circle") 
  
}
})



document.querySelector('.range').getElementsByTagName('input')[0].value = 10
audio.volume = 0.1
// addEventListener to mute the song 
vol.addEventListener('click',(e)=>{
  if(document.querySelector("#vol").classList.contains("bxs-volume-full")){
    document.querySelector("#vol").classList.remove("bxs-volume-full")
    document.querySelector("#vol").classList.add("bxs-volume-mute")
    document.querySelector('.range').getElementsByTagName('input')[0].value = 0
    audio.volume = 0
  }
  else{
    document.querySelector("#vol").classList.add("bxs-volume-full")
    document.querySelector("#vol").classList.remove("bxs-volume-mute")
    document.querySelector('.range').getElementsByTagName('input')[0].value = 10
    audio.volume = 0.1
  }
})

}
main2()

if(audio.play()){
  document.querySelector("#rotate").classList.remove("disk1");  
}
else{ 
  document.querySelector("#rotate").classList.add("disk1");  
}

if(play.classList[1] == "bx-play-circle"){
  document.querySelector("#rotate").classList.remove("disk1");  
}
else{ 
  document.querySelector("#rotate").classList.add("disk1");  
}