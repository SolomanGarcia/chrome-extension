let actionItemsUtils = new ActionItems();

chrome.contextMenus.create({
  id: "linkSiteMenu",
  title: "Link site for later",
  contexts: ["all"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId == "linkSiteMenu") {
    actionItemsUtils.addQuickActionItem(
      "quick-action-2",
      "Read this site",
      tab,
      () => {
        actionItemsUtils.setProgress();
      }
    );
  }
});
