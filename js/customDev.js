$(document).ready(function () {
  let second = 1;
  let minute = 0;
  let hour = 0;
  check = false;
  let i = 0;
  const audioChunks = [];
  let bigRecord = 0;
  let audioURL = "";
  let audio = "";
  let audioBlob = "";
  let knowTime = 0;
  let base64data = "";
  var muteStatus = false;
  let muting = 0;
  $(".main_container").html(
    '<div class="logo">Seerapu Audio Recording Tool</div><div class="inner_container"><div class="indications"><img id="soundImage" class="indicating" src="./images/Sound.svg" /><div class="indicating1"><img class="indicating" src="./images/Setting.svg" /> <div class="dropdown-content"> <a href="#" class="pbSpeed1" >0.25</a> <a href="#" class="pbSpeed1" >0.5</a> <a href="#" class="pbSpeed1" >0.75</a><a href="#" class="pbSpeed1" >1</a><a href="#" class="pbSpeed1" >1.25</a><a href="#" class="pbSpeed1" >1.5</a><a href="#" class="pbSpeed1" >1.75</a><a href="#" class="pbSpeed1">2</a></div></div></div><div class="recordClass"><h2>Record</h2></div><div class="jukeBox"><img id="leftEcho" src="images/echo1.png" /><img id="mic" src="./images/voice-recorder.svg" /><img id="rightEcho" src="images/echo2.png" /></div><div class="counting"><span id="hours">00</span>:<span id="minutes">00</span>:<span id="seconds">00</span></div><div class="basicButtons"><button id="recordIt"><img class="recordI" src="./images/voice-record.svg" />Record</button><button id="recordItStopper"><img class="recordI" src="./images/Stop-button.svg" />Stop</button><button id="fiveSeconds"><img class="recordI" src="./images/voice-record.svg" />Record for 5 Seconds</button><button disabled id="pauseButton"><img class="recordI" src="./images/pause-button.svg" />Pause</button><button id="resumeButton"><img class="recordI" src="./images/resume-button.svg" />Resume</button><button class="resetting" disabled id="resetButton"><img class="recordI" src="./images/reset.svg" />Reset</button></div><div class="controls">MP3 Controls</div><div class="postRecording"><button id="playerSet" disabled><img class="recordI" src="./images/play.svg" />Play</button><button id="pauseButton1"><img class="recordI" src="./images/pause-button.svg" />Pause</button><button id="resumeButton1"><img class="recordI" src="./images/resume-button.svg" />Resume</button><button id="playerDownload" disabled><img class="recordI" src="./images/downloads.svg" />Download</button><button id="based64" disabled><img class="recordI" src="./images/url.svg" />Base64URL</button><button id="server" disabled>' +
      '<img class="recordI" src="./images/upload.svg" />Upload to Server</button><strong><p id="serverResponse"></p></strong></div></div>'
  );
  setTimeout(() => {
    sendFolderName(pid);
  }, 2000);

  function sendFolderName(pid) {
    let todo = {
      userId: pid,
    };
    let bodyContent = JSON.stringify(todo);
    fetch("http://localhost:5020/formPost", {
      method: "POST",
      body: bodyContent,
      headers: { "Content-Type": "application/json" },
    });
  }
  $(".resetting").click(function () {
    window.location.reload();
  });
  $("#fiveSeconds").click(function () {
    bigRecord++;
    if (bigRecord < 2) {
      $("#resetButton").prop("disabled", false);
      $("#recordIt").prop("disabled", true);
      $("#fiveSeconds").prop("disabled", true);
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const myRecorder = new MediaRecorder(stream);
        myRecorder.start();
        myRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });
        const animieFor5Seconds = setInterval(() => {
          if (i % 2 == 0) {
            $("#leftEcho").attr("src", "./images/echo2.png");
            $("#rightEcho").attr("src", "./images/echo3.png");
          }
          if (i % 2 == 1) {
            $("#leftEcho").attr("src", "./images/echo1.png");
            $("#rightEcho").attr("src", "./images/echo2.png");
          }
          i++;
        }, 600);
        const seconds5 = $("#seconds");
        const timer5 = setInterval(function () {
          seconds5.text(`0${second}`);
          second++;
        }, 1000);
        setTimeout(() => {
          myRecorder.stop();
          $("#playerDownload").prop("disabled", false);
          $("#playerSet").prop("disabled", false);
          $("#based64").prop("disabled", false);
          $("#server").prop("disabled", false);
          clearInterval(animieFor5Seconds);
          clearInterval(timer5);
        }, 5000);
      });
    }
  });
  $("#playerSet, #resumeButton1").click(function () {
    if (knowTime == 0) {
      $("#pauseButton1").css("display", "inline-flex");
      $("#playerSet").css("display", "none");
      audioBlob = new Blob(audioChunks);
      audioURL = URL.createObjectURL(audioBlob);
      audio = new Audio(audioURL);
      audio.play();
      knowTime++;
      if (muteStatus) {
        audio.volume = 0;
      }
    } else {
      $("#pauseButton1").css("display", "inline-flex");
      $("#resumeButton1").css("display", "none");
      audio.play();
    }
    audio.addEventListener("ended", function () {
      $("#pauseButton1").css("display", "none");
      $("#resumeButton1").css("display", "none");
      $("#playerSet").css("display", "inline-flex");
      knowTime = 0;
    });
    $("#pauseButton1").click(function () {
      $("#pauseButton1").css("display", "none");
      $("#resumeButton1").css("display", "inline-flex");
      audio.pause();
    });
  });
  $("#playerDownload").click(function () {
    return download(audioChunks);
  });
  function download(audioChunks) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(audioChunks));
    a.download = "newRecording.mp3";
    a.click();
  }
  $("#based64").click(function () {
    const reader = new FileReader();
    reader.readAsDataURL(new Blob(audioChunks));
    reader.onloadend = function () {
      base64data = "data:audio/mp3;" + reader.result;
      console.log(base64data);
      alert("Check the web console for the URL");
      debugBase64(base64data);
    };
  });
  $("#server").click(function () {
    const finalAudio = new Blob(audioChunks, { type: "audio/mp3" });
    sendAudioFile(finalAudio);
    alert("Uploaded Successfully!!!");
  });

  function sendAudioFile(finalOutput) {
    const formData = new FormData();
    formData.append("audiofile", finalOutput);
    fetch("http://localhost:5020/upload-mp3", {
      method: "POST",
      body: formData,
    });
  }
  function debugBase64(base64URL) {
    let win = window.open();
    win.document.write(
      '<iframe src="' +
        base64URL +
        '" frameborder="0" style="border:0; padding: 0px; margin:0px; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>'
    );
  }
  $(".indicating").click(function () {
    if (muting % 2 == 0 && bigRecord > 0) {
      audio.volume = 0;
      $("#soundImage").attr("src", "./images/mutedAudio.png");
      muteStatus = true;
    } else {
      audio.volume = 1;
      $("#soundImage").attr("src", "./images/Sound.svg");
      muteStatus = false;
    }
    muting++;
  });
  console.log();
  $(".pbSpeed1").click(function () {
    if (bigRecord > 0) {
      audio.playbackRate = $(this).text();
    }
  });
  $("#recordIt").click(function () {
    bigRecord++;
    $("#recordIt").css("display", "none");
    if (bigRecord < 2) {
      check = true;
      $("#recordItStopper").css("display", "inline-flex");
      $("#fiveSeconds").prop("disabled", true);
      let animationStart = setInterval(() => {
        if (i % 2 == 0) {
          $("#leftEcho").attr("src", "./images/echo2.png");
          $("#rightEcho").attr("src", "./images/echo3.png");
        }
        if (i % 2 == 1) {
          $("#leftEcho").attr("src", "./images/echo1.png");
          $("#rightEcho").attr("src", "./images/echo2.png");
        }
        i++;
      }, 600);
      const seconds = $("#seconds");
      const minutes = $("#minutes");
      const hours = $("#hours");
      let connectionStart = setInterval(() => {
        if (second > 59 && check) {
          second = 0;
        }
        if (second < 10 && check) {
          seconds.text(`0${second}`);
        } else if (check) {
          seconds.text(second);
        }
        second++;
        if (second === 60 && check) {
          minute++;
          setTimeout(() => {
            if (minute > 59 && check) {
              hour++;
              if (hour < 0 && check) {
                hours.text(`0${hour}`);
              } else if (check) {
                hours.text(hour);
              }
              minute = 0;
            }
            if (minute < 10 && check) {
              minutes.text(`0${minute}`);
            } else if (check) {
              minutes.text(minute);
            }
          }, 1000);
        }
      }, 1000);
      $("#pauseButton").prop("disabled", false);
      $("#resetButton").prop("disabled", false);
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const myRecorder = new MediaRecorder(stream);
        myRecorder.start();
        myRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });
        $("#recordItStopper").click(function () {
          myRecorder.stop();
          $("#playerDownload").prop("disabled", false);
          $("#playerSet").prop("disabled", false);
          $("#based64").prop("disabled", false);
          $("#server").prop("disabled", false);
          $("#pauseButton").prop("disabled", true);
          if ($("#resumeButton").css("display", "none")) {
            $("#resumeButton").prop("disabled", false);
          }
          $("#recordItStopper").prop("disabled", true);
          clearInterval(connectionStart);
          clearInterval(animationStart);
        });
        const pauseBreak = $("#pauseButton");
        const resumeStart = $("#resumeButton");
        pauseBreak.click(function () {
          pauseBreak.css("display", "none");
          resumeStart.css("display", "inline-flex");
          myRecorder.pause();
          {
            clearInterval(connectionStart);
            clearInterval(animationStart);
          }
        });
        resumeStart.click(function () {
          pauseBreak.css("display", "inline-flex");
          resumeStart.css("display", "none");
          myRecorder.resume();
          animationStart = setInterval(() => {
            if (i % 2 == 0) {
              $("#leftEcho").attr("src", "./images/echo2.png");
              $("#rightEcho").attr("src", "./images/echo3.png");
            }
            if (i % 2 == 1) {
              $("#leftEcho").attr("src", "./images/echo1.png");
              $("#rightEcho").attr("src", "./images/echo2.png");
            }
            i++;
          }, 600);
          connectionStart = setInterval(() => {
            if (second > 59 && check) {
              second = 0;
            }
            if (second < 10 && check) {
              seconds.text(`0${second}`);
            } else if (check) {
              seconds.text(second);
            }
            second++;

            if (second === 60 && check) {
              minute++;
              setTimeout(() => {
                if (minute > 59 && check) {
                  hour++;
                  if (hour < 0 && check) {
                    hours.text(`0${hour}`);
                  } else if (check) {
                    hours.text(hour);
                  }
                  minute = 0;
                }
                if (minute < 10 && check) {
                  minutes.text(`0${minute}`);
                } else if (check) {
                  minutes.text(minute);
                }
              }, 1000);
            }
          }, 1000);
        });
      });
    }
  });
});
