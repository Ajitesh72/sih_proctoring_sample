import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useHistory from react-router-dom

const VideoCapture = () => {
  const videoRef = useRef(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [imageEntered, setImageEntered] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const navigate = useNavigate(); // Get the history object

  const sendVideoFrames = async (frameData) => {
    try {
      const serverURL = "http://127.0.0.1:8000";
      const res = await axios.post(`${serverURL}/video/proctor/`, frameData);
      console.log("hii");
      console.log(res.data);
    } catch (error) {
      console.error("Error sending video frames:", error);
    }
  };

  const handlePaste = (e) => {
    alert("PLEASE DO NOT CHEAT, WE ARE MONITORING YOU!!");
    e.preventDefault();
  };

  useEffect(() => {
    if (imageEntered) {
      const startVideoCapture = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.error("Error accessing webcam:", error);
        }
      };

      const captureAndSendFrames = () => {
        const canvas = document.createElement("canvas");
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          sendVideoFrames(blob);
        }, "image/jpeg");
      };

      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          setTabSwitchCount((count) => count + 1);
        }
      });

      startVideoCapture();

      const frameCaptureInterval = setInterval(() => {
        captureAndSendFrames();
      }, 3000);

      return () => {
        if (videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        clearInterval(frameCaptureInterval);
      };
    }
  }, [imageEntered]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImageEntered(true);
    }
  };

  const handleFinish = () => {
    // Fetch cheating images or perform any other necessary actions
    setShowFinishButton(false);
    history.push("/Cheating"); // Navigate to the "/Cheating" route
  };

  
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white w-full max-w-xl p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-4 text-blue-500">
          DEMO PROCTORED APPLICATION
        </h1>
        <p className="text-lg text-gray-600">Tab switch count: {tabSwitchCount}</p>
        {imageEntered ? (
          <div className="mt-4">
            <video className="w-full" ref={videoRef} autoPlay={true} />
            <div className="mt-4">
              <p className="text-lg">
                Q. const numbers = [1, 2, 3, 4, 5, 6];
                <br />
                const sum = sumEvenNumbers(numbers);
                <br />
                console.log(sum);
                <br />
                What is the output?
              </p>
              <input
                type="text"
                onPaste={handlePaste}
                placeholder="No pasting allowed"
                className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none"
              />
              <div className="bg-black text-white text-center mt-4 py-2 rounded-full cursor-pointer hover:bg-blue-500" onClick={()=>{navigate("/cheating")}}>
                SUBMIT
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <label className="text-lg text-gray-600 block mb-2">
              Enter your updated image to start the test:
            </label>
            <input
              type="file"
              onChange={handleImageSelect}
              accept="image/*"
              className="w-full p-2 border border-gray-400 rounded-lg focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCapture;
