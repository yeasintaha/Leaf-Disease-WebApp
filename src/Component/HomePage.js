import React, { useState } from "react";
import "./HomePage.css";
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

function HomePage() {
  const [image, setImage] = useState(null);
  const [moreImages, setMoreImages] = useState(null);
  const [response, setResponse] = useState([]);
  const [seeMore, setSeeMore] = useState(false);
  const navigate = useNavigate();

  // const storageRef = firebase.storage().ref();
  // const imagesRef = storageRef.child("images");

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `http://127.0.0.1:8000/detect-image/${image.name}`
      );
      // alert(data.message);
      setResponse(data);
      console.log(data);
    } catch (err) {
      alert("Server Error, Please Reload Page And Upload It Again!!!");
    }
  };

  const fetchMoreImages = () => {
    setMoreImages(null);
    setSeeMore(false);
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
  const handleUpload = async (event) => {
    setResponse(null);
    // setRemove(true);
    setMoreImages(null);
    try {
      setImage(event.target.files[0]);
      const imageRef = ref(storage, "Images/" + `${image.name}`);
      uploadBytes(imageRef, image).then(() => {});
    } catch (e) {
      // alert(e);
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
          }}
          src="\leaf.png"
          alt="Leaf"
        />
        {/* <p>Leaf Disease Detection </p> */}
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
      {image && (
        <div
          style={{ display: "flex", padding: "5px", justifyContent: "center" }}
          className="image-container"
        >
          <img
            width={"250px"}
            height={"250px"}
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
        <div class="upload-btn-wrapper">
          <button class="btnChooseImage">Choose an image</button>
          <input
            type="file"
            name="myfile"
            accept="image/*"
            onChange={(event) => {
              handleUpload(event);
            }}
          />
        </div>
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
            Detect Disease
          </button>
        )}
        {response && image && (
          <div className="diseaseOutput">
            <p className="diseaseOutputText">{response[0]} Disease Detected</p>
            {/* <p className="diseaseOutputText">Accuracy: {response[1]*100}%</p> */}
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
