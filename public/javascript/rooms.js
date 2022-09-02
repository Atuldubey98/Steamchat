var socket = io();
let chatsNode = document.getElementById("chats");
let chatBox = document.getElementById("chatBox");
let messageNode = document.getElementById("message");
let recipientId = document.getElementById("recipientId");
const getMessageNode = (data) => {
  let div = document.createElement("div");
  div.style.maxWidth = "80%";
  div.style.width = "fit-content";
  let p = document.createElement("p");
  div.className = `bg-success text-wrap m-1 p-2 rounded float-right`;
  p.innerText = data;
  p.className = "text-white";
  div.appendChild(p);
  return div;
};
const getStatusNode = (data, isConnected) => {
  let div = document.createElement("div");
  let p = document.createElement("p");
  div.style.width = "fit-content";
  div.className = isConnected ? "bg-info" : "bg-danger";
  div.classList.add("p-2", "m-1", "rounded", "text-white");
  p.innerText = data;
  div.appendChild(p);
  return div;
};

window.onload = (e) => {
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  if (params == null || params.chat == null) {
    console.log("Empty");
    return;
  }

  recipientId.innerText = params.chat;
  chatsNode.innerHTML = "";
  socket.on(params.chat, (data) => {
    console.log(data);
    if (data?.isWelcome) {
      chatsNode.appendChild(getStatusNode(data.message, true));
    } else {
      chatsNode.appendChild(getMessageNode(data.message));
    }
    chatsNode.scrollTop = chatsNode.scrollHeight;
  });
  socket.on("disconnect", () => {
    chatsNode.appendChild(getStatusNode("User disconnected", false));
    chatsNode.scrollTop = chatsNode.scrollHeight;
  });
  messageNode.focus();
};

chatBox.onsubmit = (e) => {
  e.preventDefault();
  if (!messageNode || messageNode.value < 1) return;
  const data = {
    message: messageNode.value,
    isWelcome: false,
    room: recipientId.innerText,
  };
  socket.emit("message", data);
  messageNode.value = "";
};

const getValidate = (room) => {
  if (room.length < 3) {
    return true;
  }
  for (let i = 0; i < room.length; i++) {
    if (room.charAt(i) === " ") {
      return true;
    }
  }
  return false;
};
const openPromptForRoom = async () => {
  console.log("Opened");
  let room = prompt("Please enter a room name:");
  if (room == null || room === "" || getValidate(room)) {
    alert("Please enter room without space or length should be greater than 3");
    return;
  }
  const input = {
	room
  }
  const response = await fetch("/create-room", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  if (response.status === 200) {
	location.reload();
  }
};
