import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setStateProperty } from "../nodes/nodeSlice";
import '../nodes/detailsList.css';
import 'primeicons/primeicons.css';

const UploadThumbnail = ({reset, fileChangeCallBack, inputNode}) => {
  const dispatch = useDispatch();
  const uploadName = useRef(null);
  const node = {...inputNode};
    node.files = inputNode.files? [...inputNode.files] : [];
  const nodeFiles = inputNode.files;

  const [selectedImage, setSelectedImage] = useState(null);
  const [defaultFile, setDefaultFile] = useState(inputNode.thumbnailId ? GetImageSource() : null);
  const reader = new FileReader();

  useEffect(() => {
    if(selectedImage)
    {
      reader.onload = GetFileData;
      reader.readAsArrayBuffer(selectedImage);
    }    
  }, [selectedImage]);

  useEffect(() => {
    setDefaultFile(inputNode.thumbnailId ? GetImageSource() : null);
    setSelectedImage(null);
  }, [reset]);

  function GetImageSource()
    {
        var index = nodeFiles.findIndex((object) => object.id.toLowerCase() === node.thumbnailId.toLowerCase());
        if(index != -1)
        {
            return nodeFiles[index];
        }

        var file = nodeFiles.find((object) => object.name === node.thumbnailId);
        return file;
    }

  const SetStateThumbnail = (value) => {
      dispatch(setStateProperty({key: 'thumbnailId', value: value}));
  }

  const SetStateFiles = (value) => {
    dispatch(setStateProperty({key: 'files', value: value}));
  }

  function GetFileData(event)
  { 
    if(selectedImage)
    {   
      const file = 
      {
        id: "00000000-0000-0000-0000-000000000000",
        nodeid: node.id,
        name: uploadName.current,
        size: String(selectedImage.size),
        type: selectedImage.type,
        data: Array.from(new Uint8Array(event.target.result, 0)),
        base64: URL.createObjectURL(selectedImage), // only used here to render image in tree without making any api calls (not base64 in this unique case)
        isDeleted: false
      };
          
      node['thumbnailId'] = uploadName.current;
      SetStateThumbnail(uploadName.current);

      //node.files.push(file);  --to be added back once file gallery is created
      node.files = [file]; //to be removed once file gallery is created
      SetStateFiles(node.files);
      fileChangeCallBack(true);
    }
  }

  function RemoveImage()
  {
    document.getElementById('file-upload-button').value = null;
    node.thumbnailId = null;
    SetStateThumbnail(null);
    setDefaultFile(null); 
    setSelectedImage(null);
    SetStateFiles([]); //to be removed when file gallery is created
      
    if(inputNode.thumbnailId) 
    {
      fileChangeCallBack(true);
    }
    else
    {
      fileChangeCallBack(false);
    }
  }

  function FitThumbnailImage(fitToContainer)
  {
    if(selectedImage || defaultFile)
    {
      if(fitToContainer) document.getElementById("thumbnail-expander").className = "thumbnail-expanded";
      if(!fitToContainer) document.getElementById("thumbnail-expander").className = "thumbnail-fit";
    }
  }

  return (
  <>
    <div id = 'thumbnail-uploader' style = {{height: '100%', width: '100%'}}>
        <div style = {{height: '33vh', width: '100%'}} className="title-container" onMouseOver={() => {FitThumbnailImage(false);}} onMouseOut = {() => {FitThumbnailImage(true);}}>
          { (selectedImage || defaultFile ) ? (
                <>
                  <div id = 'thumbnail-expander' className="thumbnail-expanded">
                    <img
                        alt="not found"
                        className = 'image'
                        src={selectedImage ? URL.createObjectURL(selectedImage) : defaultFile.base64 }
                    />
                  </div>
                </>
            )
            :
            (
              <>
                <div className = 'thumbnail-placeholder' onClick = {() => {document.getElementById('file-upload-button').click();}}>
                  <i className='pi pi-upload' style = {{position: 'relative', top: '8vh', fontSize: '11vh', height: '11vh', width: '11vh'}}/>
                  <div style = {{position: 'relative', top: '10vh'}}>
                    Upload Image!
                  </div>
                </div>
              </>
            )          
          }
        </div>
        <div >

            {(selectedImage || defaultFile) ? (
              <>
                <div className="text-overflow dialog-header" style = {{fontSize: '3vh', height: '5vh', width: '100%'}}>{selectedImage ? selectedImage.name : defaultFile.name}</div>
                <div style = {{height: '6vh', display: 'flex'}}>
                  <button className="button text-overflow" style = {{fontSize: '3vh', width: '16vh', height: '6vh', marginRight: '1vh'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
                  <button className="button text-overflow" style = {{fontSize: '3vh', width: '16vh', height: '6vh'}} onClick={() => {RemoveImage();}}>Remove</button>
                </div>
              </>
            ) : 
            (
              <>
                <div style = {{height: '4vh', width: '100%'}}></div>
                <button className="button text-overflow" style = {{fontSize: '3vh', width: '16vh', height: '6vh'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
              </>
            )}  

            <input
                type="file"
                id = 'file-upload-button'
                accept="image/png, image/gif, image/jpeg"
                style = {{visibility: 'hidden'}}
                onChange={(event) => 
                {
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
                    setSelectedImage(event.target.files[0]); 
                }}
            />
        </div>
    </div>
  </>
  );
};

export default UploadThumbnail;