import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateNode } from '/LocalTreeData.React/src/api/nodes/nodesApi';
import { setStateProperty } from "../nodes/nodeSlice";
import '../nodes/detailsList.css';

// Define a functional component named UploadAndDisplayImage
const UploadFile = (props) => {
  // Define a state variable to store the selected image
  const stateNode = useSelector(state => state.node);
  const dispatch = useDispatch();
  const thumbnailUpload =  true;
  const node = {...props.node};
  const create = props.create;
  const fileChangeCallBack = props.fileChangeCallBack;
  const firstRender = useRef(true);
  const uploadName = useRef(null);
  const newUpload = useRef(false);
  const [defaultFile, setDefaultFile] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [nodeFiles, setNodeFiles] = useState(null);
  const reader = new FileReader();

  console.log("RE RENDER");

  const SetStateFiles = (value) => {
    firstRender.current = false;
    dispatch(setStateProperty({key: 'files', value: value}));
  }

  if(firstRender.current)
    { 
      firstRender.current = false;
      SetStateFiles(node.files);
      if(!create) GetFilesByNodeId(node.id);
    }


node.files = nodeFiles? [...nodeFiles] : [];

const SetStateThumbnail = (value) => {
    firstRender.current = false;
    dispatch(setStateProperty({key: 'thumbnailId', value: value}));
}

  function GetFilesByNodeId(id)
  {
    var value = null;
    fetch("http://localhost:11727/api/Files/Get-Files-By-Node/"+id).then(res=> res.json()).then(
        result => {
          value = result;
          setDefaultFile(node.thumbnailId ? value.find((object) => object.id.toLowerCase() === node.thumbnailId.toLowerCase()) : null);
          setNodeFiles(value);
          SetStateFiles(value);
        }
    );
  }

  if(selectedImage && newUpload.current)
  {
    newUpload.current = false;
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
      name: uploadName.current,
      size: String(selectedImage.size),
      type: selectedImage.type,
      data: Array.from(new Uint8Array(event.target.result, 0)),
      isDeleted: false
    };
    if(thumbnailUpload)
    {
         node['thumbnailId'] = uploadName.current;
         SetStateThumbnail(uploadName.current);
    }

    node.files.push(file);
    SetStateFiles(node.files);
    fileChangeCallBack();
  }

  function RemoveImage()
  {
    node.thumbnailId = null;
    SetStateThumbnail(null);
    setDefaultFile(null); 
    setSelectedImage(null);
    fileChangeCallBack();
  }

  // Return the JSX for rendering
  return (
  <>
    <div style = {{height: '100%', width: '100%'}}>
        <div style = {{height: '33vh', width: '100%'}}>
            {(selectedImage || defaultFile )&& (
                <>
                <div>
            
                    {/* Display the selected image */}
                    <img
                        alt="not found"
                        className = 'image'
                        src={selectedImage ? URL.createObjectURL(selectedImage) : defaultFile.base64}
                    />
                    
                    <br /> <br />
                    
                    {/* Button to remove the selected image */}
                    <div>{selectedImage ? selectedImage.name : defaultFile.name}</div>
                    <button onClick={() => {RemoveImage();}}>Remove</button>
                </div>
                </>
            )}
        </div>
        <div>
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
            newUpload.current = true;
            setSelectedImage(event.target.files[0]); // Update the state with the selected file
            }}
        />
        </div>
    </div>
  </>
  );
};

// Export the UploadAndDisplayImage component as default
export default UploadFile;