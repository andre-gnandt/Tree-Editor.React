import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setStateProperty } from "../nodes/nodeSlice";
import '../nodes/DetailsList.css';
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
        <div style = {{height: '75%', width: '100%'}} className="title-container" onMouseOver={() => {FitThumbnailImage(false);}} onMouseOut = {() => {FitThumbnailImage(true);}}>
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
                <div className = 'thumbnail-placeholder' /*style = {{fontSize: mobile ? '3vw' : '3vh'}}*/  onClick = {() => {document.getElementById('file-upload-button').click();}}>           
                  <div className="empty-thumbnail-container" >
                    <i className='pi pi-upload thumbnail-icon' /*style = {{ position: 'relative',  fontSize: 'min(5rem, 14vw)'}} /*style = {{position: 'relative', top: '50%', fontSize: '5rem', height: '11vh', width: '11vh'}} *//>   
                  </div>
                  <div className="upload-thumbnail">
                    Upload Image!
                  </div> 
                </div>
              </>
            )          
          }
        </div>
        <div style = {{height: '25%', width: '100%'}}>
            {/*9.9vw under image, width is 29.7 vw*/}
            {(selectedImage || defaultFile) ? (
              <>              
                <div className="text-overflow dialog-header thumbnail-title">{selectedImage ? selectedImage.name : defaultFile.name}</div>
                <div className="thumbnail-buttons-container" >
                  <button className="button thumbnail-button" style = {{marginRight: '4%'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
                  <button className="button thumbnail-button" onClick={() => {RemoveImage();}}>Remove</button>
                </div>
              </>
            ) : 
            (
              <>
                <div className="text-overflow dialog-header thumbnail-title">No Thumbnail</div>
                <button className="button thumbnail-button" style = {{height: '50%'}} onClick={() => { document.getElementById('file-upload-button').click()}}>+Upload</button>
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