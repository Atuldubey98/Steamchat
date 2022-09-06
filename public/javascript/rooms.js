var socket = io();
let chatsNode = document.getElementById("chats");
let chatBox = document.getElementById("chatBox");
let messageNode = document.getElementById("message");
let recipientId = document.getElementById("recipientId");
let listOfRooms = document.getElementById("list-of-rooms");
let rightDiv = document.getElementById("right-divId");
const getMessageNode = (data, sender) => {
  let masterDiv = document.createElement("div");
  masterDiv.className =
    sender === localStorage.getItem("username")
      ? "d-flex justify-content-start align-items-center m-3"
      : "d-flex justify-content-end align-items-center m-3";
  let div = document.createElement("div");
  div.style.maxWidth = "80%";
  div.style.width = "fit-content";
  let p = document.createElement("p");
  let senderNode = document.createElement("p");
  senderNode.style.fontSize = "0.5rem";
  senderNode.innerText = sender;
  senderNode.className = `text-capitalize`;
  div.className = `${
    sender === localStorage.getItem("username") ? "bg-success" : "bg-info"
  } text-wrap m-1 p-1 rounded float-right`;
  p.innerText = data;
  p.className = "text-white";
  div.appendChild(p);
  masterDiv.appendChild(senderNode);
  masterDiv.appendChild(div);
  return masterDiv;
};
const getStatusNode = (data, isConnected, sender) => {
  let masterDiv = document.createElement("div");
  masterDiv.style.backgroundColor = isConnected ? "#1b1b55" : "black";
  masterDiv.style.color = "white";
  masterDiv.className = `d-flex justify-content-center align-items-center`;
  let div = document.createElement("div");
  div.className = `d-flex justify-content-center align-items-center`;
  let p = document.createElement("p");
  div.style.width = "fit-content";
  let small = document.createElement("small");
  small.innerText = data;
  p.appendChild(small);
  div.appendChild(p);
  if (!sender) masterDiv.appendChild(div);
  return masterDiv;
};

window.onload = async (e) => {
  const username = localStorage.getItem("username");
  if (!username) {
    location.href = "/";
  }
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  if (params == null || params.chat == null) {
    console.log("Empty");
    rightDiv.style.display = "none";
    return;
  }
  rightDiv.style.display = "inline";
  try {
    const response = await fetch(`/check?room=${params.chat}`);
    const data = await response.json();
    if (!data?.status) {
      location.href = "/";
    }
  } catch (error) {
    return;
  }
  recipientId.innerText = params.chat;
  chatsNode.innerHTML = "";
  socket.on(params.chat, (data) => {
    if (data?.isWelcome) {
      chatsNode.appendChild(
        getStatusNode(data?.message, true, data?.socket === socket.id)
      );
    } else {
      chatsNode.appendChild(getMessageNode(data?.message, data?.sender));
    }
    chatsNode.scrollTop = chatsNode.scrollHeight;
  });

  socket.on("disconnect", () => {
    chatsNode.appendChild(getStatusNode("User disconnected", false, false));
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
    sender: localStorage.getItem("username"),
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
    room,
  };
  const response = await fetch("/create-room", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (response.status === 200) {
    location.reload();
  } else {
    alert("Some error occured");
  }
};

const logout = () => {
  if (confirm("Do you want to logout ?")) {
    localStorage.clear();
    window.location.replace("/");
  } else {
    console.log("Cannnot logout");
  }
};
const deleteRoom = async (room) => {
  if (!room || room.length == 0) {
    return;
  }
  try {
    const response = await fetch(`/delete-room?room=${room}`, {
      method: "DELETE",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data.status) {
      window.location.replace("/rooms");
    }else{
      console.log("Some error occured");
    }
  } catch (e) {
    console.log(e);
  }
};
