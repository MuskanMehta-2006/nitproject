import React, { useEffect, useState } from "react";
import { fetchAPI } from "../api";

function LostFoundRoom() {

  const [items, setItems] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const [formData, setFormData] = useState({
    type: "lost",
    itemName: "",
    description: "",
    contact: "",
    email: "",
    photo: null
  });

  const fetchItems = async () => {
    try {

      const data = await fetchAPI("/api/lostfound");

      setItems(data.reverse());

    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {

    if (e.target.name === "photo") {

      setFormData({
        ...formData,
        photo: e.target.files[0]
      });

    } else {

      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!formData.email.endsWith("@nitkkr.ac.in")) {
      alert("Only NIT KKR email allowed!");
      return;
    }

    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    try {

      await fetchAPI("/api/lostfound", {
        method: "POST",
        body: data
      });

      alert("Item added successfully! 🔥");

      setFormData({
        type: "lost",
        itemName: "",
        description: "",
        contact: "",
        email: "",
        photo: null
      });

      fetchItems();

    } catch (err) {

      console.error("Add error:", err);

    }

  };

  const updateStatus = async (id) => {

    const userEmail = prompt("Enter your NIT email to confirm:");

    if (!userEmail) return;

    if (!userEmail.endsWith("@nitkkr.ac.in")) {

      alert("Only NIT email allowed!");
      return;

    }

    try {

      const data = await fetchAPI(`/api/lostfound/${id}/claim`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail })
      });

      if (data.message) {

        alert(data.message);

      }

      fetchItems();

    } catch (err) {

      console.error("Status update error:", err);

    }

  };

  const filteredItems = items
    .filter((item) => (typeFilter ? item.type === typeFilter : true))
    .filter((item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) =>
      showActiveOnly ? item.status !== "claimed" : true
    );

  return (

    <div style={{ fontFamily: "Arial", padding: "40px", background: "#f5f5f5" }}>

      <h1 style={{ textAlign: "center" }}>Lost & Found Room 🕵️‍♀️</h1>

      {/* FORM */}

      <div style={{ maxWidth: "600px", margin: "30px auto", background: "white", padding: "20px", borderRadius: "10px" }}>

        <h3>Add Lost / Found Item</h3>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <input
            name="itemName"
            placeholder="Item Name"
            value={formData.itemName}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
          />

          <input
            name="contact"
            placeholder="Contact Info"
            value={formData.contact}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Your NIT Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="file"
            name="photo"
            onChange={handleChange}
          />

          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Add Item
          </button>

        </form>

      </div>

      {/* FILTERS */}

      <div style={{ maxWidth: "600px", margin: "0 auto 20px", display: "flex", gap: "10px" }}>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <input
          placeholder="Search by Item Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />

        <button onClick={() => setShowActiveOnly(!showActiveOnly)}>
          {showActiveOnly ? "Show All" : "Only Active"}
        </button>

      </div>

      {/* ITEMS */}

      <div style={{ maxWidth: "600px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "15px" }}>

        {filteredItems.map((item) => (

          <div key={item._id} style={{ background: "white", padding: "15px", borderRadius: "10px" }}>

            <h3>
              {item.itemName} ({item.type.toUpperCase()})
            </h3>

            {item.description && <p>{item.description}</p>}

            <p>
              <b>Contact:</b> {item.contact}
            </p>

            <p>
              <b>Status:</b>{" "}
              {item.type === "lost"
                ? item.status === "claimed"
                  ? "✅ Returned"
                  : "🔎 Searching"
                : item.status === "claimed"
                  ? "✅ Claimed"
                  : "📦 Available"}
            </p>

            {item.status !== "claimed" && (

              <button
                onClick={() => updateStatus(item._id)}
                style={{
                  padding: "6px 12px",
                  background: "green",
                  color: "white",
                  border: "none",
                  borderRadius: "5px"
                }}
              >
                {item.type === "lost"
                  ? "Mark as Returned"
                  : "Mark as Claimed"}
              </button>

            )}

            {item.photoUrl && (

              <img
                src={`https://nitproject-backend.onrender.com${item.photoUrl}`}
                alt={item.itemName}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  borderRadius: "8px",
                  height: "600px"
                }}
              />

            )}

          </div>

        ))}

      </div>

    </div>

  );

}

export default LostFoundRoom;