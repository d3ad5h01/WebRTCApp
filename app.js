let connection = new RTCPeerConnection();
let localMediaStream;
let remoteMediaStream;
let textChannelStream;
let conversation = [];

//
let mainContainer = document.getElementById('main-box');
let connectContainer = document.getElementById('connect-box');
let videoContainer = document.getElementById('video-box');

let localVideo = document.getElementById('local');
let remoteVideo = document.getElementById('remote');
let offerTextArea = document.getElementById('offer-area');
let answerTextArea = document.getElementById('answer-area');
let createOfferButton = document.getElementById('create-offer');
let createAnswerButton = document.getElementById('create-answer');
let submitAnswerButton = document.getElementById('submit-answer');
let sendMessegeButton = document.getElementById('send-button');
let sendMessegeTextArea = document.getElementById('send-messege');
let offerAnswerBox = document.getElementById('answer-offer-box');




let setupConnection = async () => {
   
    initialCSS();

    const constraints = {
        'video': true,
        'audio': false
    }

    localMediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    localVideo.srcObject = localMediaStream;
    document.getElementById('sample-video').srcObject = localMediaStream;
    remoteMediaStream = new MediaStream();
    remoteVideo.srcObject = remoteMediaStream;
    textChannelStream = connection.createDataChannel('dataChannel');
    
    localMediaStream.getTracks().forEach(element => {
        connection.addTrack(element,localMediaStream);        
    });

    connection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((event) => {
            remoteMediaStream.addTrack(event);
        });
    };
}


connection.ondatachannel= e => {

    const receiveChannel = e.channel;
    receiveChannel.onmessage =e => {
        addMessege("Sender : "+e.data);
    } 
    receiveChannel.onopen = e => {
        console.log("Open Text Channnel.");
        startMeet();
    }
    receiveChannel.onclose =e => console.log("Closed Text Channel.");

}


let createOffer = async () => {
    console.log("Create Offer Triggered");
    const offerCreated = await connection.createOffer();
    await connection.setLocalDescription(offerCreated);
    offerTextArea.value = JSON.stringify(offerCreated);
}

let createAnswer = async () => {
    const offerReceived = JSON.parse(offerTextArea.value);
    connection.onicecandidate = async (event) => {
        if(event.candidate){
            answerTextArea.value = JSON.stringify(connection.localDescription)
        }
    };
    await connection.setRemoteDescription(offerReceived);
    let answerCreated = await connection.createAnswer();
    await connection.setLocalDescription(answerCreated);
}

function addMessege(messege){
    const chats = document.getElementById('all-chats-id');
    if(conversation.length==0)
        chats.style.backgroundColor='aliceBlue';
    conversation.push(messege);
    
    chats.innerHTML = ` <p class="chats">${messege}</p>` +chats.innerHTML ;
}

function onSend(){
    addMessege("Me: "+sendMessegeTextArea.value);
    textChannelStream.send(sendMessegeTextArea.value);
    sendMessegeTextArea.value="";
    //document.activeElement.blur();

}

let submitAnswer = async () => {
    let answer = JSON.parse(answerTextArea.value);
    if (!connection.currentRemoteDescription){
        connection.setRemoteDescription(answer);
    } 

    startMeet();
} 

function startMeet(){
    hideDetails();
    unhideVideo();
    document.getElementsByTagName("BODY")[0].style.backgroundColor ='#121212';

}

function initialCSS(){
    
    mainContainer.classList.add('flexCol');
    document.getElementById('video-box').style.display='none';
    document.getElementById('chat-box').style.display='none';
    document.getElementsByTagName("BODY")[0].style.backgroundColor ='white';
}

function unhideVideo(){
    document.getElementById('video-box').style.display='flex';
    document.getElementById('chat-box').style.display='flex';
}

function hideDetails(){
    connectContainer.style.display = 'none';
}

function pauser(){
    document.getElementById('sample-video').pause();
}

function player(){
    document.getElementById('sample-video').play();

}

function updateScroll(){
    sendMessegeTextArea.scrollTop+=10;
}

createOfferButton.addEventListener('click', createOffer)
createAnswerButton.addEventListener('click', createAnswer)
submitAnswerButton.addEventListener('click', submitAnswer)
sendMessegeButton.addEventListener('click', onSend);
window.addEventListener('resize', handleResponsive , true);
//document.getElementById('pause').addEventListener('click',pauser);
sendMessegeTextArea.onkeypress = (event)=> {
    console.log(event.keyCode);
    if(event.keyCode==13){ event.preventDefault();
        onSend();}
};
setInterval(updateScroll,1000);

setupConnection()



// Responsive

function isEllipsisActive(e) {
    return (e.offsetWidth < e.scrollWidth);
}

function handleResponsive(event) {
    console.log(window.innerHeight + " "+ window.innerWidth);
    if(window.innerWidth<600)
    {
        handleResponsiveOverflow();  
    }
    else 
    {
        handleResponsiveUnderflow();
    }
}

function  handleResponsiveOverflow(){
    //offerAnswerBox.classList.pop();
    console.log(offerAnswerBox.classList);
    offerAnswerBox.classList.remove('flexRow');
    offerAnswerBox.classList.add('flexCol');
    videoContainer.classList.remove('flexRow');
    videoContainer.classList.add('flexCol');
    
    localVideo.style.height= "auto";
    localVideo.style.width= "90vw";
    remoteVideo.style.height = "auto";
    remoteVideo.style.width = "90vw";

}

function  handleResponsiveUnderflow(){
    offerAnswerBox.classList.remove('flexCol');
    offerAnswerBox.classList.add('flexRow');
    videoContainer.classList.add('flexRow');
    videoContainer.classList.remove('flexCol');

    localVideo.style.height= "50vh";
    localVideo.style.width= "45vw";
    remoteVideo.style.height = "50vh";
    remoteVideo.style.width = "45vw";
}
