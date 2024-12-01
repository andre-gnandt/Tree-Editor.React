import React, { useState, useRef } from "react";
import { updateNode } from '../../src/api/nodes/nodesApi';

// Define a functional component named UploadAndDisplayImage
const UploadAndDisplayImage = (thumbnailUpload = false) => {
  // Define a state variable to store the selected image
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
const node = 
{
    id: "01587A75-805E-4D22-B772-06294EFBCB5B",
    data: 'Jakes from hench with files! 111',
    title: '0-2-1',
    level: 2,
    description: '3',
    number: 8,
    nodeId: '961D76A6-77CD-46C8-9E22-4FC9AB394BDC',
    thumbnailId: ('F14F3002-2C5B-4E3A-2453-08DCFFC3FF74').toLowerCase(),
    rankId: null,
    children: [],
    files: nodeFiles ? [...nodeFiles] : [],
    isDeleted: 0,
};



if(firstRender.current)
{ 
  firstRender.current = false;
  GetFilesByNodeId(node.id);
}

  function GetFilesByNodeId(id)
  {
    var value = null;
    fetch("https://treeeditor-private-old-hill-8065.fly.dev/api/Files/Get-Files-By-Node/"+id).then(res=> res.json()).then(
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
      isDeleted: 0
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
export default UploadAndDisplayImage;