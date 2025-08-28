const promptInput = document.querySelector("#prompt");
const chatContainer = document.querySelector(".chat-container");
const imageInput = document.querySelector("#imageInput");
const imageBtn = document.querySelector("#imageBtn");
const voiceBtn = document.querySelector("#voiceBtn");
const submitBtn = document.querySelector("#submit");

const API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = "AIzaSyAH4YISmms0bMgi7bvcoleiQ1qMcAxQVFY"; // my api key

// ----------------- Generate AI Response -----------------
async function generateResponse(aiChatBox, userText) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: userText,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY, // key header में भेज रहे हैं
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    const aiText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from AI.";

    aiChatBox.querySelector(".ai-chat-area").innerText = aiText;

    // Voice output
    speakText(aiText);
  } catch (error) {
    aiChatBox.querySelector(".ai-chat-area").innerText =
      "Error: " + error.message;
    console.error("Fetch Error:", error);
  }
}

// ----------------- Create Chat Box -----------------
function createChatBox(html, classes) {
  const div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

// ----------------- Handle Text Chat -----------------
function handleChatResponse(message) {
  // User message
  const userHtml = `
        <img src="OIP.webp" alt="" id="userImage" width="50">
        <div class="user-chat-area">${message}</div>
    `;
  const userChatBox = createChatBox(userHtml, "user-chat-box");
  chatContainer.appendChild(userChatBox);

  promptInput.value = ""; // Clear input

  // AI loader
  const aiHtml = `
        <img src="ai-png-image-generator.png" alt="" id="aiImage" width="80">
        <div class="ai-chat-area">
            <img src="loading.webp" alt="loading" width="30">
        </div>
    `;
  const aiChatBox = createChatBox(aiHtml, "ai-chat-box");
  chatContainer.appendChild(aiChatBox);

  // Gemini response
  generateResponse(aiChatBox, message);
}

// ----------------- Voice Output (AI speaks) -----------------
function speakText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-US";
  window.speechSynthesis.speak(speech);
}

// ----------------- Voice Input (Speech to Text) -----------------
function startVoiceRecognition() {
  const recognition =
    new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;
    handleChatResponse(spokenText);
  };

  recognition.start();
}

// ----------------- Image Upload Feature -----------------
async function handleImageUpload(file) {
  if (!file) return alert("Please select an image!");

  // Convert image to Base64 for Gemini API
  const reader = new FileReader();
  reader.onload = async function (e) {
    const base64Image = e.target.result.split(",")[1]; // Remove data:image prefix

    // Show user image in chat
    const userHtml = `
        <img src="OIP.webp" alt="" id="userImage" width="50">
        <div class="user-chat-area">[Image Uploaded]</div>
    `;
    const userChatBox = createChatBox(userHtml, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    // AI loader
    const aiHtml = `
        <img src="ai-png-image-generator.png" alt="" id="aiImage" width="80">
        <div class="ai-chat-area">
            <img src="loading.webp" alt="loading" width="30">
        </div>
    `;
    const aiChatBox = createChatBox(aiHtml, "ai-chat-box");
    chatContainer.appendChild(aiChatBox);

    // Send to Gemini API
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY, //  key header में भेज रहे हैं
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: "Describe this image in detail" },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        }),
      });

      const result = await response.json();
      const aiText =
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No description found.";

      aiChatBox.querySelector(".ai-chat-area").innerText = aiText;
      speakText(aiText);
    } catch (error) {
      aiChatBox.querySelector(".ai-chat-area").innerText =
        "Error: " + error.message;
      console.error("Image Upload Error:", error);
    }
  };

  reader.readAsDataURL(file);
}

// ----------------- Event Listeners -----------------

// Text send button
submitBtn.addEventListener("click", () => {
  if (promptInput.value.trim() !== "") {
    handleChatResponse(promptInput.value.trim());
  }
});

// Enter key
promptInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && promptInput.value.trim() !== "") {
    handleChatResponse(promptInput.value.trim());
  }
});

// Image button click -> open file picker
imageBtn.addEventListener("click", () => {
  imageInput.click();
});

// When file selected
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  handleImageUpload(file);
});

// Voice button click
voiceBtn.addEventListener("click", () => {
  startVoiceRecognition();
});

