import React, { useState, useEffect, useContext } from "react";
import "./HomePage.css";
import { UserContext } from "../UserContext";
import { card_disease } from "../Data/card_disease";
import axios from "axios";
import { storage } from "../firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { RiDeleteBack2Fill } from "react-icons/ri";
import { HiOutlineUserCircle } from "react-icons/hi";
import { IoMdLogOut } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";

function HomePage() {
  const [image, setImage] = useState(null);
  const [moreImages, setMoreImages] = useState(null);
  const [response, setResponse] = useState([]);
  const [typeResponse, setTypeResponse] = useState(null);
  const [seeMore, setSeeMore] = useState(false);
  const [content, setContent] = useState(true);

  const navigate = useNavigate();

  const { userCredentials, setUserCredentials } = useContext(UserContext);

  useEffect(() => {
    if (userCredentials.email == null) {
      // navigate("/");
    }
  });

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `http://127.0.0.1:8000/detect-image/${image.name}`
      );
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

  // const [remove, setRemove] = useState(true);
  // const handleRemove = () => {
  //   setRemove(false);
  // };

  // const [imageUpload, setImageUpload] = useState(null);

  const [search, setSearch] = useState("");

  const handleTypeDetection = async (e) => {
    setSearch(e.target.value);
    try {
      if (search != "" || search != null) {
        setTimeout(async () => {
          const { data } = await axios.get(
            `http://127.0.0.1:8000/detect-symptomps/${search.trim()}`
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
            }}
            onClick={() => {
              setResponse(card_disease[j].id);
              fetchMoreImages(card_disease[j].id);
            }}
          >
            <CardMedia
              sx={{ height: 200 }}
              image={card_disease[j].image}
              title="green iguana"
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
        }}
      >
        <CardMedia
          sx={{ height: 200 }}
          image={item.image}
          title="green iguana"
        />
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
          src="\leaf.png"
          alt="Leaf"
          onClick={() => window.location.reload(false)}
        />
        <p
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: "green",
            cursor: "pointer",
          }}
          onClick={() => window.location.reload(false)}
        >
          Rice Leaf Disease Detection{" "}
        </p>
        <div
          style={{ alignItems: "center", textAlign: "center" }}
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
      <div style={{ alignContent: "center", textAlign: "center" }}>
        <TextField
          id="outlined-basic"
          label="Type here to identify disease"
          variant="outlined"
          style={{
            backgroundColor: "rgba(0, 255, 0, 0.2)",
            width: 500,
          }}
          value={search}
          onChange={(e) => handleTypeDetection(e)}
        />
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
        {/* <p>{search}</p>
        {search && (
          <p>
            {typeResponse?.sim[0]}, {typeResponse?.sim[1]}
          </p>
        )} */}
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
          {content && !search && allContent}
          {typeResponse && search && handleRes}
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
            {
              <button onClick={fetchMoreImages} className="btnDataFetch">
                See more images of {response[0]} disease
              </button>
            }
          </div>
        )}
      </div>
      <div className="fetchOutput">
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
