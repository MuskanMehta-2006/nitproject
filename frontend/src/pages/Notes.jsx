import React, { useEffect, useState } from "react";
import "./Notes.css";
import { fetchAPI } from "../api";

function Notes() {

  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  // LOAD NOTES
  useEffect(() => {

    const loadNotes = async () => {

      try {

        const data = await fetchAPI("/api/notes");

        setNotes(data);
        setAllNotes(data);

        const uniqueSubjects = [...new Set(data.map(n => n.subject))];
        setSubjects(uniqueSubjects);

      } catch (err) {

        console.error("Fetch notes error:", err);

      }

    };

    loadNotes();

  }, []);


  // FILTER

  const handleSubjectChange = (e) => {

    const value = e.target.value;

    setSelectedSubject(value);

    if (value === "") {

      setNotes(allNotes);

    } else {

      const filtered = allNotes.filter(n => n.subject === value);
      setNotes(filtered);

    }

  };


  // UPLOAD

  const handleUpload = async () => {

    if (!subject || !title || !file) {

      alert("Fill all fields");
      return;

    }

    const formData = new FormData();

    formData.append("subject", subject);
    formData.append("title", title);
    formData.append("pdf", file);

    try {

      const res = await fetchAPI("/api/notes/upload", {
        method: "POST",
        body: formData
      });

      alert(res.message);

      window.location.reload();

    } catch (err) {

      console.error("Upload error:", err);

    }

  };


  return (

    <div className="notes-page">

      {/* HEADER */}

      <div className="notes-header">

        <h1 className="notes-title">
          Notes Portal 📚
        </h1>

        <select
          value={selectedSubject}
          onChange={handleSubjectChange}
          className="notes-dropdown"
        >

          <option value="">
            Select Subject
          </option>

          {subjects.map((subject, index) => (

            <option
              key={index}
              value={subject}
            >
              {subject}
            </option>

          ))}

        </select>

      </div>


      {/* UPLOAD BOX */}

      <div className="upload-box">

        <h3>Upload Notes</h3>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Subject (ex: DSA, AI, ML)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleUpload}>
          Upload
        </button>

      </div>


      {/* NOTES LIST */}

      <div className="notes-container">

        {notes.length === 0 ? (

          <p className="notes-empty">
            No Notes Found 😢
          </p>

        ) : (

          notes.map(note => (

            <div
              key={note._id}
              className="notes-card"
            >

              <h3 className="notes-subject">
                {note.title}
              </h3>

              <p className="notes-info">
                Subject: {note.subject}
              </p>

              <a
                href={`https://nitproject-backend.onrender.com${note.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="notes-link"
              >
                View PDF
              </a>

            </div>

          ))

        )}

      </div>

    </div>

  );

}

export default Notes;