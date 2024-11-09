import React, { useState, useRef } from "react";
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';

// Define a functional component named UploadAndDisplayImage
const UploadFile = (props) => {
  // Define a state variable to store the selected image
  const thumbnailUpload = 'thumbnailUpload' in props ? props.thumbnailUpload : null;
  const node = props.node;
  const firstRender = useRef(true);
  const uploadName = useRef(null);
  const [defaultFile, setDefaultFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [nodeFiles, setNodeFiles] = useState(null);
  const reader = new FileReader();

  const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    type: 'PUT',
    body: ""
}

node.files = nodeFiles? [...nodeFiles] : [];



if(firstRender.current)
{ 
  firstRender.current = false;
  GetFilesByNodeId(node.id);
}

  function GetFilesByNodeId(id)
  {
    var value = null;
    fetch("http://localhost:11727/api/Files/Get-Files-By-Node/"+id).then(res=> res.json()).then(
        result => {
          value = result;
          setDefaultFile(node.thumbnailId ? value.find((object) => object.id === node.thumbnailId) : null);
          setNodeFiles(value);
        }
    );
  }

  if(selectedImage)
  {
    console.log(selectedImage);
    console.log(uploadName.current);
    reader.onload = GetFileData;
    reader.readAsArrayBuffer(selectedImage);
  }

  function GetFileData(event)
  {    
    const file = 
    {
      id: "00000000-0000-0000-0000-000000000000",
      nodeid: node.id,
      name: selectedImage.name,
      size: String(selectedImage.size),
      type: selectedImage.type,
      data: Array.from(new Uint8Array(event.target.result, 0)),
      isDeleted: false
    };
    if(thumbnailUpload) node['thumbnailId'] = selectedImage.name;
    node.files.push(file);

    console.log()
    //updateNode(node.id, node);
  }

  function RemoveSelectedImage()
  {
    if(selectedImage)
      {
        var index = node.files.findIndex((file) => file.name === selectedImage.name);
        if(index > -1) node.files.splice(index,1);
      }
  }

  function RemoveImage()
  {
    setDefaultFile(null); 
    setSelectedImage(null);
  }

  // Return the JSX for rendering
  return (
    <div>
      {/* Header */}
      <h1>Upload and Display Image</h1>
      <h3>using React Hooks</h3>

      {/* Conditionally render the selected image if it exists */}
      {(selectedImage || defaultFile )&& (
        <>
        <div>
       
          {/* Display the selected image */}
          <img
            alt="not found"
            width={"250px"}
            src={selectedImage ? URL.createObjectURL(selectedImage) : defaultFile.base64}
          />
          
          <br /> <br />
          
          {/* Button to remove the selected image */}
          <div>{selectedImage ? selectedImage.name : defaultFile.name}</div>
          <button onClick={() => {RemoveImage();}}>Remove</button>
          <button onClick={() => updateNode(node.id, node)}>Update Node</button>
          
        </div>
        </>
      )}

      <br />

      {/* Input element to select an image file */}
      <input
        type="file"
        name="myImage"
        // Event handler to capture file selection and update the state
        onChange={(event) => {// Log the selected file
          var fileName = event.target.files[0].name;
          var originalName = fileName;
          var matchingIndex = -2
          var i = 0

          while(matchingIndex !== -1)
          {
            if(matchingIndex > -1)
            {
              fileName = originalName+"-"+String(i);
            }
            matchingIndex = node.files.findIndex((object) => object.name == fileName);
            i++;
          }

          uploadName.current = fileName;
          setSelectedImage(event.target.files[0]); // Update the state with the selected file
        }}
      />
    </div>
  );
};

// Export the UploadAndDisplayImage component as default
export default UploadFile;