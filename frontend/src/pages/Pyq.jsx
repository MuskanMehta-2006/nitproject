import React, { useEffect, useState } from "react";

function App() {

  const [allPapers, setAllPapers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [subject, setSubject] = useState("");
  const [examType, setExamType] = useState("");
  const [dept, setDept] = useState("");
  const [subCode, setSubCode] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {

    fetch("http://localhost:5000/api/pyqs")
      .then(res => res.json())
      .then(data => {

        setAllPapers(data);
        setPapers(data);

        const uniqueSubjects = [...new Set(data.map(p => p.subName))];
        setSubjects(uniqueSubjects);

      });

  }, []);

  const handleSubjectChange = (e) => {

    const value = e.target.value;
    setSelectedSubject(value);

    if (value === "") {
      setPapers(allPapers);
    } else {
      const filtered = allPapers.filter(p => p.subName === value);
      setPapers(filtered);
    }

  };

  const handleUpload = async () => {

    if (!subject || !examType || !year) {
      alert("Please fill all fields");
      return;
    }

    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("examType", examType);
    formData.append("year", year);
    formData.append("dept", dept);
    formData.append("subCode", subCode);
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:5000/api/pyqs/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.message || "Uploaded Successfully");

      setShowModal(false);
      window.location.reload();

    } catch (err) {
      console.log(err);
      alert("Upload failed");
    }
  };
  return (

    <div style={{
      fontFamily: "Arial",
      minHeight: "100vh",
      background: "#f5f5f5",
      marginTop: "-40px"
    }}>
      {/* Header Row */}

      {/* Heading */}
      <h1 style={{
        textAlign: "center",
        marginTop: "40px",
        marginBottom: "30px"
      }}>
        PYQS Portal 📚
      </h1>

      {/* Header Row */}

      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <select
          value={selectedSubject}
          onChange={handleSubjectChange}
          style={{
            padding: "10px",
            fontSize: "16px",
            width: "300px"
          }}
        >

          <option value="">Select Subject</option>

          {subjects.map((subject, index) => (
            <option key={index}>{subject}</option>
          ))}

        </select>

        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Upload PYQ
        </button>

      </div>


      {/* Papers */}

      <div style={{
        maxWidth: "700px",
        margin: "20px auto"
      }}>

        {papers.map(paper => (
          <div
            key={paper._id}
            style={{
              background: "white",
              padding: "20px",
              marginBottom: "15px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >

            <h3>
              {paper.subName} - {paper.dept} ({paper.subCode})
            </h3>

            <p style={{ color: "#555" }}>
              {paper.examType} - {paper.year}
            </p>

            <a
              href={`http://localhost:5000${paper.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#007bff",
                fontWeight: "bold",
                textDecoration: "none"
              }}
            >
              View PDF
            </a>

          </div>
        ))}

      </div>


      {/* Popup Modal */}

      {showModal && (

        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}>

          <div style={{
            background: "white",
            padding: "30px",
            borderRadius: "10px",
            width: "350px"
          }}>

            <h3>Upload PYQ</h3>

            <input
              placeholder="Subject"
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              placeholder="Exam Type"
              onChange={(e) => setExamType(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              placeholder="Year"
              onChange={(e) => setYear(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <input
              placeholder="Department"
              onChange={(e) => setDept(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />

            <input
              placeholder="Subject Code"
              onChange={(e) => setSubCode(e.target.value)}
              style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ marginBottom: "15px" }}
            />
            <button
              onClick={handleUpload}
              style={{
                padding: "8px 20px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Upload
            </button>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginLeft: "10px",
                padding: "8px 20px"
              }}
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );

}

export default App;