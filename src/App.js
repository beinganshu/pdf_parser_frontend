import React, { useState } from "react";
import "./App.css";

const PDFQuerySystem = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [query, setQuery] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [file, setFile] = useState(null); // Store selected file
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      alert("Please select a file!");
      return;
    }
    setFile(selectedFile);
    setUploadMessage(`Selected file: ${selectedFile.name}`);
    console.log(`Selected file: ${selectedFile.name}`);
  };

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading!");
      return;
    }

    setIsLoading(true); // Start loading spinner

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://anxhu2004-pdf-parser.hf.space/upload/",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      console.log("Upload Response:", data); // Log the response

      // Check if the response is successful and upload message is available
      if (data["upload-message"]) {
        setUploadMessage(data["upload-message"]);
        setUploadedFile(file.name);
        setSessionActive(true); // Switch to the query page on successful upload
        console.log("Session active: ", true); // Log session active status
      } else if (data.error) {
        alert("Error uploading file: " + data.error);
      }
    } catch (error) {
      alert("Error uploading file");
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false); // Stop loading spinner
    }
  };

  const handleSubmitQuery = async () => {
    if (query.trim() === "") {
      alert("Please enter a query.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://anxhu2004-pdf-parser.hf.space/query/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ query }),
        }
      );

      const data = await response.json();
      if (data.response) {
        setResponseMessage(data.response);
      } else if (data.error) {
        alert(data.error);
      }
      setIsLoading(false);
    } catch (error) {
      alert("Error querying the file");
      console.error("Error querying the file:", error);
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await fetch(
        "https://anxhu2004-pdf-parser.hf.space/query/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({ query: "quit" }),
        }
      );

      const data = await response.json();
      if (data.message) {
        setUploadMessage("Session ended and model deleted.");
        setSessionActive(false);
        setResponseMessage("");
        setQuery("");
        setUploadedFile(null);
      }
    } catch (error) {
      alert("Error ending session");
      console.error("Error ending session:", error);
    }
  };

  console.log("Session Active: ", sessionActive); // Check the sessionActive status

  return (
    <div className="container">
      <h1 className="header">PDF Query System</h1>

      {sessionActive ? (
        // Query Section - Display only if session is active
        <div id="query-section" className="query-section">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your question..."
            className="query-input"
          ></textarea>
          <div className="button-group">
            <button
              onClick={handleSubmitQuery}
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? "Fetching Answer..." : "Submit Query"}
            </button>
            {isLoading && <div className="loader"></div>}{" "}
            <button onClick={handleEndSession} className="end-button">
              End Session
            </button>
          </div>
          <p className="response-message">{responseMessage}</p>
        </div>
      ) : (
        // Upload Section - Display only if session is not active
        <div id="upload-section" className="upload-section">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="file-input"
          />
          <button
            onClick={handleFileUpload}
            className="upload-button"
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload File"}
          </button>
          {isLoading && <div className="loader"></div>}{" "}
          {/* Show loading spinner */}
          <p className="upload-message">{uploadMessage}</p>
        </div>
      )}
    </div>
  );
};

export default PDFQuerySystem;
