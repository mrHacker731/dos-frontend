import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import io from "socket.io-client";
import { useParams } from "react-router-dom";


const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],
  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],
  ['link', 'image'],  

  ["clean"], // remove formatting button
];

function Editor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();



  useEffect(() => {
    const s = io("https://mk-docs.onrender.com", {
      transports: ["websocket"], // Required when using Vite
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [setSocket]);

  //get all chnges done in text ediotor
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);


  //broadcast to all realtime changes
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("recive-changes", handler);

    return () => {
      socket.off("recive-changes", handler);
    };
  }, [socket, quill]);

  //save data to database
  useEffect(()=>{
  if(socket == null || quill == null) return;

  const interval = setInterval(()=>{
  socket.emit("save-document",quill.getContents());
  },1000);

  return () =>{
    clearInterval(interval);
  }
  },[socket,quill]);

  const wrapperRef = useCallback(
    (wrapper) => {
      if (wrapper == null) {
        return;
      }
      wrapperRef.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: toolbarOptions,
        },
      });
      q.disable();
      q.setText("Loading...");
      setQuill(q);
    },
    [setQuill]
  );

    //create room for socket connection
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.on('load-document',(data) => {
      quill.setContents(data);
      quill.enable();
    });

    socket.emit('get-document',documentId);

  }, [socket, quill, documentId]);

  return (
  <>
  <div className="container" ref={wrapperRef}>
  </div>
  
  </>
  );
}

export default Editor;
