let addItemForm = document.querySelector("#addItemForm");
let itemsList = document.querySelector(".actionItems");
let storage = chrome.storage.sync;
let actionItemsUtils = new ActionItems();

storage.get(["actionItems", "name"], (data) => {
  let actionItems = data.actionItems;
  let name = data.name;
  setUsersName(name);
  setGreeting();
  setGreetingImage();
  createQuickActionListener();
  renderActionItems(actionItems);
  createUpdateNameDialogListener();
  createUpdateNameListener();
  actionItemsUtils.setProgress();
  chrome.storage.onChanged.addListener(() => {
    actionItemsUtils.setProgress();
  });
});

const setUsersName = (name) => {
  let newName = name ? name : "Add Name";
  document.querySelector(".name__value").innerText = newName;
};

const renderActionItems = (actionItems) => {
  actionItems.forEach((item) => {
    renderActionItem(item.text, item.id, item.completed, item.website);
  });
};

const createUpdateNameDialogListener = () => {
  let greetingName = document.querySelector(".greeting__name");
  greetingName.addEventListener("click", () => {
    // open modal
    storage.get(["name"], (data) => {
      let name = data.name ? data.name : "";
      document.getElementById("inputName").value = name;
    });
    $("#updateNameModal").modal("show");
  });
};

const handleUpdateName = (e) => {
  // get input text
  const name = document.getElementById("inputName").value;
  if (name) {
    // save name
    actionItemsUtils.saveName(name, () => {
      // set the user's name in front end
      setUsersName(name);
      // close modal
      $("#updateNameModal").modal("hide");
    });
  }
};

const createUpdateNameListener = () => {
  let element = document.querySelector("#updateName");
  element.addEventListener("click", handleUpdateName);
};

const handleQuickActionListener = (e) => {
  const text = e.target.getAttribute("data-text");
  const id = e.target.getAttribute("data-id");
  getCurrentTab().then((tab) => {
    actionItemsUtils.addQuickActionItem(id, text, tab, (actionItem) => {
      renderActionItem(
        actionItem.text,
        actionItem.id,
        actionItem.completed,
        actionItem.website
      );
    });
  });
};

const createQuickActionListener = () => {
  let buttons = document.querySelectorAll(".quick-action");
  buttons.forEach((button) => {
    button.addEventListener("click", handleQuickActionListener);
  });
};

async function getCurrentTab() {
  return await new Promise((resolve, reject) => {
    chrome.tabs.query(
      // prettier-ignore
      { 'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT },
      (tabs) => {
        resolve(tabs[0]);
      }
    );
  });
}

addItemForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let itemText = addItemForm.elements.namedItem("itemText").value;
  if (itemText) {
    actionItemsUtils.add(itemText, null, (actionItem) => {
      renderActionItem(
        actionItem.text,
        actionItem.id,
        actionItem.completed,
        actionItem.website
      );
      addItemForm.elements.namedItem("itemText").value = "";
    });
  }
});

const handleCompletedEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute("data-id");
  const parent = e.target.parentElement.parentElement;

  if (parent.classList.contains("completed")) {
    actionItemsUtils.markUnmarkCompleted(id, null);
    parent.classList.remove("completed");
  } else {
    actionItemsUtils.markUnmarkCompleted(id, new Date().toString());
    parent.classList.add("completed");
  }
};

const handleDeleteEventListener = (e) => {
  const id = e.target.parentElement.parentElement.getAttribute("data-id");
  const parent = e.target.parentElement.parentElement;
  // remove from Chrome storage
  actionItemsUtils.remove(id, () => {
    parent.remove();
  });
};

const renderActionItem = (text, id, completed, website = null) => {
  let element = document.createElement("div");
  element.classList.add("actionItem__item");
  let mainElement = document.createElement("div");
  mainElement.classList.add("actionItem__main");
  let checkEl = document.createElement("div");
  checkEl.classList.add("actionItem__check");
  let textEl = document.createElement("div");
  textEl.classList.add("actionItem__text");
  let deleteEl = document.createElement("div");
  deleteEl.classList.add("actionItem__delete");

  checkEl.innerHTML = `
    <div class="actionItem__checkbox">
      <i class="fas fa-check" aria-hidden="true"></i>
    </div>
  `;

  if (completed) {
    element.classList.add("completed");
  }

  element.setAttribute("data-id", id);
  deleteEl.addEventListener("click", handleDeleteEventListener);
  checkEl.addEventListener("click", handleCompletedEventListener);
  textEl.textContent = text;
  deleteEl.innerHTML = `<i class="fas fa-times"></i>`;
  mainElement.appendChild(checkEl);
  mainElement.appendChild(textEl);
  mainElement.appendChild(deleteEl);
  element.appendChild(mainElement);
  if (website) {
    let linkContainer = createLinkContainer(
      website.url,
      website.fav_icon,
      website.title
    );
    element.appendChild(linkContainer);
  }
  itemsList.prepend(element);
};

const createLinkContainer = (url, favIcon, title) => {
  let element = document.createElement("div");
  element.classList.add("actionItem__linkContainer");
  element.innerHTML = `
    <a href="${url}" target="_blank">
      <div class="actionItem__link">
        <div class="actionItem__favIcon">
          <img src="${favIcon}" alt="" />
        </div>
        <div class="actionItem__title">
          <span>${title}</span>
        </div>
      </div>
    </a>
  `;
  return element;
};

const setGreeting = () => {
  let greeting = "Good ";
  const date = new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour <= 11) {
    greeting += "Morning,";
  } else if (hour >= 12 && hour <= 16) {
    greeting += "Afternoon,";
  } else if (hour >= 17 && hour <= 20) {
    greeting += "Evening,";
  } else {
    greeting += "Night,";
  }
  document.querySelector(".greeting__type").innerText = greeting;
};

const setGreetingImage = () => {
  let image = document.getElementById("greeting__image");
  const date = new Date();
  const hour = date.getHours();

  if (hour >= 5 && hour <= 11) {
    image.src = "./images/good-morning.png";
  } else if (hour >= 12 && hour <= 16) {
    image.src = "./images/good-afternoon.png";
  } else if (hour >= 17 && hour <= 20) {
    image.src = "./images/good-evening.png";
  } else {
    image.src = "./images/good-night.png";
  }
};
