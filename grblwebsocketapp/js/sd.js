$(document).ready(function() {
  var fileOpen = document.getElementById('file');
  if (fileOpen) {
    fileOpen.addEventListener('change', uploadFile, false);
  }
});

// File upload function
function uploadFile() {
  const file = fileInput.files[0]; // Ensure this references the correct file input
  if (file) {
    const ip = ipAddressInput.value.trim();
    const timestamp = Date.now();
    const url = `http://${ip}/sdfiles?t=${timestamp}`;

    const formData = new FormData();
    formData.append("file", file);

    // Use fetch API to POST the file
    fetch(url, {
        method: "POST",
        body: formData
      })
      .then(response => {
        if (response.ok) {
          logMessage("File uploaded successfully!");
          fetchFileList();
        } else {
          logMessage("File upload failed: " + response.statusText);
          fetchFileList();
        }
      })
      .catch(error => {
        logMessage("Error uploading file: " + error);
        fetchFileList();
      });
  } else {
    logMessage("No file selected for upload.");
    fetchFileList();
  }
}