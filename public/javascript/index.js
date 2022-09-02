let userForm = document.getElementById("userForm");
let inputUserName = document.getElementById("inputUserName");
let userError = document.getElementById("form-error");
window.onload = (e) => {
  userError.style.display = "none";
};
userForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!inputUserName || inputUserName.value.length < 3) {
    userError.style.display = "inline";
    setTimeout(() => {
      userError.style.display = "none";
    }, 5000);
    return;
  }
  const input = { username: inputUserName.value };

  const response = await fetch("/register", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const data = await response.json();
  localStorage.setItem("username", inputUserName.value);
  window.location.replace("/rooms");
};
