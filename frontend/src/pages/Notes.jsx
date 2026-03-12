import React, { useEffect, useState } from "react";
import "./Notes.css";

function Notes() {

  const [notes, setNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  // Load notes
  useEffect(() => {
    fetch("http://localhost:5000/api/notes")
      .then(res => res.json())
      .then(data => {

        setNotes(data);
        setAllNotes(data);

        const uniqueSubjects = [...new Set(data.map(n => n.subject))];
        setSubjects(uniqueSubjects);

      });
  }, []);

  // Filter
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

  // Upload
  const handleUpload = async () => {

    if (!subject || !title || !file) {
      alert("Fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("title", title);
    formData.append("pdf", file);

    const res = await fetch("http://localhost:5000/api/notes/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    alert(data.message);
    window.location.reload();
  };

  return (

    <div className="notes-page">

      {/* Header */}
      <div className="notes-header">

        <h1 className="notes-title">Notes Portal 📚</h1>

        <select
          value={selectedSubject}
          onChange={handleSubjectChange}
          className="notes-dropdown"
        >
          <option value="">Select Subject</option>

          {subjects.map((subject, index) => (
            <option key={index} value={subject}>
              {subject}
            </option>
          ))}

        </select>

      </div>


      {/* Upload Box */}

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


      {/* Notes List */}

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
                href={`http://localhost:5000${note.fileUrl}`}
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