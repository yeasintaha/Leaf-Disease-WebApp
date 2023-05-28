import React, { useState, useEffect, useContext, useRef } from "react";
import MicRecorder from "mic-recorder-to-mp3";
import "./HomePage.css";
import { UserContext } from "../UserContext";
import { card_disease } from "../Data/card_disease";
import axios from "axios";
import { storage } from "../firebase";
import {
  ref,
  uploadBytes,
  listAll,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 } from "uuid";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { IoMdLogOut, IoMdMic, IoMdImage } from "react-icons/io";
import { FaFileAudio } from "react-icons/fa";
import { BsStopCircleFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

// const SpeechRecognition =
//   window.SpeechRecognition || window.webkitSpeechRecognition;

// const mic = new SpeechRecognition();

// mic.continuous = true;
// mic.interimResults = true;
// mic.lang = "bn-BD";

// const BASEURL = "https://auris.serveo.net/" || "http://127.0.0.1:8000/";
const BASEURL = "http://127.0.0.1:8000/";

function HomePage() {
  const [image, setImage] = useState(null);
  const [moreImages, setMoreImages] = useState(null);
  const [response, setResponse] = useState([]);
  const [typeResponse, setTypeResponse] = useState(null);
  const [seeMore, setSeeMore] = useState(false);
  const [content, setContent] = useState(true);
  const [audioFile, setAudioFile] = useState(null);
  const [isRecording, setIsRecording] = useState(null);
  const recorder = useRef(null); //Recorder
  const audioPlayer = useRef(null); //Ref for the HTML Audio Tag
  const [blobURL, setBlobUrl] = useState(null);
  // const [isListening, setIsListening] = useState(false);
  // const [speechDialog, setSpeechDialog] = useState(null);
  // const [savedDialog, setSavedDialog] = useState([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const [hideTimer, setHideTimer] = useState(true);
  const [controlMeasures, setControlMeasures] = useState(null);

  const navigate = useNavigate();

  const { userCredentials, setUserCredentials } = useContext(UserContext);

  useEffect(() => {
    //Declares the recorder object and stores it inside of ref
    recorder.current = new MicRecorder({ bitRate: 128 });

    if (userCredentials.Email === "") {
      navigate("/home");
    }
  }, []);

  function handleStart() {
    if (isRunning) return;
    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(true);
    setHideTimer(false);
    intervalRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  }

  function handleStop() {
    if (!isRunning) return;
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }

  // function handleReset() {
  //   clearInterval(intervalRef.current);
  //   setIsRunning(false);
  //   setTime(0);
  // }

  function formatTime() {
    const hours = Math.floor(time / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((time % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  const fetchControlMeasures = async () => {
    try {
      const { data } = await axios.get(
        `${BASEURL}control-measures/${response[0]}`
      );
      setControlMeasures(data);
      console.log(data);
      console.log(data[0]);
    } catch (e) {}
  };

  const startRecording = () => {
    // Check if recording isn't blocked by browser
    toast.success("Recording is on!", {
      position: "top-right",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    recorder.current.start().then(() => {
      setIsRecording(true);
    });
    handleStart();
  };

  const stopRecording = async () => {
    handleStop();
    toast.success("Recording is off!", {
      position: "top-right",
      autoClose: 500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        const file = new File(buffer, "video.mp3", {
          type: blob.type,
          lastModified: Date.now(),
        });
        const newBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(newBlobUrl);
        setIsRecording(false);
        setAudioFile(file);
        console.log(file);

        try {
          const imageRef = ref(storage, "Images/" + `${file.name}`);
          uploadBytes(imageRef, file).then(() => {});
        } catch (e) {
          alert(e);
        }
      })
      .catch((e) => console.log(e));

    try {
      setTimeout(async () => {
        const { data } = await axios.get(`${BASEURL}detect-voice/video.mp3`);
        if (data.text === "-1") {
          toast.error("Couldn't understand the voice, Please try again!", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        } else {
          setTypeResponse(data.text);
          setTimeout(async () => {
            const { data } = await axios.get(
              `${BASEURL}detect-symptomps/${typeResponse}`
            );
            // alert(data.message);
            // alert(data.sim);
            setTypeResponse(data);
            console.log(data.sim);
          }, 300);
          // alert(data.text);
        }
      }, 1000);

      // setTimeout(() => {
      //   const imageRef = ref(storage, "Images/" + `video.mp3`);
      //   deleteObject(imageRef)
      //     .then(() => {
      //       // alert("deleted");
      //     })
      //     .catch((error) => {
      //       // alert("error deleting ");
      //     });
      // }, 2000);
    } catch (err) {
      alert(err);
    }
  };

  const [fileRecord, setFileRecord] = useState(null);

  const handleFileChangeRecord = async (event) => {
    // alert(e.target.files[0]);
    console.log(event.target.files[0]);
    try {
      setFileRecord(event.target.files[0]);
      const recordRef = ref(
        storage,
        "Images/" + `${event.target.files[0].name}`
      );
      uploadBytes(recordRef, event.target.files[0]).then(() => {});

      try {
        const { data } = await axios.get(
          `${BASEURL}detect-voice/${event.target.files[0].name}`
        );

        toast.success("Uploaded successfully!", {
          position: "top-right",
          autoClose: 500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        if (data.text === "-1") {
          toast.error("Couldn't understand the voice, Please try again!", {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        } else {
          setTypeResponse(data.text);
          setTimeout(() => {
            // alert(data.text);
            const imageRef = ref(
              storage,
              "Images/" + `${event.target.files[0].name}`
            );
            deleteObject(imageRef)
              .then(() => {
                // alert("deleted");
              })
              .catch((error) => {
                // alert("error deleting ");
              });
          }, 2000);

          setTimeout(async () => {
            const { data } = await axios.get(
              `${BASEURL}detect-symptomps/${typeResponse}`
            );
            // alert(data.message);
            setTypeResponse(data);
            console.log(data.sim);
          }, 300);
        }
      } catch (err) {
        toast.error(
          "Recorded file either crashed or not in original format, Please Try Again!",
          {
            position: "top-right",
            autoClose: 800,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
        // window.location.reload(false);
      }
    } catch (e) {
      alert(e);
    }
  };

  // const handleUploadRecord = () => {
  //   // const storageRef = firebase.storage().ref();
  //   // const fileRef = storageRef.child(fileRecord.name);
  //   // fileRef.put(fileRecord)
  //   //   .then(() => {
  //   //     console.log('File uploaded successfully!');
  //   //   })
  //   //   .catch((error) => {
  //   //     console.error(error);
  //   //   });
  // };

  // useEffect(() => {
  //   if (userCredentials.Email === "") {
  //     navigate("/");
  //   }
  // });

  // useEffect(() => {
  //   handleListen();
  // }, [isListening]);

  // const handleListen = () => {
  //   if (isListening) {
  //     mic.start();
  //     mic.onend = () => {
  //       console.log("continue ... ");
  //       mic.start();
  //     };
  //   } else {
  //     mic.stop();
  //     mic.onend = () => {
  //       console.log("stopped mic on click");
  //     };
  //   }
  //   mic.onstart = () => {
  //     console.log("Mic is on");
  //   };

  //   mic.onresult = (event) => {
  //     const transcript = Array.from(event.results)
  //       .map((result) => result[0])
  //       .map((result) => result.transcript)
  //       .join("");
  //     console.log(transcript);
  //     setSpeechDialog(transcript);
  //     // setSavedDialog([...savedDialog, speechDialog]);
  //     mic.onerror = (event) => {
  //       console.log(event.error);
  //     };
  //   };
  // };

  // const handleSaveNote = () => {
  //   setSavedDialog([...savedDialog, speechDialog]);
  //   // setSpeechDialog();
  // };

  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${BASEURL}detect-image/${image.name}`);
      // alert(data[0]);
      setResponse(data);
      console.log(data);
    } catch (err) {
      alert("Server Error, Please Reload Page And Upload It Again!!!");
    }
  };

  const fetchMoreImages = (val) => {
    setMoreImages(null);
    setSeeMore(false);
    try {
      const fetchRef = ref(storage, `${response[0]}`);
      listAll(fetchRef)
        .then((res) => {
          const promises = res.items.map((item) =>
            getDownloadURL(item).then((url) => ({
              id: item.name,
              url,
            }))
          );
          Promise.all(promises).then((imgs) => {
            setMoreImages(imgs);
            console.log(moreImages[0]);
            console.log(moreImages[0].url);
          });
        })
        .catch((error) => {
          console.log(error);
        });
      if (val != "" || val != null) {
        const fetchRef = ref(storage, `${val}`);

        listAll(fetchRef)
          .then((res) => {
            const promises = res.items.map((item) =>
              getDownloadURL(item).then((url) => ({
                id: item.name,
                url,
              }))
            );
            Promise.all(promises).then((imgs) => {
              setMoreImages(imgs);
              console.log(moreImages[0]);
              console.log(moreImages[0].url);
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } catch (e) {
      alert(e);
    }
  };

  const handleSignout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        setUserCredentials({
          Email: "",
          Password: "",
        });
        toast.success("Successfully Signed Out!", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate("/");
      })
      .catch((error) => {
        toast.success("Successfully Signed Out!");
      });
  };

  const [search, setSearch] = useState("");

  const handleTypeDetection = async (e) => {
    // setSearch(e.target.value);
    try {
      if (search != "" || search != null) {
        setTimeout(async () => {
          const { data } = await axios.get(
            `${BASEURL}detect-symptomps/${search.trim()}`
          );
          // alert(data.message);
          setTypeResponse(data);
          console.log(data.sim);
        }, 300);
      }
    } catch (err) {
      // alert("Server Error, Please Reload Page And Upload It Again!!!");
    }
  };

  const handleRes = typeResponse?.sim?.map((item) => {
    for (let j = 0; j < card_disease.length; j++) {
      if (item === card_disease[j].id) {
        return (
          <Card
            sx={{ maxWidth: 270 }}
            style={{
              margin: "10px",
              border: "0.6px solid white",
              boxShadow: " 2px 0px 6px 1px rgba(128, 128, 128, 0.658)",
              cursor: "pointer",
            }}
            onClick={() => {
              setResponse(card_disease[j].id);
              fetchMoreImages(card_disease[j].id);
            }}
          >
            <CardMedia
              sx={{ height: 200 }}
              image={card_disease[j].image}
              title={card_disease[j].id}
            />
            <CardContent>
              <Typography
                gutterBottom
                variant="h6"
                style={{ fontSize: 16, fontWeight: "700" }}
                component="div"
              >
                Rice {card_disease[j].id} Disease
              </Typography>
              <Typography
                variant="body2"
                style={{
                  textAlign: "justify",
                  textJustify: "inter-word",
                  height: 170,
                }}
                color="text.secondary"
              >
                {card_disease[j].desc}
              </Typography>
            </CardContent>
            <CardActions>
              {/* <Button size="small">Share</Button> */}
            </CardActions>
          </Card>
        );
      }
    }
  });

  const allContent = card_disease.map((item) => {
    return (
      <Card
        sx={{ maxWidth: 270 }}
        style={{
          margin: "10px",
          border: "0.6px solid white",
          boxShadow: " 2px 0px 6px 1px rgba(128, 128, 128, 0.658)",
          cursor: "pointer",
        }}
      >
        <CardMedia sx={{ height: 200 }} image={item.image} title={item.id} />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            style={{ fontSize: 16, fontWeight: "700" }}
            component="div"
          >
            Rice {item.id} Disease
          </Typography>
          <Typography
            variant="body2"
            style={{
              textAlign: "justify",
              textJustify: "inter-word",
              height: 170,
            }}
            color="text.secondary"
          >
            {item.desc}
          </Typography>
        </CardContent>
        <CardActions>{/* <Button size="small">Share</Button> */}</CardActions>
      </Card>
    );
  });

  const handleUpload = async (event) => {
    setResponse(null);
    // setRemove(true);
    setMoreImages(null);
    setContent(false);
    setTypeResponse("");

    try {
      setImage(event.target.files[0]);
      const imageRef = ref(
        storage,
        "Images/" + `${event.target.files[0].name}`
      );
      uploadBytes(imageRef, event.target.files[0]).then(() => {});
    } catch (e) {
      alert(e);
    }
  };

  return (
    <div className="homepage_div">
      <div className="header_div">
        <img
          style={{
            width: "50px",
            margin: "10px",
            display: "flex",
            flexWrap: "wrap",
            cursor: "pointer",
          }}
          className="headerLogo"
          src="\leaf.png"
          alt="Leaf"
          onClick={() => window.location.reload(false)}
        />
        <p
          style={{}}
          className="titleHeader"
          onClick={() => window.location.reload(false)}
        >
          Rice Leaf Disease Detection{" "}
        </p>
        <div
          style={{
            alignItems: "center",
            textAlign: "center",
            cursor: "pointer",
          }}
          className="signoutHeader"
          onClick={handleSignout}
        >
          <IoMdLogOut
            style={{
              fontSize: "30px",
              color: "darkgreen",
            }}
          />
          <p
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "darkgreen",
              margin: 0,
              padding: 0,
            }}
          >
            Sign Out
          </p>
        </div>
      </div>
      {/* <div>
        <h2>hello hello</h2>
        {isListening ? <span> 🎙️ </span> : <span> 🛑🎙️ </span>}
        <button onClick={handleSaveNote}> Save note</button>
        <button onClick={() => setIsListening((prevState) => !prevState)}>
          Start/Stop
        </button>
        <p> {speechDialog}</p>
        <div>
          <h3> notes</h3>
          {savedDialog?.map((n) => (
            <p key={n}> {n} </p>
          ))}
        </div>
        
      </div> */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", margin: "20px" }}
        >
          <textarea
            id="outlined-basic"
            placeholder="Type here to identify disease"
            variant="outlined"
            style={{
              backgroundColor: "rgba(0, 255, 0, 0.2)",
              width: 300,
              height: 200,
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={
              search ? "typeSuggestDiseaseBtn" : "typeSuggestDiseaseDisabledBtn"
            }
            onClick={handleTypeDetection}
            disabled={!search ? true : false}
          >
            Detect Disease
          </button>
        </div>
        <div style={{ margin: "20px" }}>
          <div class="upload-btn-wrapper">
            <button class="btnChooseImage">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <IoMdImage
                  style={{
                    fontSize: "90px",
                    alignContent: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    margin: "0px",
                    padding: "0px",
                  }}
                />
                <p style={{ paddingTop: "10px" }}>
                  Choose an Image To Identify Disease
                </p>
              </div>
            </button>
            <input
              type="file"
              name="myfile"
              accept="image/*"
              onChange={(event) => {
                handleUpload(event);
              }}
            />
          </div>
          <div>
            <label htmlFor="file-upload" className="upload-label">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <FaFileAudio
                  style={{
                    fontSize: "40px",
                    alignContent: "center",
                    textAlign: "center",
                    justifyContent: "center",
                    marginRight: "5px",
                    marginBottom: "10px",
                    padding: "0px",
                  }}
                />
                Upload Recording
              </div>
            </label>
            <input
              type="file"
              id="file-upload"
              className="upload-input"
              accept=".mp3"
              onChange={handleFileChangeRecord}
            />
            {/* <button onClick={handleUploadRecord} className="upload-button">
            Upload
          </button> */}
          </div>
          <div
            className="buttons-container"
            onClick={!isRunning ? startRecording : stopRecording}
          >
            {!isRunning ? (
              <button
                // disabled={isRecording}
                // onClick={startRecording}
                style={{
                  // backgroundColor: "rgba(0, 255,0,0.4)",
                  backgroundColor: "#32a007",
                  border: "none",
                }}
                className="start-button"
              >
                <IoMdMic
                  style={{
                    fontSize: "25px",
                    color: "white",
                  }}
                />
              </button>
            ) : (
              <button
                // disabled={!isRecording}
                // onClick={stopRecording}
                style={{
                  // backgroundColor: "rgba(0, 255,0,0.4)",
                  backgroundColor: "#32a007",
                  border: "none",
                }}
                className="stop-button"
              >
                <BsStopCircleFill
                  style={{
                    fontSize: "25px",
                    color: "white",
                    alignItems: "center",
                    textAlign: "center",
                    justifyContent: "center",
                  }}
                />
              </button>
            )}
            <p
              className="timer"
              style={{
                display: hideTimer && "none",
                color: !isRunning && "rgba(0, 0, 0, 0.7)",
                cursor: "grab",
              }}
            >
              {formatTime()}
            </p>
            <p
              className="timer"
              style={{
                display: !hideTimer && "none",
                fontSize: "15px",
                fontWeight: "500",
                color: "white",
                cursor: "grab",
              }}
            >
              Start Recording
            </p>
          </div>
        </div>
      </div>
      {image && (
        <div
          style={{ display: "flex", padding: "5px", justifyContent: "center" }}
          className="image-container"
        >
          <img
            width={"320px"}
            height={"320px"}
            src={URL.createObjectURL(image)}
            style={{
              borderRadius: "12px",
              boxShadow: " 2px 0px 6px 1px rgba(128, 128, 128, 0.658)",
            }}
          />
          {/* <button onClick={handleRemove}>Remove</button> */}
          {/* <RiDeleteBack2Fill
            onClick={handleRemove}
            style={{ color: "red", fontSize: "22px" }}
          /> */}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* <input
          type="file"
          name="myImage"
          className="image_input"
          style={{
            color: image ? "green" : "red",
            alignItems: "center",
          }}
        /> */}

        <div
          style={{
            display: "flex",
            flex: 1,
            flexWrap: "wrap",
            justifyContent: "center",
            padding: "10px",
          }}
        >
          {content && !search && !typeResponse && allContent}
          {typeResponse && (
            <div>
              <h2
                style={{
                  margin: "10px",
                  border: "0.6px solid white",
                  boxShadow: " 2px 0px 6px 1px rgba(128, 128, 128, 0.658)",
                  cursor: "pointer",
                  padding: "10px",
                  color: "#32a007",
                  borderRadius: "5px",
                  paddingLeft: "15px",
                }}
              >
                Suggested Rice Leaf Disease
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {handleRes}
              </div>
            </div>
          )}
        </div>
        {/* {!content && (
          <div class="upload-btn-wrapper">
            <button class="btnChooseImage">
              Choose an Image To Identify Disease
            </button>
            <input
              type="file"
              name="myfile"
              accept="image/*"
              onChange={(event) => {
                handleUpload(event);
              }}
            />
          </div>
        )} */}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {image && !response && (
          <button onClick={fetchData} className="btnDataFetch">
            Identify Disease
          </button>
        )}
        {!typeResponse && response && image && (
          <div className="diseaseOutput">
            <p className="diseaseOutputText">{response[0]} Disease Detected</p>
            {/* <p className="diseaseOutputText">Accuracy: {response[1] * 100}%</p> */}

            <button onClick={fetchMoreImages} className="btnDataFetch">
              See more images of {response[0]} disease
            </button>
            <button onClick={fetchControlMeasures} className="btnDataFetch">
              Click here to know the control measures of {response[0]} disease
            </button>
          </div>
        )}
      </div>
      <div className="fetchOutput">
        <div
          style={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {controlMeasures &&
            controlMeasures?.map((item) => {
              return (
                <div className="controlMeasuresCard">
                  <p>{item}</p>
                </div>
              );
            })}
        </div>
        {moreImages?.map((item, index) => {
          if (index < 4) {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  padding: "10px",
                }}
              >
                <img className="moreImagesOutput" src={item.url} />
              </div>
            );
          }
        })}
        {!seeMore && moreImages && (
          <div style={{ width: "100%", textAlign: "center" }}>
            <button onClick={() => setSeeMore(true)} className="btnSeeMore">
              See more
            </button>
          </div>
        )}
        {seeMore &&
          moreImages?.map((item, index) => {
            if (index > 3) {
              return (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    padding: "10px",
                  }}
                >
                  <img className="moreImagesOutput" src={item.url} />
                </div>
              );
            }
          })}
      </div>
      <ToastContainer />
    </div>
  );
}

export default HomePage;
