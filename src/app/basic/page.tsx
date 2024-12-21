"use client";

import { useState } from "react";

const UploadForm = () => {
  const [file, setFile] = useState(null);
  const [img, setImg] = useState(null);

  const handleChange = (event) => {
    setFile(event.target.files[0]);
    setImg(URL.createObjectURL(event.target.files[0]));
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    alert(result.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" name="file" onChange={handleChange} />
      <button type="submit">Upload</button>
      {img && <img src={img} alt="Preview" />}
    </form>
  );
};

export default UploadForm;
