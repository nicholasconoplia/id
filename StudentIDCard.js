import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const StudentIDCard = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    firstName: '',
    lastName: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [initialMousePosition, setInitialMousePosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const scaleFactor = 0.2;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    setDragging(true);
    setInitialMousePosition({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move
  const handleMouseMove = (e) => {
    if (dragging) {
      const deltaX = e.clientX - initialMousePosition.x;
      const deltaY = e.clientY - initialMousePosition.y;

      setDragPosition(prevPosition => ({
        x: prevPosition.x + deltaX,
        y: prevPosition.y + deltaY
      }));

      setInitialMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setDragging(false);
  };

  // Handle zoom for the image
  const handleZoom = (e) => {
    setZoom(prevZoom => Math.min(Math.max(prevZoom + e.deltaY * -0.001, 0.5), 3));
  };

  const handleDownload = () => {
    const cardElement = document.getElementById('id-card');

    html2canvas(cardElement, {
      useCORS: true,
      scale: 3,
      width: 2423,
      height: 3860,
    }).then((canvas) => {
      // Crop to the top left 1456x2314 pixels
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = 1456;
      croppedCanvas.height = 2314;

      const ctx = croppedCanvas.getContext('2d');
      ctx.drawImage(canvas, 0, 0, 1456, 2314, 0, 0, 1456, 2314);

      const link = document.createElement('a');
      link.href = croppedCanvas.toDataURL('image/png');
      link.download = 'student-id-card.png';
      link.click();
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '20px' }}>Student ID Card Generator</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Student ID</label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter student ID"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Profile Photo</label>
            <input
              type="file"
              onChange={handleImageUpload}
              accept="image/*"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
        </div>
        <button onClick={handleDownload} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '5px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Download ID Card
        </button>
      </div>

      <div 
        id="id-card"
        style={{ 
          position: 'relative',
          width: '2423px',
          height: '3860px',
          margin: '0 auto',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflow: 'hidden',
          backgroundColor: 'white',
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top center'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves the area
      >
        <img
          src="https://i.imgur.com/0TyS3Xu.jpeg"
          alt="ID Card Template"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        <div 
          style={{
            position: 'absolute',
            left: '1272px',
            top: '207px',
            width: '1049px',
            height: '1393px',
            overflow: 'hidden',
            border: profileImage ? 'none' : '2px dashed #ccc',
            cursor: 'move', // Add cursor style for dragging
          }}
          onDragOver={(e) => e.preventDefault()} // Prevent default to allow drop
        >
          {profileImage && (
            <div
              onMouseDown={handleMouseDown}
              onWheel={handleZoom}
              style={{
                transform: `translate(${dragPosition.x}px, ${dragPosition.y}px) scale(${zoom})`,
                cursor: 'move', // Cursor indicates dragging
                width: '100%', // Ensure the image container takes full width
                height: '100%', // Ensure the image container takes full height
              }}
            >
              <img
                src={profileImage}
                alt="Profile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
        </div>

        <div style={{
          position: 'absolute',
          left: '100px',
          bottom: '1320px',
          fontWeight: 'bold',
          fontFamily: 'Helvetica',
        }}>
          <div style={{ fontSize: '170px' }}>{formData.studentId}</div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '100px',
            bottom: '400px',
            fontFamily: 'NB Akademie Std',
          }}
        >
          <div style={{ fontSize: '120px', marginBottom: '300px' }}>{formData.firstName}</div>
          <div style={{ fontSize: '120px', fontWeight: 'extra-bold' }}>{formData.lastName}</div>
        </div>
      </div>
    </div>
  );
};



export default StudentIDCard;
