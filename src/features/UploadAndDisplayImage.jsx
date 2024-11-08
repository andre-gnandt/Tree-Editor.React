import React, { useState } from "react";

// Define a functional component named UploadAndDisplayImage
const UploadAndDisplayImage = () => {
  // Define a state variable to store the selected image
  const [selectedImage, setSelectedImage] = useState(null);
  const reader = new FileReader();

  const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    type: 'PUT',
    body: ""
}

  function GetBase64Test(target){
    let value = null;
    console.log(target.result);
    var array = Array.from(new Uint8Array(target.result, 0));
    console.log(array);
    putOptions.body = JSON.stringify({image: array, stringVar: "Test"});
    fetch("http://localhost:11727/api/Nodes/ImageTest/3cae81d4-8e70-484c-92cc-04cf0eb471df", putOptions).then(res=> res.json()).then(
        result => {
          value = result;
        }
    )
    return value;
};

  if(selectedImage)
  {
    console.log(selectedImage);
    reader.onload = printData;
    reader.readAsArrayBuffer(selectedImage);
  }

  function printData(event)
  {
    console.log("Calling Api");
    var result = GetBase64Test(event.target);
    console.log(result);
  }

  // Return the JSX for rendering
  return (
    <div>
      {/* Header */}
      <h1>Upload and Display Image</h1>
      <h3>using React Hooks</h3>

      {/* Conditionally render the selected image if it exists */}
      {selectedImage && (
        <div>
          {/* Display the selected image */}
          <img
            alt="not found"
            width={"250px"}
            src={URL.createObjectURL(selectedImage)}
            onClick={(event) => {console.log(event.target)}}
          />
          <br /> <br />
          {/* Button to remove the selected image */}
          <button onClick={() => setSelectedImage(null)}>Remove</button>
        </div>
      )}

      <br />

      {/* Input element to select an image file */}
      <input
        type="file"
        name="myImage"
        // Event handler to capture file selection and update the state
        onChange={(event) => {
          console.log(event.target.files[0]); // Log the selected file
          setSelectedImage(event.target.files[0]); // Update the state with the selected file
        }}
      />
    </div>
  );
};

// Export the UploadAndDisplayImage component as default
export default UploadAndDisplayImage;